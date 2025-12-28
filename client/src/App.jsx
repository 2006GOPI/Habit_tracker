import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import History from './pages/History';
import Reports from './pages/Reports';
import Tools from './pages/Tools';
import Settings from './pages/Settings';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex-center" style={{ height: '100vh' }}>Loading...</div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex-center" style={{ height: '100vh' }}>Loading...</div>;
  return isAuthenticated ? <Navigate to="/dashboard" /> : children;
};

const AppContent = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="app-container">
      {isAuthenticated && <Navbar theme={theme} toggleTheme={toggleTheme} />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route
          path="/dashboard"
          element={<PrivateRoute><Dashboard /></PrivateRoute>}
        />
        <Route
          path="/history"
          element={<PrivateRoute><History /></PrivateRoute>}
        />
        <Route
          path="/reports"
          element={<PrivateRoute><Reports /></PrivateRoute>}
        />
        <Route
          path="/tools"
          element={<PrivateRoute><Tools /></PrivateRoute>}
        />
        <Route
          path="/settings"
          element={<PrivateRoute><Settings theme={theme} toggleTheme={toggleTheme} /></PrivateRoute>}
        />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
