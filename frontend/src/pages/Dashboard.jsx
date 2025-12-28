import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Redirect customers to home page
        if (user.role === 'CUSTOMER') {
            navigate('/home');
        } else if (user.role === 'ADMIN') {
            navigate('/admin-dashboard');
        } else if (user.role === 'STORE_OWNER') {
            fetchStore();
        }
    }, [user]);

    const fetchStore = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/store/my-store?ownerId=${user.userId}`);
            setStore(res.data);
        } catch (error) {
            // No store found or error
            setStore(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container animate-fade-in">
            {/* Headers removed */}
            {/* Role display removed as requested */}

            {/* --- CUSTOMER VIEW --- */}
            {user.role === 'CUSTOMER' && (
                <div style={{ marginTop: '2rem' }}>
                    {/* Redirecting to /home */}
                </div>
            )}

            {/* --- STORE OWNER VIEW --- */}
            {user.role === 'STORE_OWNER' && (
                <div style={{ marginTop: '2rem' }}>
                    {loading ? <p>Loading Store Details...</p> : (
                        store ? (
                            <div className="card" style={{ textAlign: 'center' }}>
                                {store.storeLogoUrl && (
                                    <img
                                        src={`http://localhost:8080${store.storeLogoUrl}`}
                                        alt="Store Logo"
                                        style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1rem' }}
                                    />
                                )}
                                <h2>{store.storeName}</h2>
                                <p style={{ color: '#666' }}>{store.storeAddress}</p>

                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                                    <Link to="/store-setup" state={{ store }} className="btn btn-outline">
                                        Edit Store Details
                                    </Link>
                                    <Link to="/inventory" className="btn btn-primary">
                                        Manage Inventory
                                    </Link>
                                    <Link to="/store-orders" className="btn btn-primary" style={{ background: '#ffa500', borderColor: '#ffa500' }}>
                                        Manage Orders 📦
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="card">
                                <h3>You haven't set up your store yet.</h3>
                                <p>Create your store profile to start selling.</p>
                                <Link to="/store-setup" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
                                    Setup Store Profile
                                </Link>
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
