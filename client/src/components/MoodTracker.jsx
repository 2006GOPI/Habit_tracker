import React, { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import api from '../api/axios';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const MoodTracker = () => {
    const [selectedMood, setSelectedMood] = useState(null);
    const [note, setNote] = useState('');
    const [moodHistory, setMoodHistory] = useState([]);

    const moods = [
        { score: 1, label: 'Terrible', emoji: '😣' },
        { score: 2, label: 'Bad', emoji: '😔' },
        { score: 3, label: 'Okay', emoji: '😐' },
        { score: 4, label: 'Good', emoji: '🙂' },
        { score: 5, label: 'Amazing', emoji: '🤩' }
    ];

    const fetchMoods = async () => {
        try {
            const res = await api.get('/moods');
            // Mock data if empty for visualization during dev (optional, but let's stick to real first)
            setMoodHistory(res.data);
        } catch (err) {
            console.error("Failed to fetch moods", err);
        }
    };

    useEffect(() => {
        fetchMoods();
    }, []);

    const handleSaveMood = async () => {
        if (!selectedMood) return;
        try {
            await api.post('/moods', {
                mood_score: selectedMood.score,
                note,
                date: new Date().toISOString().split('T')[0]
            });
            setSelectedMood(null);
            setNote('');
            fetchMoods(); // Refresh chart
        } catch (err) {
            console.error("Failed to save mood", err);
        }
    };

    // Process data for Chart
    // Get last 7 days
    const getLast7Days = () => {
        const dates = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            dates.push(d.toISOString().split('T')[0]);
        }
        return dates;
    };

    const labels = getLast7Days();
    const dataPoints = labels.map(date => {
        // Find mood for this date (take the latest if multiple)
        const entry = moodHistory.find(m => m.date === date);
        return entry ? entry.mood_score : null;
    });

    const chartData = {
        labels: labels.map(d => d.slice(5)), // Show MM-DD
        datasets: [
            {
                label: 'Mood Flow',
                data: dataPoints,
                borderColor: '#FF4D4D',
                backgroundColor: 'rgba(255, 77, 77, 0.5)',
                tension: 0.4,
                spanGaps: true
            }
        ]
    };

    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const textColor = isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)';

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: false
            }
        },
        scales: {
            y: {
                min: 0,
                max: 6,
                ticks: {
                    color: textColor,
                    callback: function (value) {
                        const map = { 1: '😣', 2: '😔', 3: '😐', 4: '🙂', 5: '🤩' };
                        return map[value] || '';
                    }
                },
                grid: {
                    color: gridColor
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: textColor
                }
            }
        }
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Mood Selector */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>How are you feeling today?</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    {moods.map(m => (
                        <div key={m.score}
                            onClick={() => setSelectedMood(m)}
                            style={{
                                cursor: 'pointer',
                                opacity: selectedMood?.score === m.score ? 1 : 0.7,
                                transform: selectedMood?.score === m.score ? 'scale(1.2)' : 'scale(1)',
                                filter: selectedMood?.score === m.score ? 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))' : 'none',
                                transition: 'all 0.3s ease',
                                textAlign: 'center'
                            }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem', filter: 'brightness(1.2) saturate(1.2)' }}>{m.emoji}</div>
                            <div style={{ fontSize: '0.8rem', color: m.score <= 2 ? 'var(--danger)' : m.score >= 4 ? 'var(--success)' : 'var(--warning)' }}>{m.label}</div>
                        </div>
                    ))}
                </div>
                {selectedMood && (
                    <div className="animate-fade-in">
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Why do you feel this way? (Optional)"
                            style={{
                                width: '100%',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '1rem',
                                color: 'var(--text-main)',
                                padding: '1rem',
                                marginBottom: '1rem',
                                resize: 'none'
                            }}
                        />
                        <button onClick={handleSaveMood} className="btn btn-primary" style={{ width: '100%' }}>
                            Log Mood
                        </button>
                    </div>
                )}
            </div>

            {/* Weekly Chart */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Weekly Flow</h3>
                <div style={{ height: '200px' }}>
                    <Line data={chartData} options={options} />
                </div>
            </div>
        </div>
    );
};

export default MoodTracker;
