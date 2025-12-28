import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const CartPage = () => {
    const { user } = useAuth();
    const { refreshCart } = useCart();
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            const res = await api.get(`/cart?userId=${user.userId}`);
            setCart(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load cart");
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveItem = async (itemId) => {
        try {
            await api.delete(`/cart/items/${itemId}?userId=${user.userId}`);
            toast.success("Item removed");
            fetchCart();
            refreshCart(); // Sync with header
        } catch (error) {
            toast.error("Failed to remove item");
        }
    };

    const handleCheckout = () => {
        if (!cart || cart.items.length === 0) return;
        navigate('/checkout');
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading Cart...</div>;

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={() => navigate(-1)} className="btn btn-outline">⬅ Back</button>
                <h1 style={{ margin: 0 }}>Your Cart 🛒</h1>
            </div>

            {!cart || cart.items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
                    <h2>Your cart is empty</h2>
                    <button onClick={() => navigate('/customer-dashboard')} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                        Start Shopping
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                    {/* Items List */}
                    <div className="card">
                        {cart.items.map(item => (
                            <div key={item.itemId} style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1rem' }}>
                                <div style={{ width: '80px', height: '80px', background: '#f9f9f9', borderRadius: '8px', overflow: 'hidden' }}>
                                    {item.imageUrl ? (
                                        <img src={`http://localhost:8080${item.imageUrl}`} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#ccc' }}>Img</div>
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: '0 0 0.5rem' }}>{item.productName}</h3>
                                    <p style={{ margin: 0, color: '#666' }}>{item.storeName}</p> {/* Show Store Name */}
                                    <p style={{ margin: 0, color: '#666' }}>Price: ₹{item.price}</p>
                                    <p style={{ margin: 0, color: '#666' }}>Qty: {item.quantity}</p>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                                    <span style={{ fontWeight: 'bold' }}>₹{item.price * item.quantity}</span>
                                    <button
                                        onClick={() => handleRemoveItem(item.itemId)}
                                        style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="card" style={{ height: 'fit-content' }}>
                        <h3>Order Summary</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.1rem' }}>
                            <span>Total</span>
                            <span style={{ fontWeight: 'bold' }}>₹{cart.totalAmount}</span>
                        </div>
                        <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleCheckout}>
                            Checkout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;
