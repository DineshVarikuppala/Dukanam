import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';

const NotificationDropdown = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    const fetchNotifications = async () => {
        try {
            const res = await api.get(`/notifications/unread?userId=${user.userId}`);
            setNotifications(res.data);
            setUnreadCount(res.data.length);
        } catch (error) {
            console.error("Failed to fetch notifications");
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Poll for notifications every 30 seconds
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const handleMarkAsRead = async (notification) => {
        try {
            await api.put(`/notifications/${notification.id}/read`);
            // Optimistically update
            const updated = notifications.filter(n => n.id !== notification.id);
            setNotifications(updated);
            setUnreadCount(updated.length);
            setIsOpen(false);

            // Redirect logic
            if (notification.relatedProfileRequestId) {
                // Extract user ID from notification message or fetch the request
                try {
                    const res = await api.get(`/profile-requests/${notification.relatedProfileRequestId}`);
                    const userId = res.data.user.userId;
                    navigate(`/admin/users/${userId}`);
                } catch (error) {
                    console.error('Failed to navigate to user details', error);
                }
            } else if (notification.message.includes('Support Ticket')) {
                navigate('/help');
            } else if (user.role === 'STORE_OWNER') {
                navigate('/store-orders');
            } else {
                navigate('/orders');
            }
        } catch (error) {
            console.error("Failed to mark read");
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', color: 'black' }}
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: -5,
                        right: -5,
                        background: 'red',
                        color: 'white',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '40px',
                    right: 0,
                    width: '300px',
                    background: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    zIndex: 1000,
                    maxHeight: '400px',
                    overflowY: 'auto'
                }}>
                    <div style={{ padding: '0.8rem', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>
                        Notifications
                    </div>
                    {notifications.length === 0 ? (
                        <div style={{ padding: '1rem', textAlign: 'center', color: '#888' }}>
                            No new notifications
                        </div>
                    ) : (
                        notifications.map(n => (
                            <div
                                key={n.id}
                                onClick={() => handleMarkAsRead(n)}
                                style={{
                                    padding: '0.8rem',
                                    borderBottom: '1px solid #eee',
                                    cursor: 'pointer',
                                    background: '#fff',
                                    transition: 'background 0.2s',
                                    fontSize: '0.9rem'
                                }}
                                onMouseEnter={(e) => e.target.style.background = '#f9f9f9'}
                                onMouseLeave={(e) => e.target.style.background = '#fff'}
                            >
                                {n.message}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
