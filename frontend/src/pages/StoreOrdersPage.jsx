import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const StoreOrdersPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingOrderId, setUpdatingOrderId] = useState(null);

    useEffect(() => {
        if (user?.storeId) {
            fetchOrders();
        } else {
            // Fallback if storeId not in user context directly (though it should be for OWNER)
            // We might need to fetch store details first if not present
            // Assuming setup is correct for now or redirect
            setLoading(false);
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            const res = await api.get(`/orders/store?storeId=${user.storeId}`);
            const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setOrders(sorted);
        } catch (error) {
            toast.error("Failed to load store orders");
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        setUpdatingOrderId(orderId);
        try {
            await api.put(`/orders/${orderId}/status`, { status: newStatus });
            toast.success(`Order #${orderId} marked as ${newStatus}`);
            fetchOrders(); // Refresh list
        } catch (error) {
            toast.error("Failed to update status");
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'orange';
            case 'ACCEPTED': return 'blue';
            case 'SHIPPED': return 'purple';
            case 'DELIVERED': return 'green';
            case 'CANCELLED': return 'red';
            default: return 'gray';
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading Orders...</div>;

    if (!user?.storeId) return <div style={{ padding: '2rem' }}>Store ID not found. Please log in as a store owner.</div>;

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem' }}>
            <button onClick={() => navigate('/dashboard')} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                ⬅ Back to Dashboard
            </button>

            <h1 style={{ marginBottom: '2rem' }}>Manage Orders 📋</h1>

            {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', background: '#f9f9f9', borderRadius: '8px', color: '#888' }}>
                    No orders received yet.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {orders.map(order => (
                        <div key={order.orderId} className="card" style={{ position: 'relative' }}>
                            {/* Loading Overlay for this specific order */}
                            {updatingOrderId === order.orderId && (
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: 'rgba(255, 255, 255, 0.9)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 10,
                                    borderRadius: '8px'
                                }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        border: '4px solid #e0e0e0',
                                        borderTop: '4px solid var(--primary)',
                                        borderRadius: '50%',
                                        animation: 'spin 1s linear infinite'
                                    }}></div>
                                    <p style={{
                                        marginTop: '1rem',
                                        fontSize: '0.95rem',
                                        fontWeight: '600',
                                        color: 'var(--primary)'
                                    }}>
                                        Updating status...
                                    </p>
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                                <div>
                                    <h3 style={{ margin: 0 }}>Order #{order.orderId}</h3>
                                    <p style={{ margin: '0.2rem 0', color: '#666' }}>Customer: {order.customer.fullName} ({order.customer.email})</p>
                                    <small style={{ color: '#888' }}>{new Date(order.createdAt).toLocaleString()}</small>
                                </div>
                                <span style={{
                                    background: getStatusColor(order.status),
                                    color: 'white',
                                    padding: '0.3rem 0.8rem',
                                    borderRadius: '20px',
                                    fontSize: '0.9rem',
                                    fontWeight: 'bold'
                                }}>
                                    {order.status}
                                </span>
                            </div>

                            <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                                <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Items:</p>
                                {order.items.map(item => (
                                    <div key={item.orderItemId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                                        <span>{item.quantity}x {item.product.productName}</span>
                                        <span>₹{item.priceAtOrder * item.quantity}</span>
                                    </div>
                                ))}
                                <div style={{ marginTop: '0.5rem', borderTop: '1px solid #ddd', paddingTop: '0.5rem', textAlign: 'right', fontWeight: 'bold' }}>
                                    Total: ₹{order.totalAmount}
                                </div>
                            </div>

                            {/* Enhanced Stepper & Action Buttons */}
                            <div style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                                {/* Stepper Visualization */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', position: 'relative' }}>
                                    {['PENDING', 'ACCEPTED', 'PACKED', 'SHIPPED', 'DELIVERED'].map((step, index, arr) => {
                                        const currentStatusIndex = ['PENDING', 'ACCEPTED', 'PACKED', 'SHIPPED', 'DELIVERED'].indexOf(order.status);
                                        const isCompleted = index <= currentStatusIndex;
                                        const isCurrent = index === currentStatusIndex;

                                        return (
                                            <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, width: '100%' }}>
                                                <div style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '50%',
                                                    background: isCompleted ? 'green' : '#ddd',
                                                    color: 'white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '12px',
                                                    marginBottom: '0.2rem',
                                                    border: isCurrent ? '2px solid black' : 'none'
                                                }}>
                                                    {isCompleted ? '✓' : index + 1}
                                                </div>
                                                <span style={{ fontSize: '0.75rem', color: isCompleted ? 'green' : '#aaa', fontWeight: isCurrent ? 'bold' : 'normal' }}>
                                                    {step}
                                                </span>
                                            </div>
                                        );
                                    })}
                                    {/* Progress Line */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '12px',
                                        left: '10%',
                                        right: '10%',
                                        height: '2px',
                                        background: '#eee',
                                        zIndex: 0
                                    }} />
                                    <div style={{
                                        position: 'absolute',
                                        top: '12px',
                                        left: '10%',
                                        width: `${(['PENDING', 'ACCEPTED', 'PACKED', 'SHIPPED', 'DELIVERED'].indexOf(order.status) / 4) * 80}%`,
                                        height: '2px',
                                        background: 'green',
                                        zIndex: 0,
                                        transition: 'width 0.3s ease'
                                    }} />
                                </div>

                                {/* Controls */}
                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                    {order.status === 'PENDING' && (
                                        <>
                                            <button onClick={() => updateStatus(order.orderId, 'ACCEPTED')} className="btn btn-primary" style={{ background: 'blue' }}>Accept Order</button>
                                            <button onClick={() => updateStatus(order.orderId, 'CANCELLED')} className="btn btn-primary" style={{ background: 'red' }}>Decline</button>
                                        </>
                                    )}
                                    {order.status === 'ACCEPTED' && (
                                        <button onClick={() => updateStatus(order.orderId, 'PACKED')} className="btn btn-primary" style={{ background: 'orange' }}>Mark Packed 📦</button>
                                    )}
                                    {order.status === 'PACKED' && (
                                        <button onClick={() => updateStatus(order.orderId, 'SHIPPED')} className="btn btn-primary" style={{ background: 'purple' }}>Mark Shipped 🚚</button>
                                    )}
                                    {order.status === 'SHIPPED' && (
                                        <button onClick={() => updateStatus(order.orderId, 'DELIVERED')} className="btn btn-primary" style={{ background: 'green' }}>Mark Delivered ✅</button>
                                    )}
                                    {order.status === 'DELIVERED' && (
                                        <span style={{ color: 'green', fontWeight: 'bold' }}>Order Completed</span>
                                    )}
                                    {order.status === 'CANCELLED' && (
                                        <span style={{ color: 'red', fontWeight: 'bold' }}>Cancelled</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default StoreOrdersPage;
