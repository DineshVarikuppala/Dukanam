import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { ArrowLeft, Search, CheckCircle, XCircle } from 'lucide-react';

const AdminUserDetailsPage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [totalRequestsCount, setTotalRequestsCount] = useState(0);
    const [totalSessionsCount, setTotalSessionsCount] = useState(0);

    useEffect(() => {
        fetchUserDetails();
        fetchPendingRequests();
        fetchTotalRequestsCount();
        fetchTotalSessionsCount();
    }, [userId]);

    const fetchUserDetails = async () => {
        try {
            const res = await api.get(`/admin/users/${userId}`);
            setUserDetails(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load user details");
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingRequests = async () => {
        try {
            const res = await api.get(`/profile-requests/user/${userId}/pending`);
            setPendingRequests(res.data);
        } catch (error) {
            console.error('Failed to load pending requests', error);
        }
    };

    const fetchTotalRequestsCount = async () => {
        try {
            const [profileRes, supportRes] = await Promise.all([
                api.get(`/profile-requests/user/${userId}`),
                api.get(`/support/tickets?userId=${userId}`)
            ]);
            const totalCount = profileRes.data.length + supportRes.data.length;
            setTotalRequestsCount(totalCount);
        } catch (error) {
            console.error('Failed to load total requests count', error);
        }
    };

    const fetchTotalSessionsCount = async () => {
        try {
            const res = await api.get(`/login-sessions/user/${userId}`);
            setTotalSessionsCount(res.data.length);
        } catch (error) {
            console.error('Failed to load sessions count', error);
        }
    };

    const handleApproveRequest = async (requestId) => {
        try {
            await api.put(`/profile-requests/${requestId}/approve`);
            toast.success("Request approved and user profile updated");
            fetchUserDetails();
            fetchPendingRequests();
        } catch (error) {
            toast.error("Failed to approve request");
        }
    };

    const handleDeclineRequest = async (requestId) => {
        try {
            await api.put(`/profile-requests/${requestId}/decline`, { comment: "Declined by admin" });
            toast.success("Request declined");
            fetchPendingRequests();
        } catch (error) {
            toast.error("Failed to decline request");
        }
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            await api.put(`/orders/${orderId}/status`, { status: newStatus });
            toast.success("Order status updated");
            fetchUserDetails(); // Refresh details to confirm status change
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading User Details...</div>;
    if (!userDetails) return <div style={{ padding: '2rem' }}>User not found</div>;

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem' }}>
            <button
                onClick={() => navigate('/admin-dashboard')}
                className="btn btn-outline"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}
            >
                <ArrowLeft size={16} /> Back to Dashboard
            </button>

            <div className="card" style={{ padding: '2rem' }}>
                <h1 style={{ marginTop: 0, marginBottom: '2rem' }}>User Details</h1>

                {/* Profile Info */}
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', background: '#f9f9f9', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
                    <div style={{
                        background: 'var(--primary)', color: 'white', borderRadius: '50%', width: '100px', height: '100px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 'bold'
                    }}>
                        {userDetails.firstName?.charAt(0)}{userDetails.lastName?.charAt(0)}
                    </div>
                    <div>
                        <h2 style={{ margin: '0 0 0.5rem' }}>{userDetails.firstName} {userDetails.lastName}</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 3rem', color: '#555' }}>
                            <div>📧 {userDetails.email}</div>
                            <div>📱 {userDetails.mobileNumber}</div>
                            <div>🆔 ID: {userDetails.userId}</div>
                            <div>🏷️ Role: {userDetails.role}</div>
                            <div>📅 Joined: {new Date(userDetails.createdAt).toLocaleDateString()}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pending Profile Update Requests */}
            {pendingRequests.length > 0 && (
                <div className="card" style={{ padding: '2rem', marginBottom: '2rem', background: '#fef3c7', border: '2px solid #f59e0b' }}>
                    <h2 style={{ marginTop: 0, color: '#92400e' }}>🔔 New Profile Update Requests</h2>
                    {pendingRequests.map(request => {
                        let changes = {};
                        try {
                            changes = JSON.parse(request.changeData);
                        } catch (e) { }

                        return (
                            <div key={request.requestId} style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '1rem' }}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <strong>Request ID:</strong> #{request.requestId} | <strong>Submitted:</strong> {new Date(request.createdAt).toLocaleString()}
                                </div>
                                {Object.keys(changes).map(field => (
                                    <div key={field} style={{ marginBottom: '1rem' }}>
                                        <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', textTransform: 'capitalize' }}>{field === 'mobileNumber' ? 'Mobile Number' : field}:</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div>
                                                <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Current</div>
                                                <div style={{ padding: '0.75rem', background: '#fee2e2', borderRadius: '0.5rem', color: '#991b1b' }}>
                                                    {changes[field].old}
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Requested</div>
                                                <div style={{ padding: '0.75rem', background: '#d1fae5', borderRadius: '0.5rem', color: '#065f46' }}>
                                                    {changes[field].new}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                    <button
                                        onClick={() => handleApproveRequest(request.requestId)}
                                        className="btn btn-primary"
                                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    >
                                        <CheckCircle size={18} /> Approve
                                    </button>
                                    <button
                                        onClick={() => handleDeclineRequest(request.requestId)}
                                        className="btn btn-outline"
                                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#dc2626', borderColor: '#dc2626' }}
                                    >
                                        <XCircle size={18} /> Decline
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
                {/* Orders Card */}
                <div
                    onClick={() => navigate(`/admin/users/${userId}/orders`)}
                    className="card"
                    style={{
                        padding: '2rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: '2px solid #e5e7eb'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
                        e.currentTarget.style.borderColor = 'var(--primary)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                        <div>
                            <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>Orders</h3>
                            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>View all orders from this user</p>
                        </div>
                        <div style={{
                            background: 'var(--primary)',
                            color: 'white',
                            borderRadius: '50%',
                            width: '50px',
                            height: '50px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            fontWeight: 'bold'
                        }}>
                            {userDetails.orders?.length || 0}
                        </div>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '1rem' }}>
                        Click to view detailed order history →
                    </div>
                </div>

                {/* User Requests Card */}
                <div
                    onClick={() => navigate(`/admin/users/${userId}/requests`)}
                    className="card"
                    style={{
                        padding: '2rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: '2px solid #e5e7eb'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
                        e.currentTarget.style.borderColor = 'var(--primary)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                        <div>
                            <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>User Requests</h3>
                            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Profile updates & support tickets</p>
                        </div>
                        <div style={{
                            background: '#f59e0b',
                            color: 'white',
                            borderRadius: '50%',
                            width: '50px',
                            height: '50px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            fontWeight: 'bold'
                        }}>
                            {totalRequestsCount}
                        </div>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '1rem' }}>
                        Click to view all requests →
                    </div>
                </div>

                {/* Login/Logout Statistics Card */}
                <div
                    onClick={() => navigate(`/admin/users/${userId}/login-stats`)}
                    className="card"
                    style={{
                        padding: '2rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: '2px solid #e5e7eb'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
                        e.currentTarget.style.borderColor = 'var(--primary)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                        <div>
                            <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>Login/Logout Statistics</h3>
                            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Session history & analytics</p>
                        </div>
                        <div style={{
                            background: '#10b981',
                            color: 'white',
                            borderRadius: '50%',
                            width: '50px',
                            height: '50px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            fontWeight: 'bold'
                        }}>
                            {totalSessionsCount}
                        </div>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '1rem' }}>
                        Click to view login/logout history →
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUserDetailsPage;
