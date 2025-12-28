import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Settings, MapPin, UserCircle, Search, X, ShoppingCart, Package } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import api from '../api';

const Header = () => {
    const { user, logout } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchHistory, setShowSearchHistory] = useState(false);
    const [searchHistory, setSearchHistory] = useState([]);

    // Load search history from localStorage on mount
    React.useEffect(() => {
        const history = localStorage.getItem('dukanam_search_history');
        if (history) {
            setSearchHistory(JSON.parse(history));
        }
    }, []);

    const saveSearchToHistory = (query) => {
        if (!query.trim()) return;

        let history = [...searchHistory];
        // Remove if already exists
        history = history.filter(item => item !== query);
        // Add to beginning
        history.unshift(query);
        // Keep only last 10
        history = history.slice(0, 10);

        setSearchHistory(history);
        localStorage.setItem('dukanam_search_history', JSON.stringify(history));
    };

    const deleteSearchItem = (query) => {
        const history = searchHistory.filter(item => item !== query);
        setSearchHistory(history);
        localStorage.setItem('dukanam_search_history', JSON.stringify(history));
    };

    const clearSearchHistory = () => {
        setSearchHistory([]);
        localStorage.removeItem('dukanam_search_history');
    };

    const handleLogout = async () => {
        try {
            // Record logout in backend
            if (user?.userId) {
                await api.post('/login-sessions/logout', { userId: user.userId });
            }
        } catch (error) {
            console.error('Failed to record logout:', error);
        } finally {
            // Logout regardless of whether recording succeeded
            logout();
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        saveSearchToHistory(searchQuery);
        setShowSearchHistory(false);
        // Navigate to customer dashboard with search query
        navigate(`/all-products?search=${encodeURIComponent(searchQuery)}`);
    };

    return (
        <>
            <header style={{
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                background: '#E2E8F0',
                borderBottom: '1px solid var(--border)',
                padding: '1rem 0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 2rem',
                    maxWidth: '100%'
                }}>
                    {/* Logo Section - Far Left */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            cursor: 'pointer'
                        }}
                        onClick={() => navigate('/dashboard')}
                    >
                        <img
                            src="/shopping-bag-icon.png"
                            alt="Shopping Bag"
                            style={{ width: '50px', height: '50px', objectFit: 'contain' }}
                        />
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                lineHeight: '1.2'
                            }}
                        >
                            <span style={{
                                fontSize: '1.75rem',
                                fontWeight: '700',
                                color: '#1e3a8a',
                                letterSpacing: '0.5px'
                            }}>
                                DUKANAM
                            </span>
                            <span style={{
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                color: '#4a9d2e',
                                letterSpacing: '2px',
                                marginTop: '-2px'
                            }}>
                                YOUR LOCAL SHOP
                            </span>
                        </div>
                    </div>

                    {/* Search Bar - Center (Only for Customers) */}
                    {user && user.role === 'CUSTOMER' && (
                        <div style={{ flex: 1, maxWidth: '600px', margin: '0 2rem', position: 'relative' }}>
                            <form onSubmit={handleSearch} style={{ position: 'relative', display: 'flex', gap: '0.5rem' }}>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <Search
                                        size={20}
                                        style={{
                                            position: 'absolute',
                                            left: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#9ca3af'
                                        }}
                                    />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={() => setShowSearchHistory(true)}
                                        onBlur={() => setTimeout(() => setShowSearchHistory(false), 200)}
                                        placeholder="Search for products..."
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 2.5rem',
                                            border: '2px solid #e5e7eb',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.95rem',
                                            outline: 'none',
                                            transition: 'border-color 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.target.style.borderColor = '#3b82f6'}
                                        onMouseLeave={(e) => e.target.style.borderColor = '#e5e7eb'}
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery('')}
                                            style={{
                                                position: 'absolute',
                                                right: '12px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                padding: '4px',
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <X size={18} color="#9ca3af" />
                                        </button>
                                    )}
                                </div>

                                {/* Search Button */}
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        whiteSpace: 'nowrap',
                                        zIndex: 10,
                                        position: 'relative'
                                    }}
                                >
                                    <Search size={20} />
                                    Search
                                </button>

                                {/* Search History Dropdown */}
                                {showSearchHistory && searchHistory.length > 0 && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        right: 0,
                                        background: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '0.5rem',
                                        marginTop: '0.5rem',
                                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                        zIndex: 1000,
                                        maxHeight: '300px',
                                        overflowY: 'auto'
                                    }}>
                                        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb', fontWeight: '600', fontSize: '0.85rem', color: '#6b7280' }}>
                                            Recent Searches
                                        </div>
                                        {searchHistory.map((item, index) => (
                                            <div
                                                key={index}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '0.75rem 1rem',
                                                    cursor: 'pointer',
                                                    borderBottom: index < searchHistory.length - 1 ? '1px solid #f3f4f6' : 'none',
                                                    transition: 'background 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                            >
                                                <span
                                                    onMouseDown={() => {
                                                        setSearchQuery(item);
                                                        setShowSearchHistory(false);
                                                    }}
                                                    style={{ flex: 1, fontSize: '0.9rem' }}
                                                >
                                                    {item}
                                                </span>
                                                <button
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        deleteSearchItem(item);
                                                    }}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        padding: '4px',
                                                        display: 'flex',
                                                        alignItems: 'center'
                                                    }}
                                                >
                                                    <X size={16} color="#9ca3af" />
                                                </button>
                                            </div>
                                        ))}
                                        <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #e5e7eb' }}>
                                            <button
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    clearSearchHistory();
                                                }}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.5rem',
                                                    background: '#fee2e2',
                                                    color: '#dc2626',
                                                    border: 'none',
                                                    borderRadius: '0.375rem',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    transition: 'background 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.target.style.background = '#fecaca'}
                                                onMouseLeave={(e) => e.target.style.background = '#fee2e2'}
                                            >
                                                Clear History
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>
                    )}

                    {/* Right Section - Notifications, Profile, Logout */}
                    {user && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <NotificationDropdown />

                            {/* Profile Dropdown - For All Users */}
                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '0.5rem',
                                        borderRadius: '0.5rem',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#d1d5db'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <UserCircle size={32} color="#1e3a8a" />
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                        <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{user.userName}</span>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                            {user.role === 'STORE_OWNER' ? 'Seller' : user.role === 'ADMIN' ? 'Admin' : 'Buyer'}
                                        </span>
                                    </div>
                                </button>

                                {/* Dropdown Menu */}
                                {showProfileMenu && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        right: 0,
                                        marginTop: '0.5rem',
                                        background: 'white',
                                        borderRadius: '0.5rem',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                        minWidth: '200px',
                                        zIndex: 1000,
                                        overflow: 'hidden'
                                    }}>
                                        <button
                                            onClick={() => {
                                                setShowProfileMenu(false);
                                                navigate('/profile');
                                            }}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem 1rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                border: 'none',
                                                background: 'transparent',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                transition: 'background 0.2s',
                                                textAlign: 'left'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <User size={18} />
                                            <span>My Account</span>
                                        </button>
                                        {user.role === 'CUSTOMER' && (
                                            <button
                                                onClick={() => {
                                                    setShowProfileMenu(false);
                                                    navigate('/addresses');
                                                }}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem 1rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.75rem',
                                                    border: 'none',
                                                    background: 'transparent',
                                                    cursor: 'pointer',
                                                    fontSize: '0.9rem',
                                                    transition: 'background 0.2s',
                                                    textAlign: 'left'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <MapPin size={18} />
                                                <span>Saved Addresses</span>
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                setShowProfileMenu(false);
                                                navigate('/settings');
                                            }}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem 1rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                border: 'none',
                                                background: 'transparent',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                transition: 'background 0.2s',
                                                textAlign: 'left'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <Settings size={18} />
                                            <span>Settings</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="btn btn-outline"
                                style={{
                                    padding: '0.5rem 1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <LogOut size={18} />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Secondary Navigation - My Orders and Cart (Only for Customers) */}
            {
                user && user.role === 'CUSTOMER' && (
                    <div style={{
                        position: 'sticky',
                        top: '82px', // Reduce gap
                        zIndex: 999,
                        background: 'white',
                        borderBottom: '1px solid #e5e7eb',
                        padding: '0.75rem 2rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '2rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{
                            display: 'flex',
                            gap: '2rem',
                            overflowX: 'auto',
                            flex: 1
                        }}>
                            {['Home', 'All', 'Bestsellers', 'Electronics', 'Groceries', 'Fashion', 'Home & Kitchen', 'Help'].map((category) => {
                                // Determine if this category is active
                                const isActive =
                                    (category === 'Home' && location.pathname === '/home') ||
                                    (category === 'All' && location.pathname === '/all-products') ||
                                    (category === 'Bestsellers' && location.pathname === '/bestsellers') ||
                                    (category === 'Help' && location.pathname === '/settings') ||
                                    (location.pathname === `/section/${encodeURIComponent(category)}`);

                                return (
                                    <button
                                        key={category}
                                        onClick={() => {
                                            if (category === 'Home') {
                                                navigate('/home');
                                            } else if (category === 'All') {
                                                navigate('/all-products');
                                            } else if (category === 'Bestsellers') {
                                                navigate('/bestsellers');
                                            } else if (category === 'Help') {
                                                navigate('/help');
                                            } else {
                                                // Navigate to section-specific page
                                                navigate(`/section/${encodeURIComponent(category)}`);
                                            }
                                        }}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            padding: '0.5rem 1rem',
                                            cursor: 'pointer',
                                            fontSize: '0.95rem',
                                            fontWeight: isActive ? '600' : '500',
                                            color: isActive ? 'var(--primary)' : '#374151',
                                            transition: 'all 0.2s',
                                            borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                                            whiteSpace: 'nowrap'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.color = '#1e3a8a';
                                            e.target.style.borderBottomColor = '#1e3a8a';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.color = isActive ? 'var(--primary)' : '#374151';
                                            e.target.style.borderBottomColor = isActive ? 'var(--primary)' : 'transparent';
                                        }}
                                    >
                                        {category}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '1rem', flexShrink: 0 }}>
                            <button
                                onClick={() => navigate('/orders')}
                                className="btn btn-outline"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <Package size={18} />
                                My Orders
                            </button>
                            <button
                                onClick={() => navigate('/cart')}
                                className="btn btn-primary"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}
                            >
                                <ShoppingCart size={18} />
                                Cart {cartCount > 0 && `(${cartCount})`}
                                {cartCount > 0 && (
                                    <span style={{
                                        position: 'absolute',
                                        top: '-8px',
                                        right: '-8px',
                                        background: '#dc2626',
                                        color: 'white',
                                        borderRadius: '50%',
                                        minWidth: '20px',
                                        height: '20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        padding: '0 4px'
                                    }}>
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                )
            }


        </>
    );
};

export default Header;
