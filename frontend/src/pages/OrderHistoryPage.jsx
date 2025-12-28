import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const OrderHistoryPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, [user]);

    const fetchOrders = async () => {
        try {
            const res = await api.get(`/orders/customer?userId=${user.userId}`);
            // Sort by date desc
            const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setOrders(sorted);
        } catch (error) {
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
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

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem' }}>
            <button onClick={() => navigate('/customer-dashboard')} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                ⬅ Back to Dashboard
            </button>

            <h1 style={{ marginBottom: '2rem' }}>My Orders 📦</h1>

            {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', background: '#f9f9f9', borderRadius: '8px' }}>
                    <p style={{ color: '#888', fontSize: '1.2rem' }}>You haven't placed any orders yet.</p>
                    <button onClick={() => navigate('/customer-dashboard')} className="btn btn-primary" style={{ marginTop: '1rem' }}>Start Shopping</button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {orders.map(order => (
                        <div key={order.orderId} className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                                <div>
                                    <h3 style={{ margin: 0 }}>Order #{order.orderId}</h3>
                                    <small style={{ color: '#666' }}>Placed on: {new Date(order.createdAt).toLocaleDateString()}</small>
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

                            {/* Stepper Visualization */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', position: 'relative', padding: '0 1rem' }}>
                                {['PENDING', 'ACCEPTED', 'PACKED', 'SHIPPED', 'DELIVERED'].map((step, index) => {
                                    const currentStatusIndex = ['PENDING', 'ACCEPTED', 'PACKED', 'SHIPPED', 'DELIVERED'].indexOf(order.status);
                                    const isCompleted = index <= currentStatusIndex;
                                    const isCurrent = index === currentStatusIndex;

                                    return (
                                        <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, width: '100%' }}>
                                            <div style={{
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '50%',
                                                background: isCompleted ? getStatusColor(step) : '#ddd',
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '10px',
                                                marginBottom: '0.2rem',
                                                border: isCurrent ? '2px solid black' : 'none'
                                            }}>
                                                {isCompleted ? '✓' : index + 1}
                                            </div>
                                            <span style={{ fontSize: '0.7rem', color: isCompleted ? 'black' : '#aaa', fontWeight: isCurrent ? 'bold' : 'normal' }}>
                                                {step}
                                            </span>
                                        </div>
                                    );
                                })}
                                {/* Progress Line */}
                                <div style={{
                                    position: 'absolute',
                                    top: '10px',
                                    left: '10%',
                                    right: '10%',
                                    height: '2px',
                                    background: '#eee',
                                    zIndex: 0
                                }} />
                                <div style={{
                                    position: 'absolute',
                                    top: '10px',
                                    left: '10%',
                                    width: `${(['PENDING', 'ACCEPTED', 'PACKED', 'SHIPPED', 'DELIVERED'].indexOf(order.status) / 4) * 80}%`,
                                    height: '2px',
                                    background: 'green',
                                    zIndex: 0,
                                    transition: 'width 0.3s ease'
                                }} />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <p style={{ margin: '0.2rem 0', fontWeight: '500' }}>Store: {order.store.storeName}</p>
                                <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginTop: '0.5rem' }}>
                                    {order.items.map(item => (
                                        <div key={item.orderItemId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span>{item.quantity}x {item.product.productName}</span>
                                            <span>₹{item.priceAtOrder * item.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Total: ₹{order.totalAmount}</span>
                            </div>
                        </div>
                    ))
                    }
                </div >
            )}
        </div >
    );
};

export default OrderHistoryPage;
