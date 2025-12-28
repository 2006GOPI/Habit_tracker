import React, { useState, useEffect } from 'react';
import { Activity, Clock, RotateCcw, Calculator, Calendar as CalIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axios';

const Tools = () => {
    // Focus Timer State
    const [duration, setDuration] = useState(25); // minutes
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [focusMode, setFocusMode] = useState('focus'); // focus, shortBreak, longBreak

    // Calculator State
    const [calcData, setCalcData] = useState({ age: '', gender: 'male', height: '', weight: '' });
    const [bmiResult, setBmiResult] = useState(null);

    // Calendar State
    const [currentDate, setCurrentDate] = useState(new Date());

    // Timer Logic
    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft(timeLeft - 1), 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            alert("Timer Completed!");
            if (focusMode === 'focus') {
                saveFocusSession(duration);
            }
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, duration, focusMode]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')} : ${secs.toString().padStart(2, '0')}`;
    };

    const handleDurationChange = (e) => {
        const val = parseInt(e.target.value);
        if (val > 0) {
            setDuration(val);
            if (!isActive) {
                setTimeLeft(val * 60);
            }
        }
    };

    const resetTimer = (mode = 'focus') => {
        setIsActive(false);
        setFocusMode(mode);
        if (mode === 'focus') {
            const d = duration || 25;
            setTimeLeft(d * 60);
        }
        if (mode === 'shortBreak') setTimeLeft(5 * 60);
        if (mode === 'longBreak') setTimeLeft(15 * 60);
    };

    // Save Focus Session
    const saveFocusSession = async (mins) => {
        try {
            await api.post('/history/focus', { duration: mins });
            // Optional: alert("Focus session saved!");
        } catch (err) {
            console.error("Failed to save focus session", err);
        }
    };

    // Calculator Logic
    const calculateBMI = async (e) => {
        e.preventDefault();
        const heightM = parseFloat(calcData.height) / 100;
        const weightKg = parseFloat(calcData.weight);

        if (heightM && weightKg) {
            const bmiVal = (weightKg / (heightM * heightM)).toFixed(1);
            let status = '';
            if (bmiVal < 18.5) status = 'Underweight';
            else if (bmiVal < 24.9) status = 'Normal Weight';
            else if (bmiVal < 29.9) status = 'Overweight';
            else status = 'Obese';

            // Ideal weight range
            const minIdeal = (18.5 * heightM * heightM).toFixed(1);
            const maxIdeal = (24.9 * heightM * heightM).toFixed(1);

            setBmiResult({ bmi: bmiVal, status, minIdeal, maxIdeal });

            // Save to History (HealthEntry)
            try {
                await api.post('/health', {
                    weight: weightKg,
                    bmi: parseFloat(bmiVal),
                    status: status,
                    date: new Date().toISOString().split('T')[0]
                });
            } catch (err) {
                console.error("Failed to save health entry", err);
            }
        }
    };

    // Simple Calendar Logic
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month, 1).getDay();
    };

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];


    return (
        <div className="page-content fade-in" style={{ paddingBottom: '4rem', overflowY: 'auto' }}>
            <header className="header-section">
                <div>
                    <h1>Wellness Tools</h1>
                    <p className="text-muted">Utilities to optimize your health and focus</p>
                </div>
            </header>

            <div className="grid-2">
                {/* Focus Timer */}
                <div className="glass-panel text-center">
                    <div className="mb-2">
                        <Clock size={40} className="text-secondary" style={{ marginBottom: '1rem' }} />
                        <h2>Focus Timer</h2>
                    </div>

                    <div style={{ fontSize: '4rem', fontWeight: 'bold', fontFamily: 'monospace', margin: '2rem 0' }}>
                        {formatTime(timeLeft)}
                    </div>

                    <div className="flex-center gap-1 mb-2">
                        <button onClick={() => setIsActive(!isActive)} className={`btn ${isActive ? 'btn-secondary' : 'btn-primary'}`}>
                            {isActive ? 'Pause' : 'Start Focus'}
                        </button>
                        <button onClick={() => resetTimer(focusMode)} className="btn-icon">
                            <RotateCcw size={20} />
                        </button>
                    </div>

                    <div className="flex-center gap-1">
                        <button onClick={() => resetTimer('shortBreak')} className="btn text-muted" style={{ fontSize: '0.8rem' }}>Short Break</button>
                        <button onClick={() => resetTimer('longBreak')} className="btn text-muted" style={{ fontSize: '0.8rem' }}>Long Break</button>
                    </div>

                    {/* Custom Duration Input */}
                    <div className="mt-2 flex-center" style={{ gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Set Duration (mins):</label>
                        <input
                            type="number"
                            style={{ width: '70px', padding: '5px', borderRadius: '5px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)', textAlign: 'center' }}
                            placeholder="25"
                            value={duration}
                            onChange={handleDurationChange}
                        />
                    </div>
                </div>

                {/* Calendar */}
                <div className="glass-panel">
                    <div className="flex-between mb-2">
                        <div className="flex-center gap-1">
                            <CalIcon size={24} className="text-primary" />
                            <h2>Calendar</h2>
                        </div>
                        <div className="flex-center gap-1">
                            <button onClick={prevMonth} className="btn-icon" style={{ width: '30px', height: '30px' }}><ChevronLeft size={16} /></button>
                            <span style={{ fontWeight: 'bold' }}>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                            <button onClick={nextMonth} className="btn-icon" style={{ width: '30px', height: '30px' }}><ChevronRight size={16} /></button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px', textAlign: 'center', fontSize: '0.9rem' }}>
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>{d}</div>)}
                        {days.map((d, i) => (
                            <div key={i} style={{
                                padding: '10px',
                                borderRadius: '8px',
                                background: d ? 'rgba(255,255,255,0.05)' : 'transparent',
                                color: d === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() ? 'var(--primary)' : 'var(--text-main)',
                                border: d === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() ? '1px solid var(--primary)' : 'none',
                                cursor: d ? 'pointer' : 'default'
                            }}>
                                {d}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Ideal Body Calculator */}
                <div className="glass-panel" style={{ gridColumn: 'span 2' }}>
                    <div className="flex-center mb-2 gap-1">
                        <Calculator size={24} className="text-success" />
                        <h2>Ideal Body Calc</h2>
                    </div>

                    <form onSubmit={calculateBMI} style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <div className="grid-2" style={{ gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
                            <div className="form-group">
                                <label className="text-muted" style={{ fontSize: '0.9rem' }}>Age</label>
                                <input
                                    type="number"
                                    value={calcData.age}
                                    onChange={e => setCalcData({ ...calcData, age: e.target.value })}
                                    placeholder="Years"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="text-muted" style={{ fontSize: '0.9rem' }}>Gender</label>
                                <select
                                    value={calcData.gender}
                                    onChange={e => setCalcData({ ...calcData, gender: e.target.value })}
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="text-muted" style={{ fontSize: '0.9rem' }}>Height (cm)</label>
                                <input
                                    type="number"
                                    value={calcData.height}
                                    onChange={e => setCalcData({ ...calcData, height: e.target.value })}
                                    placeholder="175"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="text-muted" style={{ fontSize: '0.9rem' }}>Weight (kg)</label>
                                <input
                                    type="number"
                                    value={calcData.weight}
                                    onChange={e => setCalcData({ ...calcData, weight: e.target.value })}
                                    placeholder="70"
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                            Calculate & Save
                        </button>
                    </form>

                    {bmiResult && (
                        <div className="mt-2 p-2" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', maxWidth: '800px', margin: '1rem auto 0' }}>
                            <div className="flex-around" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                                <div className="text-center">
                                    <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.9rem' }}>BMI Score</span>
                                    <span style={{ fontWeight: 'bold', fontSize: '1.5rem', color: 'var(--primary)' }}>{bmiResult.bmi}</span>
                                </div>
                                <div className="text-center">
                                    <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Status</span>
                                    <span style={{ fontSize: '1.2rem' }}>{bmiResult.status}</span>
                                </div>
                                <div className="text-center">
                                    <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Ideal Range</span>
                                    <span className="text-success" style={{ fontSize: '1.2rem' }}>{bmiResult.minIdeal}kg - {bmiResult.maxIdeal}kg</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Tools;
