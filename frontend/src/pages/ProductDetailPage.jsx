import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight, ZoomIn, X, Minus, Plus } from 'lucide-react';

const ProductDetailPage = () => {
    const { productId } = useParams();
    const { user } = useAuth();
    const { refreshCart } = useCart();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [cartItem, setCartItem] = useState(null); // { itemId, quantity } if present
    const [addingToCart, setAddingToCart] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        fetchProduct();
        if (user) fetchCart();
    }, [productId, user]);

    const fetchCart = async () => {
        try {
            const res = await api.get(`/cart?userId=${user.userId}`);
            const count = res.data.items.reduce((acc, item) => acc + item.quantity, 0);
            setCartCount(count);

            // Find if this product is in cart
            // Note: res.data.items contains { productId, quantity, itemId, ... }
            const item = res.data.items.find(i => i.productId === parseInt(productId));
            setCartItem(item || null);
        } catch (error) {
            console.error("Failed to fetch cart", error);
        }
    };

    const updateQuantity = async (newQuantity) => {
        if (!cartItem) return;
        try {
            await api.put(`/cart/items/${cartItem.itemId}?userId=${user.userId}&quantity=${newQuantity}`);
            fetchCart(); // Refresh local cart state
            refreshCart(); // Refresh header cart count
        } catch (error) {
            toast.error("Failed to update quantity");
        }
    };

    const fetchProduct = async () => {
        try {
            // Re-using the single product fetch or search workaround store fetch if needed
            // Ideally we need a GET /products/{id} endpoint public/customer
            // For now, let's assume we can fetch it via the store's product list or a new endpoint.
            // Wait, we don't have a direct single product endpoint exposed to customer easily without storeId. 
            // Let's deduce storeId from product if we could, or just fetch all store products? No that's inefficient.
            // Actually, we added a global search, maybe we can use that? Or just add a new endpoint quickly?
            // Let's try to fetch via a new endpoint I'll assume exists or create: /api/customer/products/{productId}
            // If that doesn't exist, I'll add it in backend.
            const res = await api.get(`/customer/products/${productId}`);
            setProduct(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load product details");
            // navigate(-1); // Removed to show error UI instead of blank/redirect
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!user) {
            toast.error("Please login to add to cart");
            return;
        }
        setAddingToCart(true);
        try {
            await api.post(`/cart/add?userId=${user.userId}`, {
                productId: product.productId,
                quantity: 1
            });
            toast.success(`Added ${product.productName} to Cart`);
            fetchCart(); // Update local cart count
            refreshCart(); // Update header cart count
        } catch (error) {
            toast.error("Failed to add to cart");
        } finally {
            setAddingToCart(false);
        }
    };

    const nextImage = (e) => {
        e.stopPropagation();
        if (product?.imageUrls?.length) {
            setActiveImageIndex((prev) => (prev + 1) % product.imageUrls.length);
        }
    };

    const prevImage = (e) => {
        e.stopPropagation();
        if (product?.imageUrls?.length) {
            setActiveImageIndex((prev) => (prev - 1 + product.imageUrls.length) % product.imageUrls.length);
        }
    };

    // --- DEBUG LOG ---
    // console.log("Product Data:", product);

    if (loading) return <div className="container" style={{ padding: '2rem' }}>Loading Product...</div>;

    if (!product) {
        return (
            <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>Product not found 😔</h2>
                <button onClick={() => navigate(-1)} className="btn btn-primary" style={{ marginTop: '1rem' }}>Go Back</button>
            </div>
        );
    }

    const currentImage = product.imageUrls && product.imageUrls.length > 0
        ? `http://localhost:8080${product.imageUrls[activeImageIndex]}`
        : null;

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem' }}>
            <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ⬅ Back
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
                {/* Left: Image Gallery (RESTORED w/ TEXT BUTTONS) */}
                <div>
                    <div
                        style={{
                            position: 'relative',
                            height: '500px',
                            background: '#f9f9f9',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: '1px solid #eee',
                            cursor: 'zoom-in',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onClick={() => setIsZoomed(true)}
                    >
                        {currentImage ? (
                            <img src={currentImage} alt={product.productName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        ) : (
                            <span style={{ color: '#ccc', fontSize: '1.5rem' }}>No Image</span>
                        )}

                        {/* Arrows */}
                        {product.imageUrls && product.imageUrls.length > 1 && (
                            <>
                                <button onClick={prevImage} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', borderRadius: '50%', padding: '0.4rem', border: 'none', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', display: 'flex' }}>
                                    <ChevronLeft size={24} />
                                </button>
                                <button onClick={nextImage} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', borderRadius: '50%', padding: '0.4rem', border: 'none', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', display: 'flex' }}>
                                    <ChevronRight size={24} />
                                </button>
                            </>
                        )}
                    </div>
                    {/* Thumbnails */}
                    {product.imageUrls && product.imageUrls.length > 1 && (
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                            {product.imageUrls.map((url, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setActiveImageIndex(idx)}
                                    style={{
                                        width: '80px', height: '80px',
                                        borderRadius: '8px', overflow: 'hidden',
                                        border: activeImageIndex === idx ? '2px solid var(--primary)' : '2px solid transparent',
                                        cursor: 'pointer',
                                        opacity: activeImageIndex === idx ? 1 : 0.6
                                    }}
                                >
                                    <img src={`http://localhost:8080${url}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Product Details */}
                <div>
                    <h1 style={{ marginBottom: '0.5rem', fontSize: '2.5rem' }}>{product.productName}</h1>
                    <p style={{ fontSize: '1.5rem', color: 'var(--primary)', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                        ₹{product.price}
                    </p>

                    <p style={{ color: '#555', lineHeight: '1.6', marginBottom: '2rem', fontSize: '1.1rem' }}>
                        {product.description}
                    </p>

                    {/* Store Info */}
                    <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
                        <h3 style={{ marginTop: 0, fontSize: '1.1rem' }}>Store Info</h3>
                        <p style={{ margin: '0.5rem 0' }}><strong>{product.store?.storeName || 'Unknown Store'}</strong></p>
                        <button
                            onClick={() => product.store?.storeId && navigate(`/store/${product.store.storeId}`)}
                            className="btn btn-outline"
                            style={{ fontSize: '0.9rem' }}
                            disabled={!product.store?.storeId}
                        >
                            Visit Store
                        </button>
                    </div>

                    {/* Add to Cart / Quantity Control */}
                    {cartItem ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f0f0f0', padding: '1rem', borderRadius: '8px', width: 'fit-content' }}>
                            <button
                                onClick={() => updateQuantity(cartItem.quantity - 1)}
                                style={{ background: 'white', border: '1px solid #ccc', borderRadius: '4px', width: '30px', height: '30px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <Minus size={20} />
                            </button>
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{cartItem.quantity} in Cart</span>
                            <button
                                onClick={() => updateQuantity(cartItem.quantity + 1)}
                                style={{ background: 'white', border: '1px solid #ccc', borderRadius: '4px', width: '30px', height: '30px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                    ) : (
                        <button
                            className="btn btn-primary"
                            onClick={handleAddToCart}
                            disabled={addingToCart || product.quantityInStock <= 0}
                            style={{ width: '100%', padding: '1rem', fontSize: '1.2rem' }}
                        >
                            {product.quantityInStock <= 0 ? 'Out of Stock' : (addingToCart ? 'Adding...' : 'Add to Cart 🛒')}
                        </button>
                    )}
                </div>
            </div>

            {/* Lightbox / Zoom (Restored Logic later if needed, kept hidden/minimal or text-based for now) */}
            {isZoomed && currentImage && (
                <div
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.9)', zIndex: 9999,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    onClick={() => setIsZoomed(false)}
                >
                    <button onClick={() => setIsZoomed(false)} style={{ position: 'absolute', top: '2rem', right: '2rem', color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={48} />
                    </button>
                    <img src={currentImage} alt={product.productName} style={{ maxHeight: '90vh', maxWidth: '90vw', objectFit: 'contain' }} />
                </div>
            )}

            {/* Floating Cart Button */}
            <button
                onClick={() => navigate('/cart')}
                style={{
                    position: 'fixed', bottom: '2rem', right: '2rem',
                    background: 'var(--primary)', color: 'white', border: 'none',
                    padding: '1rem 2rem', borderRadius: '50px',
                    fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    zIndex: 100
                }}
            >
                🛒 Go to Cart {cartCount > 0 && <span style={{ background: 'white', color: 'var(--primary)', padding: '2px 8px', borderRadius: '10px', fontSize: '0.9rem' }}>{cartCount}</span>}
            </button>
        </div>
    );
};

export default ProductDetailPage;
