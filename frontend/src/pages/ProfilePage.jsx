import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { Edit2, Save, X, Package, AlertCircle } from 'lucide-react';

const ProfilePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [orderCount, setOrderCount] = useState(0);
    const [orderStatusBreakdown, setOrderStatusBreakdown] = useState({});
    const [loading, setLoading] = useState(true);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [requestField, setRequestField] = useState('');
    const [newValue, setNewValue] = useState('');
    const [pendingRequests, setPendingRequests] = useState([]);

    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        mobileNumber: ''
    });

    const [editData, setEditData] = useState({
        firstName: '',
        lastName: ''
    });

    useEffect(() => {
        fetchProfileData();
        fetchOrderCount();
        fetchPendingRequests();
    }, []);

    const fetchProfileData = async () => {
        try {
            const res = await api.get(`/auth/user/${user.userId}`);
            setProfileData({
                firstName: res.data.firstName || '',
                lastName: res.data.lastName || '',
                email: res.data.email || '',
                mobileNumber: res.data.mobileNumber || ''
            });
            setEditData({
                firstName: res.data.firstName || '',
                lastName: res.data.lastName || ''
            });
        } catch (error) {
            console.error('Failed to load profile', error);
            toast.error('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const fetchOrderCount = async () => {
        try {
            if (user.role === 'STORE_OWNER') {
                // Fetch store orders for owners
                const res = await api.get(`/orders/store?storeId=${user.storeId}`);
                const orders = res.data;
                setOrderCount(orders.length || 0);

                // Calculate status breakdown
                const breakdown = orders.reduce((acc, order) => {
                    acc[order.status] = (acc[order.status] || 0) + 1;
                    return acc;
                }, {});
                setOrderStatusBreakdown(breakdown);
            } else {
                // Fetch customer orders
                const res = await api.get(`/orders/customer?userId=${user.userId}`);
                setOrderCount(res.data.length || 0);
            }
        } catch (error) {
            console.error('Failed to load orders', error);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setEditData({
            firstName: profileData.firstName,
            lastName: profileData.lastName
        });
        setIsEditing(false);
    };

    const handleSave = async () => {
        try {
            await api.put(`/auth/user/${user.userId}`, editData);
            setProfileData({
                ...profileData,
                firstName: editData.firstName,
                lastName: editData.lastName
            });
            setIsEditing(false);
            toast.success('Profile updated successfully!');
        } catch (error) {
            console.error('Failed to update profile', error);
            toast.error('Failed to update profile');
        }
    };

    const fetchPendingRequests = async () => {
        try {
            const res = await api.get(`/profile-requests/user/${user.userId}/pending`);
            setPendingRequests(res.data);
        } catch (error) {
            console.error('Failed to load pending requests', error);
        }
    };

    const handleRequestChange = (field) => {
        setRequestField(field);
        setNewValue('');
        setShowRequestModal(true);
    };

    const handleSubmitRequest = async () => {
        if (!newValue.trim()) {
            toast.error('Please enter a new value');
            return;
        }

        try {
            const changes = {
                [requestField]: {
                    old: profileData[requestField],
                    new: newValue
                }
            };
            console.log('Submitting request:', { userId: user.userId, changes });
            const response = await api.post(`/profile-requests/${user.userId}`, changes);
            console.log('Request submitted successfully:', response.data);
            toast.success('Change request submitted! Admin will review it.');
            setShowRequestModal(false);
            setNewValue('');
            fetchPendingRequests();
        } catch (error) {
            console.error('Failed to submit request - Full error:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            toast.error(error.response?.data?.message || 'Failed to submit request');
        }
    };

    if (loading) {
        return <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
    }

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>My Account</h1>
                {!isEditing ? (
                    <button onClick={handleEdit} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Edit2 size={18} />
                        Edit Profile
                    </button>
                ) : (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={handleSave} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Save size={18} />
                            Save
                        </button>
                        <button onClick={handleCancel} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <X size={18} />
                            Cancel
                        </button>
                    </div>
                )}
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Personal Information</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    {/* First Name */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
                            First Name
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={editData.firstName}
                                onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                                className="input-field"
                            />
                        ) : (
                            <p style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem', margin: 0 }}>
                                {profileData.firstName}
                            </p>
                        )}
                    </div>

                    {/* Last Name */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
                            Last Name
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={editData.lastName}
                                onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                                className="input-field"
                            />
                        ) : (
                            <p style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem', margin: 0 }}>
                                {profileData.lastName}
                            </p>
                        )}
                    </div>

                    {/* Email (Read-only) */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
                            Email Address
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <p style={{ flex: 1, padding: '0.75rem', background: '#f1f5f9', borderRadius: '0.5rem', margin: 0, color: 'var(--text-muted)' }}>
                                {profileData.email}
                            </p>
                            <button
                                onClick={() => handleRequestChange('email')}
                                className="btn btn-outline"
                                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                            >
                                Request Change
                            </button>
                        </div>
                    </div>

                    {/* Mobile Number (Read-only) */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
                            Mobile Number
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <p style={{ flex: 1, padding: '0.75rem', background: '#f1f5f9', borderRadius: '0.5rem', margin: 0, color: 'var(--text-muted)' }}>
                                {profileData.mobileNumber}
                            </p>
                            <button
                                onClick={() => handleRequestChange('mobileNumber')}
                                className="btn btn-outline"
                                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                            >
                                Request Change
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Statistics - Hidden for Admin users */}
            {user.role !== 'ADMIN' && (
                <div className="card" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Package size={48} />
                        <div>
                            <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>Total Orders</h3>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{orderCount}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate(user.role === 'STORE_OWNER' ? '/store-orders' : '/orders')}
                        style={{
                            marginTop: '1rem',
                            background: 'white',
                            color: '#1e3a8a',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        View All Orders
                    </button>
                </div>
            )}

            {/* Order Status Breakdown for Store Owners */}
            {user.role === 'STORE_OWNER' && orderCount > 0 && (
                <div className="card" style={{ marginTop: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Order Status Breakdown</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {['PENDING', 'ACCEPTED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(status => {
                            const count = orderStatusBreakdown[status] || 0;
                            const percentage = orderCount > 0 ? (count / orderCount) * 100 : 0;

                            const statusColors = {
                                'PENDING': '#f59e0b',
                                'ACCEPTED': '#3b82f6',
                                'PACKED': '#f97316',
                                'SHIPPED': '#8b5cf6',
                                'DELIVERED': '#10b981',
                                'CANCELLED': '#ef4444'
                            };

                            return (
                                <div key={status}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{status}</span>
                                        <span style={{ fontWeight: '600', color: statusColors[status] }}>{count}</span>
                                    </div>
                                    <div style={{
                                        width: '100%',
                                        height: '24px',
                                        background: '#f3f4f6',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        position: 'relative'
                                    }}>
                                        <div style={{
                                            width: `${percentage}%`,
                                            height: '100%',
                                            background: statusColors[status],
                                            transition: 'width 0.5s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'flex-end',
                                            paddingRight: count > 0 ? '0.5rem' : '0'
                                        }}>
                                            {count > 0 && (
                                                <span style={{
                                                    color: 'white',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600'
                                                }}>
                                                    {Math.round(percentage)}%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Pending Requests Banner */}
            {pendingRequests.length > 0 && (
                <div className="card" style={{ marginTop: '2rem', background: '#fef3c7', border: '1px solid #f59e0b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <AlertCircle size={24} color="#f59e0b" />
                        <div>
                            <h3 style={{ margin: 0, marginBottom: '0.25rem', color: '#92400e' }}>Pending Change Requests</h3>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#78350f' }}>
                                You have {pendingRequests.length} pending request{pendingRequests.length > 1 ? 's' : ''} awaiting admin approval.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Back Button */}
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button onClick={() => navigate(-1)} className="btn btn-outline">
                    Go Back
                </button>
            </div>

            {/* Request Change Modal */}
            {showRequestModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="card" style={{ maxWidth: '500px', width: '90%', padding: '2rem' }}>
                        <h2 style={{ marginTop: 0 }}>Request {requestField === 'email' ? 'Email' : 'Mobile Number'} Change</h2>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Current Value</label>
                            <p style={{ padding: '0.75rem', background: '#f1f5f9', borderRadius: '0.5rem', margin: 0 }}>
                                {profileData[requestField]}
                            </p>
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>New Value</label>
                            <input
                                type={requestField === 'email' ? 'email' : 'tel'}
                                value={newValue}
                                onChange={(e) => setNewValue(e.target.value)}
                                className="input-field"
                                placeholder={`Enter new ${requestField === 'email' ? 'email' : 'mobile number'}`}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={handleSubmitRequest} className="btn btn-primary" style={{ flex: 1 }}>
                                Submit Request
                            </button>
                            <button onClick={() => setShowRequestModal(false)} className="btn btn-outline" style={{ flex: 1 }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
