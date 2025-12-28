import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { ArrowLeft, Clock, LogIn, LogOut } from 'lucide-react';

const UserLoginStatsPage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [userDetails, setUserDetails] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalSessions: 0,
        avgDuration: 0,
        totalDuration: 0,
        activeSessions: 0
    });

    useEffect(() => {
        fetchData();
    }, [userId]);

    const fetchData = async () => {
        try {
            const [userRes, sessionsRes] = await Promise.all([
                api.get(`/admin/users/${userId}`),
                api.get(`/login-sessions/user/${userId}`)
            ]);
            setUserDetails(userRes.data);
            setSessions(sessionsRes.data);
            calculateStats(sessionsRes.data);
        } catch (error) {
            console.error('Error loading login stats:', error);
            toast.error('Failed to load login statistics');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (sessionData) => {
        const totalSessions = sessionData.length;
        const activeSessions = sessionData.filter(s => !s.logoutTime).length;

        const completedSessions = sessionData.filter(s => s.logoutTime);
        const totalDuration = completedSessions.reduce((sum, s) => sum + (s.durationInSeconds || 0), 0);
        const avgDuration = completedSessions.length > 0 ? totalDuration / completedSessions.length : 0;

        setStats({
            totalSessions,
            avgDuration,
            totalDuration,
            activeSessions
        });
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '-';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours}h ${minutes}m ${secs}s`;
    };

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return '-';
        const date = new Date(dateTimeString);
        return date.toLocaleString();
    };

    if (loading) {
        return <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
    }

    if (!userDetails) {
        return <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>User not found</div>;
    }

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem' }}>
            <button
                onClick={() => navigate(`/admin/users/${userId}`)}
                className="btn btn-outline"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}
            >
                <ArrowLeft size={16} /> Back to User Details
            </button>

            <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h1 style={{ marginTop: 0, marginBottom: '1rem' }}>Login/Logout Statistics</h1>
                <p style={{ color: '#666', marginBottom: '2rem' }}>
                    {userDetails.firstName} {userDetails.lastName} | User ID: {userDetails.userId}
                </p>

                {/* Summary Statistics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{ padding: '1.5rem', background: '#f3f4f6', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Total Sessions</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.totalSessions}</div>
                    </div>
                    <div style={{ padding: '1.5rem', background: '#f3f4f6', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Active Sessions</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{stats.activeSessions}</div>
                    </div>
                    <div style={{ padding: '1.5rem', background: '#f3f4f6', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Avg Session Duration</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#6366f1' }}>{formatDuration(Math.floor(stats.avgDuration))}</div>
                    </div>
                    <div style={{ padding: '1.5rem', background: '#f3f4f6', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Total Time Logged In</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>{formatDuration(stats.totalDuration)}</div>
                    </div>
                </div>

                {/* Sessions Table */}
                <h2 style={{ marginBottom: '1rem' }}>Session History</h2>
                <div style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
                    {sessions.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>
                            No login sessions found for this user
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                            <thead style={{ background: '#f3f4f6' }}>
                                <tr>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Session ID</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>
                                        <LogIn size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                        Login Time
                                    </th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>
                                        <LogOut size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                        Logout Time
                                    </th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>
                                        <Clock size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                        Duration
                                    </th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessions.map(session => (
                                    <tr key={session.sessionId} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '1rem', fontWeight: 'bold' }}>#{session.sessionId}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <div>{formatDateTime(session.loginTime)}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div>{formatDateTime(session.logoutTime)}</div>
                                        </td>
                                        <td style={{ padding: '1rem', fontWeight: '500' }}>
                                            {formatDuration(session.durationInSeconds)}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.4rem 0.8rem',
                                                borderRadius: '20px',
                                                fontSize: '0.85rem',
                                                fontWeight: '500',
                                                background: session.logoutTime ? '#d1fae5' : '#fef3c7',
                                                color: session.logoutTime ? '#065f46' : '#92400e'
                                            }}>
                                                {session.logoutTime ? 'Completed' : 'Active'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Simple Bar Chart Visualization */}
                {sessions.length > 0 && (
                    <div style={{ marginTop: '3rem' }}>
                        <h2 style={{ marginBottom: '1rem' }}>Session Duration Chart</h2>
                        <div style={{ padding: '2rem', background: '#f9fafb', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '300px' }}>
                                {sessions.slice(0, 20).reverse().map((session, idx) => {
                                    const maxDuration = Math.max(...sessions.map(s => s.durationInSeconds || 0));
                                    const height = session.durationInSeconds ? (session.durationInSeconds / maxDuration) * 100 : 5;

                                    return (
                                        <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <div
                                                style={{
                                                    width: '100%',
                                                    height: `${height}%`,
                                                    background: session.logoutTime ? 'var(--primary)' : '#f59e0b',
                                                    borderRadius: '4px 4px 0 0',
                                                    transition: 'all 0.3s',
                                                    cursor: 'pointer'
                                                }}
                                                title={`Session #${session.sessionId}: ${formatDuration(session.durationInSeconds)}`}
                                            />
                                            <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '0.5rem', transform: 'rotate(-45deg)', transformOrigin: 'left' }}>
                                                #{session.sessionId}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div style={{ marginTop: '2rem', display: 'flex', gap: '2rem', justifyContent: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '20px', height: '20px', background: 'var(--primary)', borderRadius: '4px' }} />
                                    <span style={{ fontSize: '0.9rem' }}>Completed Sessions</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '20px', height: '20px', background: '#f59e0b', borderRadius: '4px' }} />
                                    <span style={{ fontSize: '0.9rem' }}>Active Sessions</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserLoginStatsPage;
