import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const CustomerDashboard = () => {
    const { user, logout } = useAuth();
    const { refreshCart } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const [stores, setStores] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchActive, setSearchActive] = useState(false);
    const [currentSearchQuery, setCurrentSearchQuery] = useState('');
    const [welcomeVideo, setWelcomeVideo] = useState(null);

    useEffect(() => {
        // Check for search query in URL
        const params = new URLSearchParams(location.search);
        const searchQuery = params.get('search');

        if (searchQuery) {
            handleSearchFromURL(searchQuery);
        } else {
            fetchStores();
            fetchWelcomeVideo();
        }
    }, [location.search]);

    const fetchWelcomeVideo = async () => {
        try {
            const res = await api.get('/content/active?type=BUYER_VIDEO');
            if (res.status === 200 && res.data) {
                setWelcomeVideo(res.data);
            }
        } catch (error) {
            console.error('Failed to load welcome video');
        }
    };

    const fetchStores = async () => {
        try {
            const res = await api.get('/customer/stores');
            setStores(res.data);
        } catch (error) {
            toast.error('Failed to load stores');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchFromURL = async (query) => {
        if (!query.trim()) {
            setSearchActive(false);
            setCurrentSearchQuery('');
            fetchStores();
            return;
        }
        setCurrentSearchQuery(query);
        setSearchActive(true);
        setLoading(true);
        try {
            const res = await api.get(`/customer/products/search?query=${query}`);
            setProducts(res.data);
        } catch (error) {
            toast.error("Search failed");
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (product) => {
        try {
            await api.post(`/cart/add?userId=${user.userId}`, {
                productId: product.productId,
                quantity: 1
            });
            toast.success(`Added ${product.productName} to Cart`);
            refreshCart(); // Refresh cart count
        } catch (error) {
            toast.error("Failed to add to cart");
        }
    };

    return (
        <div className="container animate-fade-in" style={{ padding: '1rem 2rem 2rem 2rem' }}>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <>
                    {searchActive ? (
                        <div>
                            <h3>Search Results for "{currentSearchQuery}"</h3>
                            {products.length === 0 ? (
                                <p style={{ color: '#888' }}>No products found matching your query.</p>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                                    {products.map(product => (
                                        <div
                                            key={product.productId}
                                            className="card"
                                            style={{ display: 'flex', flexDirection: 'column', height: '100%', cursor: 'pointer' }}
                                            onClick={() => navigate(`/product/${product.productId}`)}
                                        >
                                            <div
                                                style={{ height: '200px', background: '#f9f9f9', marginBottom: '1rem', borderRadius: '8px', overflow: 'hidden' }}
                                            >
                                                {product.imageUrls && product.imageUrls.length > 0 ? (
                                                    <img src={`http://localhost:8080${product.imageUrls[0]}`} alt={product.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>No Image</div>
                                                )}
                                            </div>
                                            <h3 style={{ margin: '0 0 0.5rem' }}>{product.productName}</h3>
                                            <p style={{ color: '#666', fontSize: '0.9rem', flex: 1 }}>{product.description}</p>
                                            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#555', fontStyle: 'italic' }}>
                                                Store: {product.store?.storeName}
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                                                <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>${product.price}</span>
                                                <button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); addToCart(product); }}>Add to Cart</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            {welcomeVideo && (
                                <div style={{ marginBottom: '2rem', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', height: '250px' }}>
                                    <video
                                        src={`http://localhost:8080${welcomeVideo.url}`}
                                        controls
                                        loop
                                        muted
                                        autoPlay
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                            )}

                            <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>Stores</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                                {stores.map(store => (
                                    <div key={store.storeId} className="card" style={{ transition: 'transform 0.2s', ':hover': { transform: 'translateY(-4px)' } }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#eee', overflow: 'hidden' }}>
                                                {store.storeLogoUrl ? (
                                                    <img src={`http://localhost:8080${store.storeLogoUrl}`} alt={store.storeName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🏪</div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 style={{ margin: 0 }}>{store.storeName}</h3>
                                                <small style={{ color: '#888' }}>{store.storeAddress}</small>
                                            </div>
                                        </div>
                                        <button
                                            className="btn btn-primary"
                                            style={{ width: '100%' }}
                                            onClick={() => navigate(`/store/${store.storeId}`)}
                                        >
                                            Visit Store ➡
                                        </button>
                                    </div>
                                ))}
                                {stores.length === 0 && (
                                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#888' }}>
                                        No stores found nearby. 😔
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default CustomerDashboard;
