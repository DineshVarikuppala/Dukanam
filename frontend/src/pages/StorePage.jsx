import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const StorePage = () => {
    const { storeId } = useParams();
    const { user } = useAuth();
    const { refreshCart: refreshHeaderCart } = useCart();
    const navigate = useNavigate();

    const [store, setStore] = useState(null);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState('ALL');
    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState(null); // productId being added
    const [cartCount, setCartCount] = useState(0);
    const [cartItems, setCartItems] = useState({}); // Map: productId -> { itemId, quantity }

    useEffect(() => {
        loadStoreData();
        if (user?.userId) { // Only fetch cart count if user is logged in
            fetchCart();
        }
    }, [storeId, user]);

    const fetchCart = async () => {
        try {
            const res = await api.get(`/cart?userId=${user.userId}`);
            // Sum up quantities
            const count = res.data.items.reduce((acc, item) => acc + item.quantity, 0);
            setCartCount(count);

            // Map items for easy lookup
            const map = {};
            res.data.items.forEach(item => {
                map[item.productId] = { itemId: item.itemId, quantity: item.quantity };
            });
            setCartItems(map);
        } catch (error) {
            console.error("Failed to fetch cart", error);
        }
    };

    const loadStoreData = async () => {
        try {
            const [storeRes, prodRes, catRes] = await Promise.all([
                api.get(`/customer/stores/${storeId}`),
                api.get(`/customer/stores/${storeId}/products`),
                api.get(`/customer/stores/${storeId}/categories`)
            ]);
            setStore(storeRes.data);
            setProducts(prodRes.data);
            setCategories(catRes.data);
        } catch (error) {
            toast.error("Failed to load store.");
            navigate('/customer-dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async (product) => {
        setAddingToCart(product.productId);
        try {
            await api.post(`/cart/add?userId=${user.userId}`, {
                productId: product.productId,
                quantity: 1
            });
            toast.success(`Added ${product.productName} to Cart`);
            fetchCart(); // Update cart map and count
            refreshHeaderCart(); // Sync with header
        } catch (error) {
            toast.error("Failed to add to cart");
        } finally {
            setAddingToCart(null);
        }
    };

    const updateQuantity = async (productId, newQuantity) => {
        const item = cartItems[productId];
        if (!item) return;

        try {
            // If quantity is 0, backend handles removal if we implemented it, or we call delete.
            // Our backend updateCartItemQuantity handles 0 by removing.
            await api.put(`/cart/items/${item.itemId}?userId=${user.userId}&quantity=${newQuantity}`);
            fetchCart();
            refreshHeaderCart(); // Sync with header
        } catch (error) {
            toast.error("Failed to update quantity");
        }
    };

    const filteredProducts = activeCategory === 'ALL'
        ? products
        : products.filter(p => p.category?.categoryId === activeCategory);

    if (loading) return <div style={{ padding: '2rem' }}>Loading Store...</div>;
    if (!store) return null;

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem', paddingBottom: '6rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', padding: '0.4rem 0.8rem' }}>
                    ⬅ Back to Stores
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#eee', overflow: 'hidden', border: '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        {store.storeLogoUrl ? (
                            <img src={`http://localhost:8080${store.storeLogoUrl}`} alt={store.storeName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>🏪</div>
                        )}
                    </div>
                    <div>
                        <h1 style={{ margin: 0 }}>{store.storeName}</h1>
                        <p style={{ margin: '0.5rem 0 0', color: '#666' }}>📍 {store.storeAddress} | 📞 {store.contactNumber}</p>
                    </div>
                </div>
            </div>

            {/* Category Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <button
                    className={`btn ${activeCategory === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveCategory('ALL')}
                    style={{ whiteSpace: 'nowrap' }}
                >
                    All Items
                </button>
                {categories.map(cat => (
                    <button
                        key={cat.categoryId}
                        className={`btn ${activeCategory === cat.categoryId ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setActiveCategory(cat.categoryId)}
                        style={{ whiteSpace: 'nowrap' }}
                    >
                        {cat.categoryName}
                    </button>
                ))}
            </div>

            {/* Product Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                {filteredProducts.map(product => {
                    const inCart = cartItems[product.productId];
                    return (<div
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

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>₹{product.price}</span>

                            {inCart ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f0f0f0', borderRadius: '4px', padding: '0.2rem' }}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); updateQuantity(product.productId, inCart.quantity - 1); }}
                                        style={{ background: 'none', border: 'none', padding: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        -
                                    </button>
                                    <span style={{ fontWeight: 'bold' }}>{inCart.quantity}</span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); updateQuantity(product.productId, inCart.quantity + 1); }}
                                        style={{ background: 'none', border: 'none', padding: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        +
                                    </button>
                                </div>
                            ) : (
                                <button
                                    className="btn btn-primary"
                                    onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                                    disabled={addingToCart === product.productId || product.quantityInStock <= 0}
                                >
                                    {product.quantityInStock <= 0 ? 'Out of Stock' : (addingToCart === product.productId ? 'Adding...' : 'Add to Cart')}
                                </button>
                            )}
                        </div>
                    </div>
                    )
                })}
            </div>

            {/* Floating Cart Button */}
            <button
                onClick={() => navigate('/cart')}
                style={{
                    position: 'fixed', bottom: '2rem', right: '2rem',
                    background: 'var(--primary)', color: 'white', border: 'none',
                    padding: '1rem 2rem', borderRadius: '50px',
                    fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                    display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}
            >
                🛒 Go to Cart {cartCount > 0 && <span style={{ background: 'white', color: 'var(--primary)', padding: '2px 8px', borderRadius: '10px', fontSize: '0.9rem' }}>{cartCount}</span>}
            </button>
        </div>
    );
};

export default StorePage;
