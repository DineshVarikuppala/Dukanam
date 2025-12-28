import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { ArrowLeft, Search } from 'lucide-react';

const UserOrdersPage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [orderSearch, setOrderSearch] = useState('');

    useEffect(() => {
        fetchUserDetails();
    }, [userId]);

    const fetchUserDetails = async () => {
        try {
            const res = await api.get(`/admin/users/${userId}`);
            setUserDetails(res.data);
        } catch (error) {
            toast.error('Failed to load user details');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            await api.put(`/orders/${orderId}/status`, { status: newStatus });
            toast.success("Order status updated");
            fetchUserDetails();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const getFilteredOrders = () => {
        if (!userDetails?.orders) return [];
        if (!orderSearch.trim()) return userDetails.orders;
        return userDetails.orders.filter(order =>
            order.orderId.toString().includes(orderSearch)
        );
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
                <h1 style={{ marginTop: 0, marginBottom: '1rem' }}>Orders for {userDetails.firstName} {userDetails.lastName}</h1>
                <p style={{ color: '#666', marginBottom: '2rem' }}>User ID: {userDetails.userId} | Email: {userDetails.email}</p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0 }}>All Orders ({userDetails.orders?.length || 0})</h2>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                        <input
                            type="text"
                            placeholder="Filter by Order ID..."
                            value={orderSearch}
                            onChange={(e) => setOrderSearch(e.target.value)}
                            style={{ padding: '0.7rem 0.7rem 0.7rem 2.2rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem', width: '250px' }}
                        />
                    </div>
                </div>

                <div style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
                    {getFilteredOrders().length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>
                            {orderSearch ? 'No orders match this ID' : 'No orders found for this user'}
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                            <thead style={{ background: '#f3f4f6' }}>
                                <tr>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Order ID</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Placed On</th>
                                    {userDetails.role === 'STORE_OWNER' ? (
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>Last Updated</th>
                                    ) : (
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>Store</th>
                                    )}
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Items</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Total</th>
                                    {userDetails.role === 'STORE_OWNER' && (
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>Action</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {getFilteredOrders().map(order => (
                                    <tr key={order.orderId} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '1rem', fontWeight: 'bold' }}>#{order.orderId}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#888' }}>{new Date(order.createdAt).toLocaleTimeString()}</div>
                                        </td>
                                        {userDetails.role === 'STORE_OWNER' ? (
                                            <td style={{ padding: '1rem' }}>
                                                {order.updatedAt ? (
                                                    <>
                                                        <div>{new Date(order.updatedAt).toLocaleDateString()}</div>
                                                        <div style={{ fontSize: '0.85rem', color: '#888' }}>{new Date(order.updatedAt).toLocaleTimeString()}</div>
                                                    </>
                                                ) : (
                                                    <span style={{ color: '#999', fontStyle: 'italic' }}>-</span>
                                                )}
                                            </td>
                                        ) : (
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ fontWeight: '500' }}>{order.store?.storeName || 'N/A'}</div>
                                                <div style={{ fontSize: '0.85rem', color: '#888' }}>{order.store?.ownerName || ''}</div>
                                            </td>
                                        )}
                                        <td style={{ padding: '1rem' }}>
                                            {order.items?.map((item, idx) => (
                                                <div key={idx} style={{ fontSize: '0.9rem' }}>
                                                    {item.product?.productName} (x{item.quantity})
                                                </div>
                                            ))}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.4rem 0.8rem',
                                                borderRadius: '20px',
                                                fontSize: '0.85rem',
                                                fontWeight: '500',
                                                background: order.status === 'DELIVERED' ? '#d1fae5' :
                                                    order.status === 'CANCELLED' ? '#fee2e2' :
                                                        order.status === 'PENDING' ? '#fef3c7' : '#dbeafe',
                                                color: order.status === 'DELIVERED' ? '#065f46' :
                                                    order.status === 'CANCELLED' ? '#991b1b' :
                                                        order.status === 'PENDING' ? '#92400e' : '#1e40af'
                                            }}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', fontWeight: 'bold' }}>₹{order.totalAmount}</td>
                                        {userDetails.role === 'STORE_OWNER' && (
                                            <td style={{ padding: '1rem' }}>
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleUpdateOrderStatus(order.orderId, e.target.value)}
                                                    style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.9rem' }}
                                                >
                                                    <option value="PENDING">PENDING</option>
                                                    <option value="CONFIRMED">CONFIRMED</option>
                                                    <option value="SHIPPED">SHIPPED</option>
                                                    <option value="DELIVERED">DELIVERED</option>
                                                    <option value="CANCELLED">CANCELLED</option>
                                                </select>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserOrdersPage;
