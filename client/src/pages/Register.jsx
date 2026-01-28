import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        dob: '',
        gender: ''
    });
    const [error, setError] = useState('');

    const { username, email, password, confirmPassword, dob, gender } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('Passwords do not match');
        } else {
            try {
                // Pass dob instead of age
                await register(username, email, password, dob, gender);
                // AuthContext will update state, effectively logging the user in.
                // We can redirect to dashboard or let the router handle it if it listens to auth state.
                // Explicit navigation just in case.
                navigate('/');
            } catch (err) {
                console.error("Registration Error:", err);
                setError(err.response?.data?.msg || err.message || 'Registration Failed');
            }
        }
    };

    return (
        <div className="auth-container">
            <div className="glass-panel auth-card">
                <h1 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '2rem' }}>
                    Create Account
                </h1>
                {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
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
                            style={{ colorScheme: 'dark' }}
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
                        Create Account
                    </button>
                </form>

                <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Already have an account? <span onClick={() => navigate('/login')} style={{ color: 'var(--primary)', textDecoration: 'none', cursor: 'pointer' }}>Login</span>
                </p>
            </div>
        </div>
    );
};

export default Register;
