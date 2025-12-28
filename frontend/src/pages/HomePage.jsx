import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const HomePage = () => {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const [activeVideo, setActiveVideo] = useState(null);
    const [isMuted, setIsMuted] = useState(true); // Default to muted for autoplay

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const res = await api.get('/content/active?type=BUYER_VIDEO');
                if (res.data) {
                    setActiveVideo(res.data);
                    // Apply settings from backend
                    // Default to true/true if fields are missing (backward compatibility)
                    setIsMuted(res.data.muteDefault !== false);
                    // Note: loop is handled directly in video tag logic or we can add state
                }
            } catch (error) {
                console.error("Failed to fetch active video", error);
            }
        };
        fetchVideo();
    }, []);

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem' }}>
            {/* Hero Video Section */}
            {activeVideo ? (
                <div style={{
                    width: 'fit-content',
                    margin: '0 auto',
                    height: '300px',
                    overflow: 'hidden',
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'center',
                    boxShadow: '10px 10px 20px lightgray'
                }}>
                    {/* Video Player */}
                    <video
                        ref={videoRef}
                        autoPlay
                        loop={activeVideo.loopVideo !== false}
                        muted={isMuted} // Controlled by state
                        playsInline
                        key={activeVideo.url} // Re-render if URL changes
                        style={{
                            width: 'auto',
                            height: '100%',
                            objectFit: 'contain',
                            display: 'block'
                        }}
                    >
                        <source src={`http://localhost:8080${activeVideo.url.startsWith('/api') ? activeVideo.url : '/api' + activeVideo.url}`} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>

                    {/* Mute/Unmute Button */}
                    <button
                        onClick={toggleMute}
                        style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            background: 'rgba(0, 0, 0, 0.6)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'white',
                            fontSize: '0.8rem',
                            transition: 'all 0.2s',
                            zIndex: 10
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)';
                            e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)';
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                    >
                        {isMuted ? '🔇' : '🔊'}
                    </button>
                </div>
            ) : (
                // Fallback or placeholder when no video is active
                <div style={{ textAlign: 'center', padding: '3rem', color: '#888', background: '#f9f9f9', borderRadius: '12px', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div>
                        <h2>Welcome to Dukanam</h2>
                        <p>Your Local Shop</p>
                    </div>
                </div>
            )}

            {/* Featured Categories or Content */}
            <div style={{ marginTop: '3rem' }}>
                <h2 style={{ marginBottom: '1.5rem' }}>Shop by Category</h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {[
                        { name: 'Electronics', icon: '📱', path: '/section/Electronics' },
                        { name: 'Groceries', icon: '🛒', path: '/section/Groceries' },
                        { name: 'Fashion', icon: '👕', path: '/section/Fashion' },
                        { name: 'Home & Kitchen', icon: '🏠', path: '/section/Home%20%26%20Kitchen' }
                    ].map((category) => (
                        <div
                            key={category.name}
                            className="card"
                            onClick={() => navigate(category.path)}
                            style={{
                                cursor: 'pointer',
                                textAlign: 'center',
                                padding: '2rem 1rem',
                                transition: 'transform 0.2s, box-shadow 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '';
                            }}
                        >
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{category.icon}</div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{category.name}</h3>
                        </div>
                    ))}
                </div>
            </div>

            {/* Browse All Stores Button */}
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                <button
                    onClick={() => navigate('/customer-dashboard')}
                    className="btn btn-primary"
                    style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}
                >
                    Browse All Stores
                </button>
            </div>
        </div>
    );
};

export default HomePage;
