import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';
import { MessageSquare, Send, X, Clock, ChevronRight } from 'lucide-react';

const HelpPage = () => {
    const { user } = useAuth();
    const [activeTicket, setActiveTicket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [historyTickets, setHistoryTickets] = useState([]);
    const messagesEndRef = useRef(null);

    const faqs = [
        "Why my order is late?",
        "Help with my order",
        "Where is my order?",
        "Why it is showing extra amount?",
        "Contact with customer care agent"
    ];

    useEffect(() => {
        if (user) {
            fetchTicketHistory();
            // Poll for history updates (unread counts) every 5 seconds
            const interval = setInterval(fetchTicketHistory, 5000);
            return () => clearInterval(interval);
        }
    }, [user]);

    useEffect(() => {
        if (activeTicket) {
            fetchMessages();
            markTicketRead(activeTicket.ticketId);
            // Poll for new messages every 3 seconds
            const interval = setInterval(() => fetchMessages(), 3000); // Only fetch, read marked once on entry or manual
            return () => clearInterval(interval);
        }
    }, [activeTicket]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchTicketHistory = async () => {
        if (!user) return;
        try {
            const res = await api.get(`/support/tickets?userId=${user.userId}`);
            setHistoryTickets(res.data);
        } catch (error) {
            console.error("Failed to load ticket history", error);
        }
    };

    const fetchMessages = async () => {
        if (!activeTicket) return;
        try {
            const res = await api.get(`/support/tickets/${activeTicket.ticketId}/messages`);
            setMessages(res.data);
            // Also mark as read periodically if open? Better just on focus or new fetch if count > 0.
            // For simplicity, we assume if you are viewing, you read them.
            // But we don't want to spam PUT calls.
            // Let's rely on initial open for now.
        } catch (error) {
            console.error("Failed to load messages", error);
        }
    };

    const markTicketRead = async (ticketId) => {
        try {
            await api.put(`/support/tickets/${ticketId}/read?userId=${user.userId}`);
            // Update local unread count
            setHistoryTickets(prev => prev.map(t =>
                t.ticketId === ticketId ? { ...t, unreadCount: 0 } : t
            ));
        } catch (error) {
            console.error("Failed to mark read");
        }
    };

    const handleQuestionClick = async (question) => {
        if (!user) {
            toast.error("Please login to chat with support");
            return;
        }
        setLoading(true);
        try {
            const res = await api.post(`/support/tickets?userId=${user.userId}&subject=${encodeURIComponent(question)}`);
            const ticket = res.data;
            setActiveTicket(ticket);

            // Send the question as the first message automatically
            await api.post(`/support/tickets/${ticket.ticketId}/messages?senderId=${user.userId}`, {
                content: question
            });

            fetchMessages();
            fetchTicketHistory(); // Refresh history
        } catch (error) {
            toast.error("Failed to start support session");
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeTicket) return;

        try {
            await api.post(`/support/tickets/${activeTicket.ticketId}/messages?senderId=${user.userId}`, {
                content: newMessage
            });
            setNewMessage('');
            fetchMessages();
        } catch (error) {
            toast.error("Failed to send message");
        }
    };

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>How can we help you? 🤝</h1>

            <div style={{ display: 'grid', gridTemplateColumns: activeTicket ? '1fr' : '1fr 1fr', gap: '2rem' }}>

                {/* Left Side: FAQs and History (Hidden on mobile if chat is active, or stacked) */}
                {!activeTicket && (
                    <>
                        {/* FAQs Section */}
                        <div>
                            <h3 style={{ marginBottom: '1rem', color: '#4b5563' }}>Common Questions</h3>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {faqs.map((faq, index) => (
                                    <div
                                        key={index}
                                        className="card"
                                        onClick={() => handleQuestionClick(faq)}
                                        style={{
                                            cursor: 'pointer',
                                            padding: '1rem 1.5rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            transition: 'transform 0.2s',
                                            border: '1px solid #e5e7eb'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateX(5px)';
                                            e.currentTarget.style.borderColor = 'var(--primary)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateX(0)';
                                            e.currentTarget.style.borderColor = '#e5e7eb';
                                        }}
                                    >
                                        <span style={{ fontSize: '1rem', fontWeight: '500' }}>{faq}</span>
                                        <MessageSquare size={18} color="var(--primary)" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Tickets Section */}
                        <div>
                            <h3 style={{ marginBottom: '1rem', color: '#4b5563' }}>Your Recent Tickets</h3>
                            {historyTickets.length === 0 ? (
                                <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', fontStyle: 'italic' }}>
                                    No support history
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
                                    {historyTickets.map((ticket) => (
                                        <div
                                            key={ticket.ticketId}
                                            className="card"
                                            onClick={() => setActiveTicket(ticket)}
                                            style={{
                                                cursor: 'pointer',
                                                padding: '1rem',
                                                borderLeft: '4px solid var(--primary)',
                                                transition: 'background 0.2s',
                                                position: 'relative'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>#{ticket.ticketId}</span>
                                                <small style={{ color: '#6b7280', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Clock size={12} />
                                                    {new Date(ticket.updatedAt).toLocaleDateString()}
                                                </small>
                                            </div>
                                            <div style={{ fontWeight: '500', marginBottom: '0.25rem', paddingRight: '20px' }}>{ticket.subject}</div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ fontSize: '0.8rem', color: ticket.status === 'OPEN' ? '#059669' : '#6b7280', fontWeight: '600' }}>
                                                    {ticket.status}
                                                </div>
                                                {ticket.unreadCount > 0 && (
                                                    <span style={{
                                                        background: '#ef4444',
                                                        color: 'white',
                                                        borderRadius: '999px',
                                                        padding: '0.1rem 0.5rem',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {ticket.unreadCount} new
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Right Side: Chat Interface (Full width if active) */}
                {activeTicket && (
                    <div style={{ gridColumn: '1 / -1', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                        <button
                            onClick={() => {
                                setActiveTicket(null);
                                fetchTicketHistory();
                            }}
                            style={{
                                marginBottom: '1rem',
                                background: 'none',
                                border: 'none',
                                color: '#6b7280',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontWeight: '500'
                            }}
                        >
                            ← Back to Help Center
                        </button>

                        <div className="card" style={{ height: '70vh', display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
                            {/* Chat Header */}
                            <div style={{
                                padding: '1rem',
                                borderBottom: '1px solid #eee',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: 'var(--primary)',
                                color: 'white'
                            }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Support Chat</h3>
                                    <small style={{ opacity: 0.9 }}>Ticket #{activeTicket.ticketId}: {activeTicket.subject}</small>
                                </div>
                                <button
                                    onClick={() => setActiveTicket(null)}
                                    style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Messages Area */}
                            <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', background: '#f9f9f9' }}>
                                {messages.length === 0 && (
                                    <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: '2rem' }}>
                                        Start the conversation...
                                    </div>
                                )}
                                {messages.map((msg) => {
                                    const isMe = msg.sender.userId === user.userId;
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
                                                maxWidth: '75%',
                                                padding: '0.8rem 1.2rem',
                                                borderRadius: '16px',
                                                background: isMe ? 'var(--primary)' : 'white',
                                                color: isMe ? 'white' : 'black',
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                                borderTopLeftRadius: !isMe ? '4px' : '16px',
                                                borderTopRightRadius: isMe ? '4px' : '16px'
                                            }}>
                                                {!isMe && <div style={{ fontSize: '0.7rem', fontWeight: 'bold', marginBottom: '0.25rem', color: '#6b7280' }}>Support Agent</div>}
                                                <p style={{ margin: 0, lineHeight: '1.5' }}>{msg.content}</p>
                                                <div style={{
                                                    fontSize: '0.7rem',
                                                    marginTop: '0.5rem',
                                                    textAlign: 'right',
                                                    opacity: 0.7
                                                }}>
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <form onSubmit={handleSendMessage} style={{ padding: '1rem', borderTop: '1px solid #eee', display: 'flex', gap: '0.75rem', background: 'white' }}>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    style={{
                                        flex: 1,
                                        padding: '0.8rem 1.2rem',
                                        borderRadius: '25px',
                                        border: '1px solid #e5e7eb',
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    style={{
                                        background: 'var(--primary)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '46px',
                                        height: '46px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        opacity: !newMessage.trim() ? 0.6 : 1,
                                        transition: 'opacity 0.2s',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HelpPage;
