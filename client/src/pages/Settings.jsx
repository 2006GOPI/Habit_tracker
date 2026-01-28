import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Save, Camera, Upload, Calendar, Accessibility } from 'lucide-react';
import api from '../api/axios';

const Settings = ({ theme, toggleTheme }) => {
    const { user, loadUser } = useAuth();
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });

    // Profile Data State
    const [profileData, setProfileData] = useState({
        username: '',
        email: '',
        age: '',
        gender: ''
    });

    const [profileImg, setProfileImg] = useState(null);
    const [previewImg, setPreviewImg] = useState(null);

    // Load user data into state
    useEffect(() => {
        if (user) {
            let userAge = user.age || '';
            if (!userAge && user.dob) {
                const birthDate = new Date(user.dob);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
                userAge = age;
            }

            setProfileData({
                username: user.username || '',
                email: user.email || '',
                age: userAge,
                gender: user.gender || ''
            });
            setProfileImg(user.profilePicture);
        }
    }, [user]);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        const { current, new: newPass, confirm } = passwordData;

        if (newPass !== confirm) {
            alert("New passwords do not match");
            return;
        }

        try {
            await api.put('/auth/password', { currentPassword: current, newPassword: newPass });
            alert("Password updated successfully");
            setPasswordData({ current: '', new: '', confirm: '' });
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.msg || "Failed to update password");
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImg(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const saveProfile = async (e) => {
        e.preventDefault();
        try {
            const updateData = {
                age: profileData.age,
                gender: profileData.gender
                // Username and email updates might be restricted or require different handling
            };

            // If new image, include it
            if (previewImg) {
                updateData.profilePicture = previewImg;
            }

            await api.put('/auth/profile', updateData);
            alert("Profile updated successfully!");
            // Refresh user?
            window.location.reload();
        } catch (err) {
            console.error("Failed to update profile", err);
            alert("Failed to update profile");
        }
    };

    return (
        <div className="page-content fade-in">
            <header className="header-section">
                <div>
                    <h1>Settings</h1>
                    <p className="text-muted">Manage your account preferences</p>
                </div>
            </header>

            <div className="grid-2">
                <div className="glass-panel">
                    <h3 className="mb-2">Profile Information</h3>

                    <form onSubmit={saveProfile}>
                        {/* Profile Picture Upload */}
                        <div className="flex-center flex-column mb-2">
                            <div style={{
                                width: '100px',
                                height: '100px',
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.1)',
                                overflow: 'hidden',
                                marginBottom: '1rem',
                                border: '2px solid var(--primary)',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                {previewImg || profileImg ? (
                                    <img src={previewImg || profileImg} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <User size={40} className="text-muted" />
                                )}
                            </div>
                            <label className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '5px 10px' }}>
                                <Upload size={14} /> Change Photo
                                <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                            </label>
                        </div>

                        <div className="form-group mb-2">
                            <label className="text-muted">Username</label>
                            <div className="input-icon-wrapper mt-1">
                                <User size={18} className="input-icon" />
                                <input value={profileData.username} disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} />
                            </div>
                        </div>
                        <div className="form-group mb-2">
                            <label className="text-muted">Email</label>
                            <div className="input-icon-wrapper mt-1">
                                <Mail size={18} className="input-icon" />
                                <input value={profileData.email} disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} />
                            </div>
                        </div>

                        <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group mb-2">
                                <label className="text-muted">Age</label>
                                <div className="input-icon-wrapper mt-1">
                                    <Calendar size={18} className="input-icon" />
                                    <input
                                        type="number"
                                        value={profileData.age}
                                        disabled
                                        style={{ opacity: 0.7, cursor: 'not-allowed' }}
                                        placeholder="Age"
                                    />
                                </div>
                            </div>
                            <div className="form-group mb-2">
                                <label className="text-muted">Gender</label>
                                <div className="input-icon-wrapper mt-1">
                                    <input
                                        value={profileData.gender}
                                        disabled
                                        style={{ opacity: 0.7, cursor: 'not-allowed' }}
                                        placeholder="Gender"
                                    />
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary mt-1" style={{ width: '100%' }} disabled={!previewImg}>
                            <Save size={18} /> Save Profile Photo
                        </button>
                    </form>
                </div>

                <div className="glass-panel">
                    <h3 className="mb-2">Security</h3>
                    <form onSubmit={handleChangePassword}>
                        <div className="form-group mb-2">
                            <label className="text-muted">Current Password</label>
                            <div className="input-icon-wrapper mt-1">
                                <Lock size={18} className="input-icon" />
                                <input
                                    type="password"
                                    placeholder="Current Password"
                                    value={passwordData.current}
                                    onChange={e => setPasswordData({ ...passwordData, current: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-group mb-2">
                            <label className="text-muted">New Password</label>
                            <div className="input-icon-wrapper mt-1">
                                <Lock size={18} className="input-icon" />
                                <input
                                    type="password"
                                    placeholder="New Password"
                                    value={passwordData.new}
                                    onChange={e => setPasswordData({ ...passwordData, new: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-group mb-2">
                            <label className="text-muted">Verify Password</label>
                            <div className="input-icon-wrapper mt-1">
                                <Lock size={18} className="input-icon" />
                                <input
                                    type="password"
                                    placeholder="Re-type New Password"
                                    value={passwordData.confirm}
                                    onChange={e => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary mt-1">
                            <Save size={18} /> Update Password
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Settings;
