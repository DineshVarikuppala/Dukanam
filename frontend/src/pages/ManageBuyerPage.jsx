import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, ArrowLeft } from 'lucide-react';

const ManageBuyerPage = () => {
    const navigate = useNavigate();

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem' }}>
            <button
                onClick={() => navigate('/admin-dashboard')}
                className="btn btn-outline"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}
            >
                <ArrowLeft size={16} /> Back to Dashboard
            </button>

            <h1 style={{ marginBottom: '2rem' }}>Manage Buyer Screens</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                <div
                    className="card"
                    style={{
                        padding: '2rem', textAlign: 'center', cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
                        transition: 'transform 0.2s', border: '1px solid #eee'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    onClick={() => navigate('/admin/manage-buyer/video')}
                >
                    <div style={{ background: '#e0f2fe', padding: '1.5rem', borderRadius: '50%', color: '#0284c7' }}>
                        <Video size={36} />
                    </div>
                    <h3 style={{ margin: 0 }}>Buyer Dashboard Video</h3>
                    <p style={{ margin: 0, color: '#666' }}>Upload and manage the welcome video displayed on the buyer dashboard</p>
                </div>

                {/* Placeholder for future options */}
            </div>
        </div>
    );
};

export default ManageBuyerPage;
