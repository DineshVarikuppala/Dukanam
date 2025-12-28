import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle, XCircle, MessageSquare } from 'lucide-react';

const UserRequestsPage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [userDetails, setUserDetails] = useState(null);
    const [profileRequests, setProfileRequests] = useState([]);
    const [supportTickets, setSupportTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'support'

    useEffect(() => {
        fetchData();
    }, [userId]);

    const fetchData = async () => {
        try {
            const [userRes, profileRes, supportRes] = await Promise.all([
                api.get(`/admin/users/${userId}`),
                api.get(`/profile-requests/user/${userId}`),
                api.get(`/support/tickets?userId=${userId}`)
            ]);
            setUserDetails(userRes.data);
            setProfileRequests(profileRes.data);
            setSupportTickets(supportRes.data);
        } catch (error) {
            console.error('Error loading user requests:', error);
            toast.error('Failed to load user requests');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveRequest = async (requestId) => {
        try {
            await api.put(`/profile-requests/${requestId}/approve`);
            toast.success("Request approved");
            fetchData();
        } catch (error) {
            toast.error("Failed to approve request");
        }
    };

    const handleDeclineRequest = async (requestId) => {
        try {
            await api.put(`/profile-requests/${requestId}/decline`, { comment: "Declined by admin" });
            toast.success("Request declined");
            fetchData();
        } catch (error) {
            toast.error("Failed to decline request");
        }
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

            <div className="card" style={{ padding: '2rem' }}>
                <h1 style={{ marginTop: 0, marginBottom: '1rem' }}>Requests from {userDetails.firstName} {userDetails.lastName}</h1>
                <p style={{ color: '#666', marginBottom: '2rem' }}>User ID: {userDetails.userId} | Email: {userDetails.email}</p>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid #eee', marginBottom: '2rem' }}>
                    <button
                        onClick={() => setActiveTab('profile')}
                        style={{
                            padding: '1rem 1.5rem',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'profile' ? '3px solid var(--primary)' : '3px solid transparent',
                            color: activeTab === 'profile' ? 'var(--primary)' : '#666',
                            fontWeight: activeTab === 'profile' ? 'bold' : 'normal',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        Profile Update Requests ({profileRequests.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('support')}
                        style={{
                            padding: '1rem 1.5rem',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'support' ? '3px solid var(--primary)' : '3px solid transparent',
                            color: activeTab === 'support' ? 'var(--primary)' : '#666',
                            fontWeight: activeTab === 'support' ? 'bold' : 'normal',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        Support Tickets ({supportTickets.length})
                    </button>
                </div>

                {/* Profile Update Requests Tab */}
                {activeTab === 'profile' && (
                    <div>
                        {profileRequests.length === 0 ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>
                                No profile update requests from this user
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {profileRequests.map(request => {
                                    let changes = {};
                                    try {
                                        changes = JSON.parse(request.changeData);
                                    } catch (e) { }

                                    return (
                                        <div key={request.requestId} style={{
                                            border: '1px solid #eee',
                                            borderRadius: '8px',
                                            padding: '1.5rem',
                                            background: request.status === 'PENDING' ? '#fef3c7' : '#fff'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                                <div>
                                                    <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                                        Request #{request.requestId}
                                                    </div>
                                                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                                        Submitted: {new Date(request.createdAt).toLocaleString()}
                                                    </div>
                                                </div>
                                                <span style={{
                                                    padding: '0.4rem 0.8rem',
                                                    borderRadius: '20px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '500',
                                                    background: request.status === 'APPROVED' ? '#d1fae5' :
                                                        request.status === 'DECLINED' ? '#fee2e2' : '#fef3c7',
                                                    color: request.status === 'APPROVED' ? '#065f46' :
                                                        request.status === 'DECLINED' ? '#991b1b' : '#92400e'
                                                }}>
                                                    {request.status}
                                                </span>
                                            </div>

                                            {Object.keys(changes).map(field => (
                                                <div key={field} style={{ marginBottom: '1rem' }}>
                                                    <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', textTransform: 'capitalize' }}>
                                                        {field === 'mobileNumber' ? 'Mobile Number' : field}:
                                                    </div>
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

                                            {request.adminComment && (
                                                <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f3f4f6', borderRadius: '0.5rem' }}>
                                                    <strong>Admin Comment:</strong> {request.adminComment}
                                                </div>
                                            )}

                                            {request.status === 'PENDING' && (
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
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Support Tickets Tab */}
                {activeTab === 'support' && (
                    <div>
                        {supportTickets.length === 0 ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>
                                No support tickets from this user
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {supportTickets.map(ticket => (
                                    <div key={ticket.ticketId} style={{
                                        border: '1px solid #eee',
                                        borderRadius: '8px',
                                        padding: '1.5rem',
                                        background: ticket.status === 'OPEN' ? '#dbeafe' : '#fff'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                            <div>
                                                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                                    <MessageSquare size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                                    Ticket #{ticket.ticketId}
                                                </div>
                                                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                                    Created: {new Date(ticket.createdAt).toLocaleString()}
                                                </div>
                                            </div>
                                            <span style={{
                                                padding: '0.4rem 0.8rem',
                                                borderRadius: '20px',
                                                fontSize: '0.85rem',
                                                fontWeight: '500',
                                                background: ticket.status === 'RESOLVED' ? '#d1fae5' : '#dbeafe',
                                                color: ticket.status === 'RESOLVED' ? '#065f46' : '#1e40af'
                                            }}>
                                                {ticket.status}
                                            </span>
                                        </div>

                                        <div style={{ marginBottom: '1rem' }}>
                                            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Subject:</div>
                                            <div>{ticket.subject}</div>
                                        </div>

                                        <div style={{ marginBottom: '1rem' }}>
                                            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Message:</div>
                                            <div style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
                                                {ticket.message}
                                            </div>
                                        </div>

                                        {ticket.messages && ticket.messages.length > 0 && (
                                            <div>
                                                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Conversation ({ticket.messages.length} messages):</div>
                                                <div style={{ maxHeight: '200px', overflowY: 'auto', padding: '0.5rem' }}>
                                                    {ticket.messages.map((msg, idx) => (
                                                        <div key={idx} style={{
                                                            marginBottom: '0.5rem',
                                                            padding: '0.75rem',
                                                            background: msg.isAdmin ? '#e0f2fe' : '#f3f4f6',
                                                            borderRadius: '0.5rem'
                                                        }}>
                                                            <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>
                                                                {msg.isAdmin ? 'Admin' : 'User'} - {new Date(msg.createdAt).toLocaleString()}
                                                            </div>
                                                            <div>{msg.message}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => navigate('/help')}
                                            className="btn btn-outline"
                                            style={{ marginTop: '1rem' }}
                                        >
                                            View in Support Dashboard
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserRequestsPage;
