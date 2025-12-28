import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
    const { user } = useAuth();
    const { refreshCart } = useCart();
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [useNewAddress, setUseNewAddress] = useState(false);
    const [newAddress, setNewAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('COD'); // Default COD

    useEffect(() => {
        fetchCart();
        fetchSavedAddresses();
    }, []);

    const fetchCart = async () => {
        try {
            const res = await api.get(`/cart?userId=${user.userId}`);
            setCart(res.data);
        } catch (error) {
            toast.error("Failed to load cart for checkout");
        } finally {
            setLoading(false);
        }
    };

    const fetchSavedAddresses = async () => {
        try {
            const res = await api.get(`/addresses/user/${user.userId}`);
            setSavedAddresses(res.data);
            // Auto-select default address if exists
            const defaultAddr = res.data.find(addr => addr.isDefault);
            if (defaultAddr) {
                setSelectedAddressId(defaultAddr.addressId);
            }
        } catch (error) {
            console.error('Failed to load addresses', error);
        }
    };

    const handlePlaceOrder = async () => {
        let finalAddress = '';

        if (useNewAddress) {
            if (!newAddress.trim()) {
                toast.error("Please enter a delivery address");
                return;
            }
            finalAddress = newAddress;
        } else {
            if (!selectedAddressId) {
                toast.error("Please select a delivery address");
                return;
            }
            const selectedAddr = savedAddresses.find(addr => addr.addressId === selectedAddressId);
            finalAddress = selectedAddr.fullAddress;
        }

        if (!cart || cart.items.length === 0) return;

        // Group items by storeId
        const itemsByStore = cart.items.reduce((acc, item) => {
            if (!acc[item.storeId]) acc[item.storeId] = [];
            acc[item.storeId].push(item);
            return acc;
        }, {});

        const storeIds = Object.keys(itemsByStore);
        setProcessing(true);

        try {
            let successString = "";
            for (const storeId of storeIds) {
                // Pass Address and Payment Method
                const res = await api.post(`/orders/place?userId=${user.userId}&storeId=${storeId}&address=${encodeURIComponent(finalAddress)}&paymentMethod=${paymentMethod}`);
                successString += `Order placed for Store ID ${storeId}! `;
            }
            toast.success("Order Placed Successfully! 🎉");

            // Clear cart logic here? For now, assume backend clears purchased items per store
            // Ideally backend should handle clearing based on items ordered.
            // Our OrderService places order and deletes CartItems. So next fetchCart should be empty.

            fetchCart();
            refreshCart(); // Refresh cart count in header
            navigate('/orders');
        } catch (error) {
            console.error('Checkout failed', error);
            toast.error("Checkout Failed. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Processing...</div>;

    if (!cart || cart.items.length === 0) {
        return (
            <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
                <h1>Checkout</h1>
                <p>Your cart is empty.</p>
                <button onClick={() => navigate('/customer-dashboard')} className="btn btn-primary">Go Shopping</button>
            </div>
        )
    }

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '2rem' }}>Checkout 📝</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Left: Input Details */}
                <div className="card">
                    <h3>Delivery Setup</h3>

                    {/* Saved Addresses */}
                    {savedAddresses.length > 0 && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600' }}>
                                Select Delivery Address
                            </label>
                            {savedAddresses.map((addr) => (
                                <label
                                    key={addr.addressId}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '0.75rem',
                                        padding: '0.75rem',
                                        border: selectedAddressId === addr.addressId && !useNewAddress ? '2px solid var(--primary)' : '1px solid var(--border)',
                                        borderRadius: '0.5rem',
                                        marginBottom: '0.5rem',
                                        cursor: 'pointer',
                                        background: selectedAddressId === addr.addressId && !useNewAddress ? '#f0f9ff' : 'white'
                                    }}
                                >
                                    <input
                                        type="radio"
                                        name="address"
                                        checked={selectedAddressId === addr.addressId && !useNewAddress}
                                        onChange={() => {
                                            setSelectedAddressId(addr.addressId);
                                            setUseNewAddress(false);
                                        }}
                                        style={{ marginTop: '0.25rem' }}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                                            {addr.label}
                                            {addr.isDefault && (
                                                <span style={{
                                                    marginLeft: '0.5rem',
                                                    fontSize: '0.75rem',
                                                    background: 'var(--primary)',
                                                    color: 'white',
                                                    padding: '0.125rem 0.5rem',
                                                    borderRadius: '0.25rem'
                                                }}>
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                            {addr.fullAddress}
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}

                    {/* Use New Address Option */}
                    <label
                        style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.75rem',
                            padding: '0.75rem',
                            border: useNewAddress ? '2px solid var(--primary)' : '1px solid var(--border)',
                            borderRadius: '0.5rem',
                            marginBottom: '1rem',
                            cursor: 'pointer',
                            background: useNewAddress ? '#f0f9ff' : 'white'
                        }}
                    >
                        <input
                            type="radio"
                            name="address"
                            checked={useNewAddress}
                            onChange={() => setUseNewAddress(true)}
                            style={{ marginTop: '0.25rem' }}
                        />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Use a new address</div>
                            {useNewAddress && (
                                <textarea
                                    value={newAddress}
                                    onChange={(e) => setNewAddress(e.target.value)}
                                    className="input-field"
                                    rows="3"
                                    placeholder="Enter your delivery address"
                                    style={{ marginTop: '0.5rem' }}
                                />
                            )}
                        </div>
                    </label>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Payment Method</label>
                        <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="input-field"
                        >
                            <option value="COD">Cash on Delivery (COD)</option>
                            <option value="CARD">Credit/Debit Card</option>
                            <option value="UPI">UPI</option>
                        </select>
                    </div>
                </div>

                {/* Right: Bill Summary */}
                <div className="card" style={{ height: 'fit-content', background: '#f8f9fa' }}>
                    <h3>Order Summary</h3>
                    <div style={{ marginBottom: '1rem', borderBottom: '1px solid #ddd', paddingBottom: '1rem' }}>
                        {cart.items.map(item => (
                            <div key={item.itemId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                <span>{item.quantity}x {item.productName}</span>
                                <span>₹{item.price * item.quantity}</span>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
                        <span>Total Due</span>
                        <span>₹{cart.totalAmount}</span>
                    </div>

                    <button
                        className="btn btn-primary"
                        style={{ width: '100%', fontSize: '1.1rem', padding: '0.8rem' }}
                        onClick={handlePlaceOrder}
                    >
                        Place Order 🛍️
                    </button>
                </div>
            </div>
            <button onClick={() => navigate('/cart')} className="btn btn-outline" style={{ marginTop: '1rem' }}>⬅ Back to Cart</button>

            {/* Loading Overlay */}
            {processing && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999
                }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        border: '4px solid rgba(255, 255, 255, 0.3)',
                        borderTop: '4px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <p style={{
                        color: 'white',
                        marginTop: '1.5rem',
                        fontSize: '1.25rem',
                        fontWeight: '600'
                    }}>
                        Placing your order...
                    </p>
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

export default CheckoutPage;
