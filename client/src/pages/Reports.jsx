import React, { useState, useEffect } from 'react';
import { BarChart as ChartIcon, PieChart as PieIcon, TrendingUp, Info } from 'lucide-react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import api from '../api/axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

const Reports = () => {
    const [moods, setMoods] = useState([]);
    const [habits, setHabits] = useState([]);
    const [focusLogs, setFocusLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [moodRes, habitRes, focusRes] = await Promise.all([
                    api.get('/moods'),
                    api.get('/history/habits'),
                    api.get('/history/focus')
                ]);
                setMoods(moodRes.data);
                setHabits(habitRes.data);
                setFocusLogs(focusRes.data);
            } catch (err) {
                console.error("Error fetching report data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const textColor = isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)';

    // 1. Pie Chart: Mood Distribution
    const moodCounts = { 'Happy': 0, 'Okay': 0, 'Sad': 0 };
    moods.forEach(m => {
        if (m.mood_score >= 4) moodCounts['Happy']++;
        else if (m.mood_score === 3) moodCounts['Okay']++;
        else moodCounts['Sad']++;
    });

    const pieData = {
        labels: ['Happy/Good', 'Okay', 'Sad/Bad'],
        datasets: [
            {
                data: [moodCounts['Happy'], moodCounts['Okay'], moodCounts['Sad']],
                backgroundColor: ['#2ed573', '#f1c40f', '#ff4757'],
                borderColor: ['#2ed573', '#f1c40f', '#ff4757'],
                borderWidth: 1,
            },
        ],
    };

    // 2. Bar Chart: Focus Time per Day (Last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    }).reverse();

    const focusDataPoints = last7Days.map(date => {
        const logs = focusLogs.filter(l => l.completedAt && l.completedAt.startsWith(date));
        return logs.reduce((sum, curr) => sum + (curr.duration || 0), 0);
    });

    const barData = {
        labels: last7Days.map(d => d.slice(5)), // MM-DD
        datasets: [
            {
                label: 'Focus Minutes',
                data: focusDataPoints,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
        ],
    };

    // 3. Line Chart: Habit Consistency (Mocked "Score" based on completion count)
    // Actually let's just show Total Habits Completed Trend
    const habitDataPoints = last7Days.map(date => {
        return habits.filter(h => h.date === date).length;
    });

    const lineData = {
        labels: last7Days.map(d => d.slice(5)),
        datasets: [
            {
                label: 'Habits Completed',
                data: habitDataPoints,
                borderColor: '#a55eea',
                backgroundColor: 'rgba(165, 94, 234, 0.5)',
                tension: 0.3,
            }
        ]
    };

    if (loading) return <div className="flex-center" style={{ height: '80vh' }}>Loading Analytics...</div>;

    return (
        <div className="page-content fade-in">
            <header className="header-section">
                <div>
                    <h1>Reports</h1>
                    <p className="text-muted">Deep dive into your data</p>
                </div>
            </header>

            <div className="grid-2">
                {/* Mood Distribution Pie */}
                <div className="glass-panel">
                    <h3 className="mb-2 flex-start gap-1"><PieIcon size={20} /> Mood Distribution</h3>
                    <div style={{ height: '250px', display: 'flex', justifyContent: 'center' }}>
                        <Pie
                            data={pieData}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: {
                                        position: 'right',
                                        labels: { color: textColor }
                                    }
                                }
                            }}
                        />
                    </div>
                    <div className="mt-2 p-1" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                        <Info size={16} style={{ display: 'inline', marginRight: '5px' }} />
                        This chart shows the breakdown of your logged moods. Try to keep the green section largest!
                    </div>
                </div>

                {/* Focus Time Bar */}
                <div className="glass-panel">
                    <h3 className="mb-2 flex-start gap-1"><ChartIcon size={20} /> Focus Consistency</h3>
                    <div style={{ height: '250px' }}>
                        <Bar
                            data={barData}
                            options={{
                                responsive: true,
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        grid: { color: gridColor },
                                        ticks: { color: textColor }
                                    },
                                    x: {
                                        grid: { color: gridColor },
                                        ticks: { color: textColor }
                                    }
                                },
                                plugins: {
                                    legend: { labels: { color: textColor } }
                                }
                            }}
                        />
                    </div>
                    <div className="mt-2 p-1" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                        <Info size={16} style={{ display: 'inline', marginRight: '5px' }} />
                        Daily focus minutes. Consistency is key to achieving deep work.
                    </div>
                </div>

                {/* Habit Trend Line */}
                <div className="glass-panel" style={{ gridColumn: 'span 2' }}>
                    <h3 className="mb-2 flex-start gap-1"><TrendingUp size={20} /> Habit Trend</h3>
                    <div style={{ height: '250px' }}>
                        <Line
                            data={lineData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: { stepSize: 1, color: textColor },
                                        grid: { color: gridColor }
                                    },
                                    x: {
                                        ticks: { color: textColor },
                                        grid: { color: gridColor }
                                    }
                                },
                                plugins: {
                                    legend: { labels: { color: textColor } }
                                }
                            }}
                        />
                    </div>
                    <div className="mt-2 p-1" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                        <Info size={16} style={{ display: 'inline', marginRight: '5px' }} />
                        This worm chart shows your habit completion volume over the last week. Keep the line moving up!
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
