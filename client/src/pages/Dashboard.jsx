import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle, Circle, Plus, TrendingUp, Calendar as CalIcon, Search, Trash2 } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import MoodTracker from '../components/MoodTracker';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const Dashboard = () => {
    const { user } = useAuth();
    const [mood, setMood] = useState(null);
    const [habits, setHabits] = useState([]);
    const [allMoods, setAllMoods] = useState([]);

    // Habit Creation State
    const [newHabitName, setNewHabitName] = useState('');
    const [newHabitDesc, setNewHabitDesc] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // Search State
    const [searchTerm, setSearchTerm] = useState('');

    const [loading, setLoading] = useState(true);

    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    // Birthday Check Logic
    useEffect(() => {
        if (user && user.dob) {
            const today = new Date();
            const birthDate = new Date(user.dob);
            if (today.getMonth() === birthDate.getMonth() && today.getDate() === birthDate.getDate()) {
                setShowConfetti(true);

                // Check localStorage to send email only once per year
                const year = today.getFullYear();
                const key = `birthdayWishSent_${user.id}_${year}`;
                if (!localStorage.getItem(key)) {
                    api.post('/auth/birthday-wish').catch(err => console.error(err));
                    localStorage.setItem(key, 'true');
                }
            }
        }
    }, [user]);

    const fetchData = async () => {
        try {
            const [habitsRes, moodsRes] = await Promise.all([
                api.get('/habits'),
                api.get('/moods')
            ]);
            setHabits(habitsRes.data);
            setAllMoods(moodsRes.data);

            // Check if mood logged today
            const today = new Date().toISOString().split('T')[0];
            const todaysMood = moodsRes.data.find(m => m.date && m.date.startsWith(today));
            if (todaysMood) setMood(todaysMood.score);

            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const addHabit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/habits', {
                name: newHabitName,
                description: newHabitDesc,
                category: 'General'
            });
            setHabits([...habits, res.data]);
            setNewHabitName('');
            setNewHabitDesc('');
            setIsAdding(false);
        } catch (err) {
            console.error(err);
        }
    };

    const deleteHabit = async (id, e) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this habit?")) return;
        try {
            await api.delete(`/habits/${id}`);
            setHabits(habits.filter(h => h.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const toggleHabit = async (habit) => {
        try {
            const today = new Date().toISOString().split('T')[0];
            // Check current status from logs
            const todayLog = habit.HabitLogs && habit.HabitLogs.find(log => log.date && log.date.startsWith(today));
            const status = !todayLog?.status; // Toggle

            await api.post('/habits/log', { habitId: habit.id, date: today, status });

            // Refetch to update UI accurately (or we could optimistic update)
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const logMood = async (score) => {
        try {
            await api.post('/moods', { score, note: 'Dashboard Log' });
            setMood(score);
            fetchData(); // Update chart
        } catch (err) {
            console.error(err);
        }
    };

    const isHabitCompletedToday = (habit) => {
        const today = new Date().toISOString().split('T')[0];
        return habit.HabitLogs && habit.HabitLogs.some(log => log.date && log.date.startsWith(today) && log.status);
    };

    // Filter Habits
    const filteredHabits = habits.filter(h =>
        h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (h.description && h.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const moodsList = [
        { emoji: '😖', score: 1, label: 'Terrible', color: '#ff4d4d' },
        { emoji: '😔', score: 2, label: 'Bad', color: '#ffa502' },
        { emoji: '😐', score: 3, label: 'Okay', color: '#f1c40f' },
        { emoji: '🙂', score: 4, label: 'Good', color: '#2ed573' },
        { emoji: '🤩', score: 5, label: 'Amazing', color: '#3742fa' }
    ];

    // Generate Chart Data from Real Moods
    const chartData = useMemo(() => {
        // Get last 7 days
        const labels = [];
        const dataPoints = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));

            // Find mood for this day
            const found = allMoods.find(m => m.date && m.date.startsWith(dateStr));
            dataPoints.push(found ? found.score : null);
        }

        return {
            labels,
            datasets: [{
                label: 'Mood Flow',
                data: dataPoints,
                borderColor: '#FF4D4D',
                backgroundColor: 'rgba(255, 77, 77, 0.2)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#FF4D4D',
                pointRadius: 4
            }]
        };
    }, [allMoods]);

    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (ctx) => {
                        const val = ctx.raw;
                        const m = moodsList.find(x => x.score === val);
                        return m ? `${m.label} (${val})` : val;
                    }
                }
            }
        },
        scales: {
            y: {
                min: 0,
                max: 6,
                ticks: { stepSize: 1, callback: (val) => moodsList.find(m => m.score === val)?.emoji || val }
            }
        }
    };

    if (loading) return <div className="flex-center" style={{ height: '80vh' }}>Loading Dashboard...</div>;

    return (
        <div className="page-content fade-in">
            <header className="header-section">
                <div>
                    <h1>Dashboard</h1>
                    <p className="text-muted">Overview of your daily progress</p>
                </div>
                <div className="date-badge">
                    <CalIcon size={16} style={{ marginRight: 8 }} /> {new Date().toLocaleDateString()}
                </div>
            </header>

            {/* Colorful Birthday Banner */}
            {showConfetti && (
                <div className="mb-2 fade-in" style={{
                    padding: '2rem',
                    borderRadius: 'var(--radius)',
                    background: 'linear-gradient(45deg, #FF0099, #493240, #00DBDE, #FC00FF)',
                    backgroundSize: '400% 400%',
                    animation: 'gradientBG 15s ease infinite',
                    color: 'white',
                    textAlign: 'center',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <style>
                        {`
                        @keyframes gradientBG {
                            0% { background-position: 0% 50%; }
                            50% { background-position: 100% 50%; }
                            100% { background-position: 0% 50%; }
                        }
                        `}
                    </style>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                        🎂 Happy Birthday to You! 🎶
                    </h1>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '400', marginBottom: '1rem' }}>
                        Happy Birthday to You! Happy Birthday to <span style={{ fontWeight: 'bold', textDecoration: 'underline' }}>{user.username}</span>!
                    </h2>
                    <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>Wishing you a magical day filled with joy! ✨🎉🎈</p>
                </div>
            )}

            {/* Mood Section - Now using dedicated component */}
            <MoodTracker />

            <div className="grid-2" style={{ marginTop: '2rem' }}>
                {/* Habits Section */}
                <div className="glass-panel">
                    <div className="flex-between mb-2">
                        <h3><CheckCircle size={20} className="text-success" style={{ marginRight: 8 }} /> Daily Habits</h3>
                        <button className="btn-icon" onClick={() => setIsAdding(!isAdding)} title="Add Habit">
                            <Plus size={24} />
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="input-icon-wrapper mb-2">
                        <Search size={18} className="input-icon" />
                        <input
                            type="text"
                            placeholder="Search your habits..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', paddingLeft: '35px' }}
                        />
                    </div>

                    {/* Add Habit Form */}
                    {isAdding && (
                        <form onSubmit={addHabit} className="glass-panel mb-2" style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <div className="form-group mb-1">
                                <input
                                    autoFocus
                                    placeholder="Habit Name (e.g., Drink Water)"
                                    value={newHabitName}
                                    onChange={(e) => setNewHabitName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group mb-1">
                                <input
                                    placeholder="Description (Optional)"
                                    value={newHabitDesc}
                                    onChange={(e) => setNewHabitDesc(e.target.value)}
                                />
                            </div>
                            <div className="flex-end gap-1">
                                <button type="button" className="btn text-muted" onClick={() => setIsAdding(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save</button>
                            </div>
                        </form>
                    )}

                    <div className="habit-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {filteredHabits.length === 0 ? (
                            <div className="text-center text-muted p-2">
                                {searchTerm ? 'No matching habits found.' : 'No habits yet. Click + to add one!'}
                            </div>
                        ) : (
                            filteredHabits.map(habit => {
                                const completed = isHabitCompletedToday(habit);
                                return (
                                    <div key={habit.id} className="habit-item" onClick={() => toggleHabit(habit)}>
                                        <div className="flex-center gap-1">
                                            {completed ?
                                                <CheckCircle size={24} color="var(--success)" fill="rgba(46, 213, 115, 0.2)" /> :
                                                <Circle size={24} className="text-muted" />
                                            }
                                            <div>
                                                <div style={{
                                                    textDecoration: completed ? 'line-through' : 'none',
                                                    color: completed ? 'var(--text-muted)' : 'var(--text-main)',
                                                    opacity: completed ? 0.7 : 1,
                                                    fontWeight: '500'
                                                }}>
                                                    {habit.name}
                                                </div>
                                                {habit.description && (
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{habit.description}</div>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => deleteHabit(habit.id, e)}
                                            className="btn-icon text-danger hover-scale"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
