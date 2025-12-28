import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';
import { ShoppingCart, Package, Minus, Plus } from 'lucide-react';

const BestsellersPage = () => {
    const navigate = useNavigate();
    const { addToCart, refreshCart, cartCount } = useCart();
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cartItems, setCartItems] = useState([]); // Track cart items
    const [showFloatingCart, setShowFloatingCart] = useState(false);

    useEffect(() => {
        fetchBestsellers();
        if (user) fetchCart();
    }, [user]);

    const fetchBestsellers = async () => {
        try {
            const res = await api.get('/customer/products/bestsellers');
            setProducts(res.data);
        } catch (error) {
            console.error('Failed to load products:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const fetchCart = async () => {
        if (!user) return;
        try {
            const res = await api.get(`/cart?userId=${user.userId}`);
            setCartItems(res.data.items || []);
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        }
    };

    const getCartItem = (productId) => {
        return cartItems.find(item => item.productId === productId);
    };

    const handleAddToCart = async (product) => {
        try {
            await addToCart(product.productId, 1);
            toast.success(`${product.productName} added to cart!`);
            await fetchCart(); // Refresh cart items
            setShowFloatingCart(true); // Show floating cart button
        } catch (error) {
            console.error('Failed to add to cart:', error);
            toast.error('Failed to add to cart');
        }
    };

    const updateQuantity = async (cartItem, newQuantity) => {
        try {
            if (newQuantity < 1) {
                // Remove item from cart when quantity reaches 0
                await api.delete(`/cart/items/${cartItem.itemId}?userId=${user.userId}`);
                toast.success('Item removed from cart');
            } else {
                // Update quantity
                await api.put(`/cart/items/${cartItem.itemId}?userId=${user.userId}&quantity=${newQuantity}`);
            }
            await fetchCart();
            refreshCart();
        } catch (error) {
            toast.error('Failed to update quantity');
        }
    };

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p>Loading products...</p>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <Package size={64} color="#ccc" style={{ margin: '0 auto 1rem' }} />
                <h2>No Bestsellers Yet</h2>
                <p style={{ color: '#666' }}>Check back later for popular products!</p>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ margin: '0 0 0.5rem' }}>Bestsellers</h1>
                <p style={{ color: '#666', margin: 0 }}>Most popular products ordered by customers</p>
            </div>

            {/* Products Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '1.5rem'
            }}>
                {products.map((product) => (
                    <div
                        key={product.productId}
                        className="card"
                        style={{
                            cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        {/* Product Image */}
                        <div
                            onClick={() => handleProductClick(product.productId)}
                            style={{
                                width: '100%',
                                height: '200px',
                                background: '#f3f4f6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden'
                            }}
                        >
                            {product.imageUrls && product.imageUrls.length > 0 ? (
                                <img
                                    src={`http://localhost:8080${product.imageUrls[0]}`}
                                    alt={product.productName}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                            ) : (
                                <Package size={48} color="#ccc" />
                            )}
                        </div>

                        {/* Product Info */}
                        <div style={{ padding: '1rem' }}>
                            <h3
                                onClick={() => handleProductClick(product.productId)}
                                style={{
                                    margin: '0 0 0.5rem',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {product.productName}
                            </h3>

                            {/* Store Name */}
                            <p style={{
                                margin: '0 0 0.5rem',
                                fontSize: '0.85rem',
                                color: '#666'
                            }}>
                                {product.store?.storeName || 'Unknown Store'}
                            </p>

                            {/* Price */}
                            <p style={{
                                margin: '0 0 1rem',
                                fontSize: '1.25rem',
                                fontWeight: 'bold',
                                color: 'var(--primary)'
                            }}>
                                ₹{product.price}
                            </p>

                            {/* Stock Status & Add to Cart / Quantity Controls */}
                            {(() => {
                                const cartItem = getCartItem(product.productId);

                                if (product.quantityInStock <= 0) {
                                    return (
                                        <button
                                            disabled
                                            style={{
                                                width: '100%',
                                                padding: '0.5rem',
                                                background: '#e5e7eb',
                                                color: '#9ca3af',
                                                border: 'none',
                                                borderRadius: '0.5rem',
                                                cursor: 'not-allowed'
                                            }}
                                        >
                                            Out of Stock
                                        </button>
                                    );
                                }

                                if (cartItem) {
                                    return (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            background: '#f0f0f0',
                                            borderRadius: '0.5rem',
                                            padding: '0.5rem'
                                        }}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    updateQuantity(cartItem, cartItem.quantity - 1);
                                                }}
                                                style={{
                                                    background: 'white',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '4px',
                                                    width: '32px',
                                                    height: '32px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span style={{
                                                flex: 1,
                                                textAlign: 'center',
                                                fontWeight: '600',
                                                fontSize: '0.9rem'
                                            }}>
                                                {cartItem.quantity} in Cart
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    updateQuantity(cartItem, cartItem.quantity + 1);
                                                }}
                                                style={{
                                                    background: 'white',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '4px',
                                                    width: '32px',
                                                    height: '32px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    );
                                }

                                return (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddToCart(product);
                                        }}
                                        className="btn btn-primary"
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <ShoppingCart size={18} />
                                        Add to Cart
                                    </button>
                                );
                            })()}
                        </div>
                    </div>
                ))}
            </div>

            {/* Floating Cart Button - Only show if items added from this page */}
            {showFloatingCart && cartCount > 0 && (
                <button
                    onClick={() => navigate('/cart')}
                    style={{
                        position: 'fixed',
                        bottom: '2rem',
                        right: '2rem',
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        padding: '1rem 2rem',
                        borderRadius: '50px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        zIndex: 100
                    }}
                >
                    🛒 Go to Cart
                    <span style={{
                        background: 'white',
                        color: 'var(--primary)',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '0.9rem'
                    }}>
                        {cartCount}
                    </span>
                </button>
            )}
        </div>
    );
};

export default BestsellersPage;
