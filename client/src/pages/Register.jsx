import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const navigate = useNavigate();
    const { register, verifyOtp } = useAuth();
    const [step, setStep] = useState(1); // 1 = Details, 2 = OTP
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        dob: '', // Changed from age to dob
        gender: ''
    });
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');

    const { username, email, password, confirmPassword, dob, gender } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmitDetails = async e => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('Passwords do not match');
        } else {
            try {
                // Pass dob instead of age
                await register(username, email, password, dob, gender);
                setStep(2);
            } catch (err) {
                console.error("Registration Error:", err);
                setError(err.response?.data?.msg || err.message || 'Registration Failed');
            }
        }
    };

    const onSubmitOtp = async e => {
        e.preventDefault();
        try {
            await verifyOtp(email, otp);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.msg || 'Verification Failed');
        }
    };

    return (
        <div className="auth-container">
            <div className="glass-panel auth-card">
                <h1 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '2rem' }}>
                    {step === 1 ? 'Create Account' : 'Verify Email'}
                </h1>
                {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                {step === 1 ? (
                    <form onSubmit={onSubmitDetails} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', marginLeft: '0.5rem', fontSize: '0.9rem' }}>Username</label>
                            <input
                                type="text"
                                name="username"
                                value={username}
                                onChange={onChange}
                                placeholder="FlowMaster"
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', marginLeft: '0.5rem', fontSize: '0.9rem' }}>Date of Birth</label>
                            <input
                                type="date"
                                name="dob"
                                value={dob}
                                onChange={onChange}
                                required
                                style={{ colorScheme: 'dark' }} // Ensures calendar icon is visible in dark mode
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', marginLeft: '0.5rem', fontSize: '0.9rem' }}>Gender</label>
                            <select
                                name="gender"
                                value={gender}
                                onChange={onChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.8rem 1rem',
                                    border: 'none',
                                    borderRadius: '1rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'var(--text-light)',
                                    fontSize: '1rem'
                                }}
                            >
                                <option value="" disabled>Select Gender</option>
                                <option value="Male" style={{ color: 'black' }}>Male</option>
                                <option value="Female" style={{ color: 'black' }}>Female</option>
                                <option value="Other" style={{ color: 'black' }}>Other</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', marginLeft: '0.5rem', fontSize: '0.9rem' }}>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={email}
                                onChange={onChange}
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', marginLeft: '0.5rem', fontSize: '0.9rem' }}>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={password}
                                onChange={onChange}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', marginLeft: '0.5rem', fontSize: '0.9rem' }}>Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={onChange}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', marginTop: '1rem' }}>
                            Send Verification Code
                        </button>
                    </form>
                ) : (
                    <form onSubmit={onSubmitOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                            We sent a 6-digit code to {email}.
                        </p>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', marginLeft: '0.5rem', fontSize: '0.9rem' }}>Verification Code</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={e => setOtp(e.target.value)}
                                placeholder="123456"
                                required
                                maxLength="6"
                                style={{ textAlign: 'center', letterSpacing: '2px', fontSize: '1.2rem' }}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', marginTop: '1rem' }}>
                            Verify & Login
                        </button>
                        <button type="button" onClick={() => setStep(1)} className="btn btn-secondary" style={{ justifyContent: 'center' }}>
                            Back
                        </button>
                    </form>
                )}

                <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
