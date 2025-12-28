import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';
import { ShoppingCart, Package, Minus, Plus, Loader2 } from 'lucide-react';

const SectionProductsPage = () => {
    const { sectionName } = useParams();
    const navigate = useNavigate();
    const { addToCart, refreshCart } = useCart();
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cartItems, setCartItems] = useState([]);
    const [showFloatingCart, setShowFloatingCart] = useState(false);
    const [loadingProductId, setLoadingProductId] = useState(null);
    const [activeSection, setActiveSection] = useState(null); // Track active section for highlighting

    useEffect(() => {
        setLoading(true); // Show loader when switching sections
        setLoadingProductId(null); // Reset any ongoing operations
        fetchProducts();
        if (user) fetchCart();
    }, [sectionName, user]);

    // Intersection Observer to track active section while scrolling
    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -70% 0px', // Trigger when section is in the middle of viewport
            threshold: 0
        };

        const observerCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        // Observe all category and subcategory sections
        const sections = document.querySelectorAll('[id^="category-"], [id*="-"]');
        sections.forEach(section => observer.observe(section));

        return () => {
            sections.forEach(section => observer.unobserve(section));
        };
    }, [products]); // Re-run when products change

    const fetchProducts = async () => {
        try {
            const res = await api.get('/customer/products/all-by-category');
            const allProductsByCategory = res.data;

            const sectionProducts = [];
            Object.keys(allProductsByCategory).forEach(categoryName => {
                const categoryProducts = allProductsByCategory[categoryName];
                if (categoryProducts && categoryProducts.length > 0) {
                    const firstProduct = categoryProducts[0];
                    if (firstProduct.category && firstProduct.category.section === sectionName) {
                        sectionProducts.push(...categoryProducts);
                    }
                }
            });

            setProducts(sectionProducts);
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

    const handleAddToCart = async (product) => {
        setLoadingProductId(product.productId);
        try {
            await addToCart(product.productId, 1);
            toast.success(`${product.productName} added to cart!`);

            // Fetch cart to get real itemId, but do it silently
            const res = await api.get(`/cart?userId=${user.userId}`);
            setCartItems(res.data.items || []);

            refreshCart();
            setShowFloatingCart(true);
        } catch (error) {
            console.error('Failed to add to cart:', error);
            toast.error('Failed to add to cart');
        } finally {
            setLoadingProductId(null);
        }
    };

    const updateQuantity = async (cartItem, newQuantity, productId) => {
        setLoadingProductId(productId);

        try {
            if (newQuantity < 1) {
                await api.delete(`/cart/items/${cartItem.itemId}?userId=${user.userId}`);
                toast.success('Item removed from cart');
                // Remove from local state
                setCartItems(prev => prev.filter(item => item.itemId !== cartItem.itemId));
            } else {
                await api.put(`/cart/items/${cartItem.itemId}?userId=${user.userId}&quantity=${newQuantity}`);
                // Update local state
                setCartItems(prev => prev.map(item =>
                    item.itemId === cartItem.itemId ? { ...item, quantity: newQuantity } : item
                ));
            }
            // Only refresh header count, don't fetch full cart
            refreshCart();
        } catch (error) {
            console.error('Update quantity error:', error);
            toast.error('Failed to update quantity');
        } finally {
            setLoadingProductId(null);
        }
    };

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    if (loading) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
                <Loader2 size={48} className="spin" style={{ margin: '0 auto 1rem', color: 'var(--primary)' }} />
                <p style={{ color: '#666' }}>Loading {sectionName} products...</p>
                <style jsx>{`
                    .spin {
                        animation: spin 0.8s linear infinite;
                    }
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <Package size={64} color="#ccc" style={{ margin: '0 auto 1rem' }} />
                <h2>No Products in {sectionName}</h2>
                <p style={{ color: '#666' }}>Check back later for new products!</p>
            </div>
        );
    }

    // Group products by category, then by subcategory
    const productsByCategory = {};
    products.forEach(product => {
        const categoryName = product.category?.categoryName || 'Uncategorized';
        if (!productsByCategory[categoryName]) {
            productsByCategory[categoryName] = {
                bySubcategory: {},
                uncategorized: []
            };
        }

        if (product.subcategory && product.subcategory.subcategoryName) {
            const subcatName = product.subcategory.subcategoryName;
            if (!productsByCategory[categoryName].bySubcategory[subcatName]) {
                productsByCategory[categoryName].bySubcategory[subcatName] = [];
            }
            productsByCategory[categoryName].bySubcategory[subcatName].push(product);
        } else {
            productsByCategory[categoryName].uncategorized.push(product);
        }
    });

    const categoryNames = Object.keys(productsByCategory).sort();

    // Helper function to get cart item
    const getCartItem = (productId) => {
        return cartItems.find(item => item.productId === productId);
    };

    // Function to scroll to a specific section
    const scrollToSection = (categoryName, subcategoryName = null) => {
        const elementId = subcategoryName
            ? `${categoryName}-${subcategoryName}`.replace(/\s+/g, '-')
            : `category-${categoryName}`.replace(/\s+/g, '-');
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div style={{ display: 'block', padding: '0', width: '100%', minHeight: '100vh', position: 'relative' }}>
            {/* Sidebar Navigator - FIXED */}
            <div style={{
                width: '250px',
                flexShrink: 0,
                position: 'fixed',
                top: '128px', // Match header stack height
                left: 0,
                bottom: 0,
                overflowY: 'auto',
                background: 'white',
                borderRight: '1px solid #e0e0e0',
                padding: '2rem 1.5rem',
                zIndex: 90, // Ensure it sits below headers (1000/999) but above content
                /* Custom scrollbar */
                scrollbarWidth: 'thin',
                scrollbarColor: 'var(--primary) #f0f0f0'
            }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: '600', color: '#333' }}>
                    Quick Navigation
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {categoryNames.map(categoryName => {
                        const categoryData = productsByCategory[categoryName];
                        const subcategoryNames = Object.keys(categoryData.bySubcategory).sort();
                        const categoryId = `category-${categoryName.replace(/\s+/g, '-')}`;
                        const isCategoryActive = activeSection === categoryId;

                        return (
                            <div key={categoryName} style={{ marginBottom: '0.5rem' }}>
                                {/* Category Link */}
                                <button
                                    onClick={() => scrollToSection(categoryName)}
                                    style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '0.5rem 0.75rem',
                                        background: isCategoryActive ? '#e0f2fe' : 'none',
                                        border: 'none',
                                        borderLeft: `3px solid ${isCategoryActive ? 'var(--primary)' : '#e0e0e0'}`,
                                        cursor: 'pointer',
                                        fontSize: '0.95rem',
                                        fontWeight: isCategoryActive ? '700' : '600',
                                        color: isCategoryActive ? 'var(--primary)' : '#555',
                                        transition: 'all 0.2s',
                                        borderRadius: '0 4px 4px 0'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isCategoryActive) {
                                            e.target.style.background = '#f0f9ff';
                                            e.target.style.paddingLeft = '1rem';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isCategoryActive) {
                                            e.target.style.background = 'none';
                                            e.target.style.paddingLeft = '0.75rem';
                                        }
                                    }}
                                >
                                    {categoryName}
                                </button>

                                {/* Subcategory Links */}
                                {subcategoryNames.length > 0 && (
                                    <div style={{ marginLeft: '1rem', marginTop: '0.25rem' }}>
                                        {subcategoryNames.map(subcatName => {
                                            const subcatId = `${categoryName}-${subcatName}`.replace(/\s+/g, '-');
                                            const isSubcatActive = activeSection === subcatId;

                                            return (
                                                <button
                                                    key={subcatName}
                                                    onClick={() => scrollToSection(categoryName, subcatName)}
                                                    style={{
                                                        width: '100%',
                                                        textAlign: 'left',
                                                        padding: '0.4rem 0.5rem',
                                                        background: isSubcatActive ? '#f0f9ff' : 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        fontSize: '0.85rem',
                                                        color: isSubcatActive ? 'var(--primary)' : '#666',
                                                        fontWeight: isSubcatActive ? '600' : '400',
                                                        transition: 'all 0.2s',
                                                        borderRadius: '4px'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.background = '#f5f5f5';
                                                        e.target.style.color = 'var(--primary)';
                                                        e.target.style.paddingLeft = '0.75rem';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.background = isSubcatActive ? '#f0f9ff' : 'none';
                                                        e.target.style.color = isSubcatActive ? 'var(--primary)' : '#666';
                                                        e.target.style.paddingLeft = '0.5rem';
                                                    }}
                                                >
                                                    • {subcatName}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Custom scrollbar styles */}
                <style>{`
                    div::-webkit-scrollbar {
                        width: 6px;
                    }
                    div::-webkit-scrollbar-track {
                        background: #f0f0f0;
                        border-radius: 3px;
                    }
                    div::-webkit-scrollbar-thumb {
                        background: var(--primary);
                        border-radius: 3px;
                    }
                    div::-webkit-scrollbar-thumb:hover {
                        background: #0056b3;
                    }
                `}</style>
            </div>

            {/* Main Content */}
            <div style={{ marginLeft: '300px', minWidth: 0 }}>
                {/* Header */}
                <div style={{
                    // position: 'sticky',
                    // top: '128px',
                    // zIndex: 10,
                    background: 'white',
                    padding: '2rem 2rem 1rem 0',
                    borderBottom: '1px solid #e0e0e0',
                    marginBottom: '1rem'
                }}>
                    <h1 style={{ margin: '0 0 0.5rem 0' }}>{sectionName}</h1>
                    <p style={{ color: '#666', margin: 0 }}>
                        {products.length} product{products.length !== 1 ? 's' : ''} available
                    </p>
                </div>

                {/* Scrollable Content */}
                <div style={{ padding: '0 2rem 2rem 0' }}>

                    {categoryNames.map(categoryName => {
                        const categoryData = productsByCategory[categoryName];
                        const subcategoryNames = Object.keys(categoryData.bySubcategory).sort();

                        return (
                            <div key={categoryName} style={{ marginBottom: '3rem' }}>
                                <h2
                                    id={`category-${categoryName.replace(/\s+/g, '-')}`}
                                    style={{
                                        // position: 'sticky',
                                        // top: '220px', 
                                        // zIndex: 9,
                                        marginTop: '1.5rem',
                                        marginBottom: '1.5rem',
                                        paddingBottom: '0.75rem',
                                        paddingTop: '0.5rem',
                                        borderBottom: '3px solid var(--primary)',
                                        color: 'var(--primary)',
                                        fontSize: '1.5rem',
                                        fontSize: '1.5rem',
                                        scrollMarginTop: '150px'
                                    }}
                                >
                                    {categoryName}
                                </h2>

                                {subcategoryNames.map(subcatName => (
                                    <div
                                        key={subcatName}
                                        id={`${categoryName}-${subcatName}`.replace(/\s+/g, '-')}
                                        style={{ marginBottom: '2rem', scrollMarginTop: '150px' }}
                                    >
                                        <h3 style={{
                                            // position: 'sticky',
                                            // top: '280px',
                                            // zIndex: 8,
                                            marginBottom: '1rem',
                                            paddingLeft: '1rem',
                                            paddingTop: '0.5rem',
                                            paddingBottom: '0.5rem',
                                            borderLeft: '4px solid var(--primary)',
                                            color: '#333',
                                            fontSize: '1.2rem'
                                        }}>
                                            {subcatName}
                                        </h3>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                                            gap: '1.5rem'
                                        }}>
                                            {categoryData.bySubcategory[subcatName].map(product => {
                                                const cartItem = getCartItem(product.productId);
                                                const isLoading = loadingProductId === product.productId;

                                                return (
                                                    <div key={product.productId} className="card" style={{ cursor: 'pointer' }}>
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
                                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                />
                                                            ) : (
                                                                <Package size={48} color="#ccc" />
                                                            )}
                                                        </div>

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

                                                            <p style={{ margin: '0 0 1rem', fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                                                                ₹{product.price}
                                                            </p>

                                                            {cartItem ? (
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
                                                                            updateQuantity(cartItem, cartItem.quantity - 1, product.productId);
                                                                        }}
                                                                        className="btn btn-outline"
                                                                        style={{ padding: '0.5rem', flex: 1 }}
                                                                    >
                                                                        <Minus size={16} />
                                                                    </button>
                                                                    <span style={{ fontWeight: 'bold', minWidth: '2rem', textAlign: 'center' }}>
                                                                        {cartItem.quantity}
                                                                    </span>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            updateQuantity(cartItem, cartItem.quantity + 1, product.productId);
                                                                        }}
                                                                        className="btn btn-outline"
                                                                        style={{ padding: '0.5rem', flex: 1 }}
                                                                    >
                                                                        <Plus size={16} />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleAddToCart(product);
                                                                    }}
                                                                    className="btn btn-primary"
                                                                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                                                >
                                                                    <ShoppingCart size={18} />
                                                                    Add to Cart
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}

                                {categoryData.uncategorized.length > 0 && (
                                    <div style={{ marginBottom: '2rem' }}>
                                        <h3 style={{
                                            marginBottom: '1rem',
                                            paddingLeft: '1rem',
                                            borderLeft: '4px solid #999',
                                            color: '#666',
                                            fontSize: '1.1rem'
                                        }}>
                                            Other {categoryName} Products
                                        </h3>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                                            gap: '1.5rem'
                                        }}>
                                            {categoryData.uncategorized.map(product => {
                                                const cartItem = getCartItem(product.productId);
                                                const isLoading = loadingProductId === product.productId;

                                                return (
                                                    <div key={product.productId} className="card" style={{ cursor: 'pointer' }}>
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
                                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                />
                                                            ) : (
                                                                <Package size={48} color="#ccc" />
                                                            )}
                                                        </div>

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

                                                            <p style={{ margin: '0 0 1rem', fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                                                                ₹{product.price}
                                                            </p>

                                                            {cartItem ? (
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
                                                                            updateQuantity(cartItem, cartItem.quantity - 1, product.productId);
                                                                        }}
                                                                        className="btn btn-outline"
                                                                        style={{ padding: '0.5rem', flex: 1 }}
                                                                    >
                                                                        <Minus size={16} />
                                                                    </button>
                                                                    <span style={{ fontWeight: 'bold', minWidth: '2rem', textAlign: 'center' }}>
                                                                        {cartItem.quantity}
                                                                    </span>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            updateQuantity(cartItem, cartItem.quantity + 1, product.productId);
                                                                        }}
                                                                        className="btn btn-outline"
                                                                        style={{ padding: '0.5rem', flex: 1 }}
                                                                    >
                                                                        <Plus size={16} />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleAddToCart(product);
                                                                    }}
                                                                    className="btn btn-primary"
                                                                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                                                >
                                                                    <ShoppingCart size={18} />
                                                                    Add to Cart
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {showFloatingCart && cartItems.length > 0 && (
                        <button
                            onClick={() => navigate('/cart')}
                            className="btn btn-primary"
                            style={{
                                position: 'fixed',
                                bottom: '2rem',
                                right: '2rem',
                                padding: '1rem 1.5rem',
                                borderRadius: '50px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '1rem',
                                zIndex: 1000
                            }}
                        >
                            <ShoppingCart size={20} />
                            View Cart ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SectionProductsPage;
