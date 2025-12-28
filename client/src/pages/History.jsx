import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Activity, CheckCircle } from 'lucide-react';
import api from '../api/axios';

const History = () => {
    const [focusLogs, setFocusLogs] = useState([]);
    const [healthLogs, setHealthLogs] = useState([]);
    const [habitLogs, setHabitLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const [focusRes, healthRes, habitsRes] = await Promise.all([
                    api.get('/history/focus'),
                    api.get('/history/health'),
                    api.get('/history/habits')
                ]);
                setFocusLogs(focusRes.data);
                setHealthLogs(healthRes.data);
                setHabitLogs(habitsRes.data);
            } catch (err) {
                console.error("Failed to fetch history", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) return <div className="flex-center" style={{ height: '80vh' }}>Loading History...</div>;

    const formatDate = (dateString) => new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formatJustDate = (dateString) => new Date(dateString).toLocaleDateString();

    return (
        <div className="page-content fade-in">
            <header className="header-section">
                <div>
                    <h1>History</h1>
                    <p className="text-muted">Track your consistency over time</p>
                </div>
            </header>

            <div className="grid-3">
                {/* Focus History */}
                <div className="glass-panel">
                    <h3 className="flex-start gap-1 mb-2">
                        <Clock size={20} color="var(--primary)" /> Focus Sessions
                    </h3>
                    <div className="scroll-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {focusLogs.length === 0 ? <p className="text-muted text-center">No focus sessions yet.</p> : (
                            focusLogs.map(log => (
                                <div key={log.id} style={{
                                    padding: '1rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    marginBottom: '0.5rem',
                                    borderRadius: '0.5rem',
                                    borderLeft: '3px solid var(--primary)'
                                }}>
                                    <div className="flex-between">
                                        <span style={{ fontWeight: 'bold' }}>{log.duration} mins</span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatDate(log.completedAt)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Health/Body Calc History */}
                <div className="glass-panel">
                    <h3 className="flex-start gap-1 mb-2">
                        <Activity size={20} color="var(--success)" /> Body Logs
                    </h3>
                    <div className="scroll-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {healthLogs.length === 0 ? <p className="text-muted text-center">No body calculations yet.</p> : (
                            healthLogs.map(log => (
                                <div key={log.id} style={{
                                    padding: '1rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    marginBottom: '0.5rem',
                                    borderRadius: '0.5rem',
                                    borderLeft: '3px solid var(--success)'
                                }}>
                                    <div style={{ fontSize: '0.9rem' }}>
                                        {/* Show BMI and Status if available, otherwise fallback to Weight */}
                                        {log.bmi ? (
                                            <>
                                                <div className="flex-between">
                                                    <span>BMI: <b>{log.bmi}</b></span>
                                                    <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)' }}>{log.status}</span>
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Weight: {log.weight} kg</div>
                                            </>
                                        ) : (
                                            <div>Weight: <b>{log.weight} kg</b></div>
                                        )}

                                        {log.bp_systolic && <div>BP: <b>{log.bp_systolic}/{log.bp_diastolic}</b></div>}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'right' }}>
                                        {formatJustDate(log.date)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Completed Habits */}
                <div className="glass-panel">
                    <h3 className="flex-start gap-1 mb-2">
                        <CheckCircle size={20} color="var(--secondary)" /> Completed Habits
                    </h3>
                    <div className="scroll-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {habitLogs.length === 0 ? <p className="text-muted text-center">No completed habits yet.</p> : (
                            habitLogs.map(log => (
                                <div key={log.id} style={{
                                    padding: '1rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    marginBottom: '0.5rem',
                                    borderRadius: '0.5rem',
                                    borderLeft: '3px solid var(--secondary)'
                                }}>
                                    <div className="flex-between">
                                        <span>{log.Habit ? log.Habit.name : 'Unknown Habit'}</span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatJustDate(log.date)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default History;
