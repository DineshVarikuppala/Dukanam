import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { Send, X, Search, User, ShoppingBag, Edit } from 'lucide-react';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState({ CUSTOMER: [], STORE_OWNER: [] });
    const [stats, setStats] = useState({});
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState('ALL');
    const [activeTab, setActiveTab] = useState('DASHBOARD'); // DASHBOARD, SUPPORT

    // User Details Navigation
    const handleUserClick = (userId) => {
        navigate(`/admin/users/${userId}`);
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            await api.put(`/orders/${orderId}/status`, { status: newStatus });
            toast.success("Order status updated");
            // Refresh details
            if (selectedUser) {
                const res = await api.get(`/admin/users/${selectedUser}`);
                setUserDetails(res.data);
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    // Chat States
    const [activeTicket, setActiveTicket] = useState(null);
    const [ticketMessages, setTicketMessages] = useState([]);
    const [replyMessage, setReplyMessage] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (activeTicket) {
            fetchTicketMessages(activeTicket.ticketId);
            const interval = setInterval(() => fetchTicketMessages(activeTicket.ticketId), 3000);
            return () => clearInterval(interval);
        }
    }, [activeTicket]);

    useEffect(() => {
        scrollToBottom();
    }, [ticketMessages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchData = async () => {
        try {
            const [usersRes, statsRes, ticketsRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/admin/stats'),
                api.get('/support/tickets')
            ]);
            setUsers(usersRes.data);
            setStats(statsRes.data);
            setTickets(ticketsRes.data);
        } catch (error) {
            console.error('Failed to fetch admin data:', error);
            toast.error('Failed to load admin dashboard');
        } finally {
            setLoading(false);
        }
    };

    const fetchTicketMessages = async (ticketId) => {
        try {
            const res = await api.get(`/support/tickets/${ticketId}/messages`);
            setTicketMessages(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!replyMessage.trim() || !activeTicket) return;

        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return;
            const user = JSON.parse(userStr);

            await api.post(`/support/tickets/${activeTicket.ticketId}/messages?senderId=${user.userId}`, {
                content: replyMessage
            });
            setReplyMessage('');
            fetchTicketMessages(activeTicket.ticketId);
        } catch (error) {
            toast.error("Failed to send reply");
        }
    };

    const filterUsers = () => {
        let allUsers = [];
        if (selectedRole === 'ALL') {
            allUsers = [...users.CUSTOMER, ...users.STORE_OWNER];
        } else {
            allUsers = users[selectedRole] || [];
        }
        if (searchQuery.trim()) {
            return allUsers.filter(user =>
                user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.mobileNumber?.includes(searchQuery)
            );
        }
        return allUsers;
    };

    const filteredUsers = filterUsers();

    // Filter orders inside modal
    const getFilteredOrders = () => {
        if (!userDetails?.orders) return [];
        if (!orderSearch.trim()) return userDetails.orders;
        return userDetails.orders.filter(o => o.orderId.toString() === orderSearch.trim());
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading Admin Dashboard...</div>;

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem', position: 'relative' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ margin: '0 0 0.5rem' }}>Admin Dashboard</h1>
                    <p style={{ color: '#666', margin: 0 }}>Manage users and support tickets</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className={`btn ${activeTab === 'DASHBOARD' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setActiveTab('DASHBOARD')}
                    >
                        Overview
                    </button>
                    <button
                        className={`btn ${activeTab === 'SUPPORT' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setActiveTab('SUPPORT')}
                    >
                        Support Tickets ({tickets.length})
                    </button>
                </div>
            </div>

            {activeTab === 'DASHBOARD' ? (
                <>
                    {/* Statistics Cards */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1.5rem',
                        marginBottom: '2rem'
                    }}>
                        <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.totalUsers || 0}</div>
                            <div style={{ color: '#666', marginTop: '0.5rem' }}>Total Users</div>
                        </div>
                        <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{stats.totalCustomers || 0}</div>
                            <div style={{ color: '#666', marginTop: '0.5rem' }}>Customers</div>
                        </div>
                        <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{stats.totalStoreOwners || 0}</div>
                            <div style={{ color: '#666', marginTop: '0.5rem' }}>Store Owners</div>
                        </div>
                        <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>{stats.totalOrders || 0}</div>
                            <div style={{ color: '#666', marginTop: '0.5rem' }}>Total Orders</div>
                        </div>
                    </div>

                    {/* Manage Screens Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div className="card" style={{
                            padding: '2rem', textAlign: 'center', cursor: 'pointer',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
                            transition: 'transform 0.2s', border: '1px solid #eee'
                        }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            onClick={() => navigate('/admin/manage-buyer')}
                        >
                            <div style={{ background: '#e0f2fe', padding: '1rem', borderRadius: '50%', color: '#0284c7' }}>
                                <ShoppingBag size={32} />
                            </div>
                            <h3 style={{ margin: 0 }}>Manage Buyer Screens</h3>
                            <p style={{ margin: 0, color: '#666' }}>Customize layout & features for buyers</p>
                        </div>

                        <div className="card" style={{
                            padding: '2rem', textAlign: 'center', cursor: 'pointer',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
                            transition: 'transform 0.2s', border: '1px solid #eee'
                        }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            onClick={() => toast('Manage Seller Screens - Coming Soon')}
                        >
                            <div style={{ background: '#fef3c7', padding: '1rem', borderRadius: '50%', color: '#d97706' }}>
                                <User size={32} />
                            </div>
                            <h3 style={{ margin: 0 }}>Manage Sellers Screens</h3>
                            <p style={{ margin: 0, color: '#666' }}>Customize dashboard & tools for sellers</p>
                        </div>
                    </div>

                    {/* Search and Filter */}
                    <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input-field"
                                style={{ flex: 1, minWidth: '250px' }}
                            />
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="input-field"
                                style={{ minWidth: '150px' }}
                            >
                                <option value="ALL">All Roles</option>
                                <option value="CUSTOMER">Customers</option>
                                <option value="STORE_OWNER">Store Owners</option>
                            </select>
                        </div>
                    </div>

                    {/* Users List */}
                    <div>
                        <h2 style={{ marginBottom: '1rem' }}>Users ({filteredUsers.length})</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                            {filteredUsers.map((user) => (
                                <div
                                    key={user.userId}
                                    className="card"
                                    style={{ padding: '1.5rem', cursor: 'pointer', transition: 'transform 0.2s', border: '1px solid transparent' }}
                                    onClick={() => handleUserClick(user.userId)}
                                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'transparent'; }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                        <div>
                                            <h3 style={{ margin: '0 0 0.25rem' }}>{user.firstName} {user.lastName}</h3>
                                            <span style={{
                                                display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600',
                                                background: user.role === 'CUSTOMER' ? '#dbeafe' : '#fef3c7',
                                                color: user.role === 'CUSTOMER' ? '#1e40af' : '#92400e'
                                            }}>
                                                {user.role === 'CUSTOMER' ? 'Customer' : 'Store Owner'}
                                            </span>
                                        </div>
                                        <div style={{
                                            background: 'var(--primary)', color: 'white', borderRadius: '50%', width: '48px', height: '48px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold'
                                        }}>
                                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
                                        <div>📧 {user.email}</div>
                                        <div>📱 {user.mobileNumber}</div>
                                        <div>📦 {user.orderCount} orders</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {filteredUsers.length === 0 && <p style={{ textAlign: 'center', color: '#999', margin: '2rem' }}>No users found</p>}
                    </div>
                </>
            ) : (
                /* Support Tickets Tab */
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', height: '70vh' }}>
                    {/* Ticket List */}
                    <div className="card" style={{ padding: '0', overflowY: 'auto' }}>
                        <div style={{ padding: '1rem', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>All Tickets</div>
                        {tickets.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>No tickets yet</div>
                        ) : (
                            tickets.map(ticket => (
                                <div
                                    key={ticket.ticketId}
                                    onClick={() => setActiveTicket(ticket)}
                                    style={{
                                        padding: '1rem',
                                        borderBottom: '1px solid #eee',
                                        cursor: 'pointer',
                                        background: activeTicket?.ticketId === ticket.ticketId ? '#f0f9ff' : 'white',
                                        borderLeft: activeTicket?.ticketId === ticket.ticketId ? '4px solid var(--primary)' : '4px solid transparent'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                        <span style={{ fontWeight: '600' }}>#{ticket.ticketId} {ticket.user.firstName}</span>
                                        <small style={{ color: '#888' }}>{new Date(ticket.updatedAt).toLocaleDateString()}</small>
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: '#555', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {ticket.subject || 'No Subject'}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Chat Window */}
                    <div className="card" style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
                        {!activeTicket ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888' }}>
                                Select a ticket to view conversation
                            </div>
                        ) : (
                            <>
                                <div style={{ padding: '1rem', borderBottom: '1px solid #eee', background: '#f8f9fa' }}>
                                    <h3 style={{ margin: 0 }}>Ticket #{activeTicket.ticketId} - <span style={{ fontWeight: 'normal' }}>{activeTicket.subject}</span></h3>
                                    <small>User: {activeTicket.user.firstName} {activeTicket.user.lastName} ({activeTicket.user.email})</small>
                                </div>

                                <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', background: '#fff' }}>
                                    {ticketMessages.map((msg) => {
                                        const userStr = localStorage.getItem('user');
                                        const currentUser = userStr ? JSON.parse(userStr) : {};
                                        const isMe = msg.sender.userId === currentUser.userId;

                                        return (
                                            <div
                                                key={msg.messageId}
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: isMe ? 'flex-end' : 'flex-start',
                                                    marginBottom: '1rem'
                                                }}
                                            >
                                                <div style={{
                                                    maxWidth: '70%',
                                                    padding: '0.8rem 1rem',
                                                    borderRadius: '12px',
                                                    background: isMe ? 'var(--primary)' : '#f1f1f1',
                                                    color: isMe ? 'white' : 'black',
                                                }}>
                                                    {!isMe && <div style={{ fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '0.25rem', color: '#555' }}>{msg.sender.firstName}</div>}
                                                    <p style={{ margin: 0 }}>{msg.content}</p>
                                                    <div style={{ fontSize: '0.7rem', marginTop: '0.4rem', textAlign: 'right', opacity: 0.7 }}>
                                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                <form onSubmit={handleSendReply} style={{ padding: '1rem', borderTop: '1px solid #eee', display: 'flex', gap: '1rem' }}>
                                    <input
                                        type="text"
                                        value={replyMessage}
                                        onChange={(e) => setReplyMessage(e.target.value)}
                                        placeholder="Type your reply..."
                                        style={{ flex: 1, padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!replyMessage.trim()}
                                        className="btn btn-primary"
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                    >
                                        Send <Send size={16} />
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* User Details Navigation implemented via navigate */}
        </div>
    );
};

export default AdminDashboard;
