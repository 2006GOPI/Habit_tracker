import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, Settings, Wrench, Moon, Sun, LogOut, Calendar, BarChart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ theme, toggleTheme }) => {
    const location = useLocation();
    const { logout } = useAuth();

    const isActive = (path) => location.pathname === path;

    const navStyle = {
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        width: '80px',
        background: 'var(--bg-card)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2rem 0',
        zIndex: 1000
    };

    const linkStyle = (active) => ({
        padding: '12px',
        borderRadius: '12px',
        marginBottom: '1rem',
        color: active ? 'var(--primary)' : 'var(--text-muted)',
        background: active ? 'rgba(255, 77, 77, 0.1)' : 'transparent',
        transition: 'all 0.3s ease',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    });

    return (
        <nav style={navStyle}>
            <div style={{ marginBottom: '3rem', fontWeight: 'bold', color: 'var(--primary)' }}>HT</div>

            <div style={{ flex: 1 }}>
                <Link to="/" style={linkStyle(isActive('/'))}>
                    <Home size={24} />
                </Link>
                <Link to="/dashboard" style={linkStyle(isActive('/dashboard'))}>
                    <LayoutDashboard size={24} />
                </Link>
                <Link to="/history" style={linkStyle(isActive('/history'))}>
                    <Calendar size={24} />
                </Link>
                <Link to="/reports" style={linkStyle(isActive('/reports'))}>
                    <BarChart size={24} />
                </Link>
                <Link to="/tools" style={linkStyle(isActive('/tools'))}>
                    <Wrench size={24} />
                </Link>
                <Link to="/settings" style={linkStyle(isActive('/settings'))}>
                    <Settings size={24} />
                </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button onClick={toggleTheme} style={{ ...linkStyle(false), border: 'none', cursor: 'pointer' }}>
                    {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
                </button>
                <button onClick={logout} style={{ ...linkStyle(false), border: 'none', cursor: 'pointer', color: 'var(--danger)' }}>
                    <LogOut size={24} />
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
