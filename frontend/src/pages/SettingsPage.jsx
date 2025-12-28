import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { Mail, Info } from 'lucide-react';

const SettingsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserSettings();
    }, []);

    const fetchUserSettings = async () => {
        try {
            const res = await api.get(`/auth/user/${user.userId}`);
            setEmailNotifications(res.data.emailNotificationsEnabled || false);
        } catch (error) {
            console.error('Failed to load settings', error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleEmailNotifications = async () => {
        try {
            const newValue = !emailNotifications;
            await api.put(`/auth/user/${user.userId}`, {
                emailNotificationsEnabled: newValue.toString()
            });
            setEmailNotifications(newValue);
            toast.success(newValue ? 'Email notifications enabled!' : 'Email notifications disabled');
        } catch (error) {
            console.error('Failed to update settings', error);
            toast.error('Failed to update settings');
        }
    };

    if (loading) {
        return <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
    }

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '2rem' }}>Settings</h1>

            {/* Email Notifications */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            background: '#e0f2fe',
                            borderRadius: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Mail size={24} color="#0284c7" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, marginBottom: '0.25rem' }}>Email Notifications</h3>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                Receive order updates and notifications via email
                            </p>
                        </div>
                    </div>

                    {/* Toggle Switch */}
                    <label style={{ position: 'relative', display: 'inline-block', width: '60px', height: '34px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={emailNotifications}
                            onChange={handleToggleEmailNotifications}
                            style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span style={{
                            position: 'absolute',
                            cursor: 'pointer',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: emailNotifications ? 'var(--primary)' : '#ccc',
                            transition: '0.4s',
                            borderRadius: '34px'
                        }}>
                            <span style={{
                                position: 'absolute',
                                content: '""',
                                height: '26px',
                                width: '26px',
                                left: emailNotifications ? '30px' : '4px',
                                bottom: '4px',
                                backgroundColor: 'white',
                                transition: '0.4s',
                                borderRadius: '50%'
                            }}></span>
                        </span>
                    </label>
                </div>
            </div>


            {/* About */}
            <div className="card">
                <button
                    onClick={() => navigate('/about')}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        textAlign: 'left'
                    }}
                >
                    <div style={{
                        width: '48px',
                        height: '48px',
                        background: '#ddd6fe',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Info size={24} color="#7c3aed" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0, marginBottom: '0.25rem' }}>About</h3>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                            Learn more about DUKANAM
                        </p>
                    </div>
                </button>
            </div>

            {/* Back Button */}
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button onClick={() => navigate(-1)} className="btn btn-outline">
                    Go Back
                </button>
            </div>
        </div>
    );
};

export default SettingsPage;
