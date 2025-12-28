import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const StoreSetup = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Check if we are editing (passed via router state)
    const existingStore = location.state?.store;

    const [formData, setFormData] = useState({
        storeName: '',
        storeAddress: '',
        contactNumber: '',
        latitude: 0.0,
        longitude: 0.0
    });
    const [logoFile, setLogoFile] = useState(null);

    useEffect(() => {
        if (existingStore) {
            setFormData({
                storeName: existingStore.storeName || '',
                storeAddress: existingStore.storeAddress || '',
                contactNumber: existingStore.contactNumber || '',
                latitude: existingStore.latitude || 0.0,
                longitude: existingStore.longitude || 0.0
            });
        }
    }, [existingStore]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setLogoFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('storeName', formData.storeName);
        data.append('storeAddress', formData.storeAddress);
        data.append('contactNumber', formData.contactNumber);
        data.append('latitude', formData.latitude);
        data.append('longitude', formData.longitude);
        if (logoFile) {
            data.append('logo', logoFile);
        }

        try {
            if (existingStore) {
                // Update Mode
                await api.put(`/store/update?ownerId=${user.userId}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Store Updated Successfully!');
            } else {
                // Create Mode
                await api.post(`/store/register?ownerId=${user.userId}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Store Created Successfully!');
            }
            navigate('/dashboard');
        } catch (error) {
            toast.error(existingStore ? 'Failed to update store.' : 'Failed to create store.');
            console.error(error);
        }
    };

    return (
        <div className="container" style={{ padding: '2rem' }}>
            <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0 }}>{existingStore ? 'Edit Store Details' : 'Setup Your Store'}</h2>
                    <button
                        onClick={() => navigate(-1)}
                        className="btn btn-outline"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                    >
                        ⬅ Back
                    </button>
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    <label>Store Name</label>
                    <input name="storeName" value={formData.storeName} className="input-field" onChange={handleChange} required />

                    <label>Store Address</label>
                    <textarea name="storeAddress" value={formData.storeAddress} className="input-field" onChange={handleChange} required />

                    <label>Contact Number</label>
                    <input name="contactNumber" value={formData.contactNumber} className="input-field" onChange={handleChange} required />

                    <label>Store Logo (Image)</label>
                    {existingStore && existingStore.storeLogoUrl && (
                        <div style={{ marginBottom: '0.5rem' }}>
                            <img src={`http://localhost:8080${existingStore.storeLogoUrl}`} alt="Current" height="50" />
                            <small style={{ display: 'block', color: '#666' }}>Current Logo</small>
                        </div>
                    )}
                    <input type="file" accept="image/*" className="input-field" onChange={handleFileChange} />

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                        {existingStore ? 'Update Store' : 'Create Store'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default StoreSetup;
