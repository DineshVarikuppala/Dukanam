import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const OrdersPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const endpoint = user.role === 'CUSTOMER' ? '/orders/customer' : '/orders/store';
            const param = user.role === 'CUSTOMER' ? `userId=${user.userId}` : `storeId=${user.userId}`; // Assuming Store logic is separate, but for customer this works.
            // Wait, store needs storeId not userId. Store ID is not User ID. 
            // For now, let's focus on Customer Orders.
            if (user.role !== 'CUSTOMER') {
                // Simple guard for now, though logic should be in Dashboard
                return;
            }

            const res = await api.get(`/orders/customer?userId=${user.userId}`);
            setOrders(res.data);
        } catch (error) {
            toast.error("Failed to fetch orders");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading Orders...</div>;

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={() => navigate(-1)} className="btn btn-outline">⬅ Back</button>
                <h1 style={{ margin: 0 }}>My Orders 📦</h1>
            </div>

            {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
                    <h3>No orders yet.</h3>
                    <button onClick={() => navigate('/customer-dashboard')} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                        Start Shopping
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {orders.map(order => (
                        <div key={order.orderId} className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                                <div>
                                    <strong>Order #{order.orderId}</strong>
                                    <span style={{ marginLeft: '1rem', fontSize: '0.9rem', color: '#666' }}>{new Date(order.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div style={{ fontWeight: 'bold', color: order.status === 'PENDING' ? 'orange' : 'green' }}>
                                    {order.status}
                                </div>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <strong>Store:</strong> {order.store?.storeName}
                            </div>
                            <div style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '8px' }}>
                                {order.items.map(item => (
                                    <div key={item.orderItemId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span>{item.quantity}x {item.product?.productName}</span>
                                        <span>₹{item.priceAtOrder}</span>
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: '1rem', textAlign: 'right', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                Total: ₹{order.totalAmount}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrdersPage;
