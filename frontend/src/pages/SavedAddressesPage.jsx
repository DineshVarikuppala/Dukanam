import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Home, MapPin } from 'lucide-react';

const SavedAddressesPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        label: 'Home',
        fullAddress: '',
        isDefault: false
    });

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const res = await api.get(`/addresses/user/${user.userId}`);
            setAddresses(res.data);
        } catch (error) {
            console.error('Failed to load addresses', error);
            toast.error('Failed to load addresses');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const addressData = { ...formData, userId: user.userId };

            if (editingId) {
                await api.put(`/addresses/${editingId}`, addressData);
                toast.success('Address updated successfully!');
            } else {
                await api.post('/addresses', addressData);
                toast.success('Address added successfully!');
            }

            setShowForm(false);
            setEditingId(null);
            setFormData({ label: 'Home', fullAddress: '', isDefault: false });
            fetchAddresses();
        } catch (error) {
            console.error('Failed to save address', error);
            toast.error('Failed to save address');
        }
    };

    const handleEdit = (address) => {
        setFormData({
            label: address.label,
            fullAddress: address.fullAddress,
            isDefault: address.isDefault
        });
        setEditingId(address.addressId);
        setShowForm(true);
    };

    const handleDelete = async (addressId) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;

        try {
            await api.delete(`/addresses/${addressId}`);
            toast.success('Address deleted successfully!');
            fetchAddresses();
        } catch (error) {
            console.error('Failed to delete address', error);
            toast.error('Failed to delete address');
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({ label: 'Home', fullAddress: '', isDefault: false });
    };

    if (loading) {
        return <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
    }

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Saved Addresses</h1>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Plus size={18} />
                        Add New Address
                    </button>
                )}
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <div className="card" style={{ marginBottom: '2rem', background: '#f8fafc' }}>
                    <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>
                        {editingId ? 'Edit Address' : 'Add New Address'}
                    </h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                                Label
                            </label>
                            <select
                                value={formData.label}
                                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                className="input-field"
                                required
                            >
                                <option value="Home">Home</option>
                                <option value="Office">Office</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                                Full Address
                            </label>
                            <textarea
                                value={formData.fullAddress}
                                onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
                                className="input-field"
                                rows="4"
                                placeholder="Enter complete address with street, city, state, and PIN code"
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.isDefault}
                                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                />
                                <span>Set as default address</span>
                            </label>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button type="submit" className="btn btn-primary">
                                {editingId ? 'Update Address' : 'Save Address'}
                            </button>
                            <button type="button" onClick={handleCancel} className="btn btn-outline">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Address List */}
            {addresses.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <MapPin size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No saved addresses yet</p>
                    <button onClick={() => setShowForm(true)} className="btn btn-primary">
                        Add Your First Address
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {addresses.map((address) => (
                        <div
                            key={address.addressId}
                            className="card"
                            style={{
                                position: 'relative',
                                border: address.isDefault ? '2px solid var(--primary)' : '1px solid var(--border)'
                            }}
                        >
                            {address.isDefault && (
                                <span style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '1rem',
                                    fontSize: '0.75rem',
                                    fontWeight: '600'
                                }}>
                                    Default
                                </span>
                            )}

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    background: '#e0f2fe',
                                    borderRadius: '0.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Home size={24} color="#0284c7" />
                                </div>

                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: 0, marginBottom: '0.5rem' }}>{address.label}</h4>
                                    <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: '1.6' }}>
                                        {address.fullAddress}
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                <button
                                    onClick={() => handleEdit(address)}
                                    className="btn btn-outline"
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
                                >
                                    <Edit2 size={16} />
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(address.addressId)}
                                    className="btn btn-outline"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.5rem 1rem',
                                        color: 'var(--error)',
                                        borderColor: 'var(--error)'
                                    }}
                                >
                                    <Trash2 size={16} />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Back Button */}
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button onClick={() => navigate(-1)} className="btn btn-outline">
                    Go Back
                </button>
            </div>
        </div>
    );
};

export default SavedAddressesPage;
