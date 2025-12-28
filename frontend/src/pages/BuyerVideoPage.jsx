import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { Upload, ArrowLeft, Check } from 'lucide-react';

const BuyerVideoPage = () => {
    const navigate = useNavigate();
    const [videos, setVideos] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            const res = await api.get('/content?type=BUYER_VIDEO');
            setVideos(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load videos");
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.includes('video/mp4')) {
            toast.error("Only MP4 videos are allowed");
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'BUYER_VIDEO');

        setUploading(true);
        try {
            await api.post('/content/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Video uploaded successfully");
            fetchVideos();
        } catch (error) {
            console.error(error);
            toast.error("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleSetActive = async (id) => {
        try {
            await api.put(`/content/${id}/active`);
            toast.success("Active video updated");
            fetchVideos();
        } catch (error) {
            toast.error("Failed to update active video");
        }
    };

    const handleUpdateSettings = async (id, loop, mute) => {
        try {
            await api.put(`/content/${id}/settings?loop=${loop}&mute=${mute}`);
            toast.success("Settings updated");
            fetchVideos();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update settings");
        }
    };

    // Helper to get full URL, checking if it starts with http
    const getVideoUrl = (url) => {
        if (url.startsWith('http')) return url;
        // Assuming backend runs on 8080 and we are proxying, OR using direct backend URL
        // If api.defaults.baseURL is set, use it.
        const baseURL = api.defaults.baseURL || 'http://localhost:8080';
        return `${baseURL}${url}`;
    };

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem' }}>
            <button
                onClick={() => navigate('/admin/manage-buyer')}
                className="btn btn-outline"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}
            >
                <ArrowLeft size={16} /> Back to Menu
            </button>

            <h1 style={{ marginBottom: '2rem' }}>Buyer Dashboard Video</h1>

            {/* Upload Section */}
            <div className="card" style={{ padding: '2rem', marginBottom: '2rem', textAlign: 'center', border: '2px dashed #ddd' }}>
                <input
                    type="file"
                    id="video-upload"
                    accept="video/mp4"
                    style={{ display: 'none' }}
                    onChange={handleUpload}
                    disabled={uploading}
                />
                <label htmlFor="video-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: '#f3f4f6', padding: '1.5rem', borderRadius: '50%' }}>
                        <Upload size={32} color="#666" />
                    </div>
                    <div>
                        <h3 style={{ margin: '0 0 0.5rem' }}>{uploading ? 'Uploading...' : 'Upload New Video'}</h3>
                        <p style={{ margin: 0, color: '#888' }}>Select an MP4 file to upload</p>
                    </div>
                </label>
            </div>

            {/* Video List */}
            <h2 style={{ marginBottom: '1rem' }}>Video History</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
                {loading ? (
                    <div>Loading...</div>
                ) : videos.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>No videos uploaded yet</div>
                ) : (
                    videos.map(video => (
                        <div key={video.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1rem' }}>
                            <div style={{ width: '120px', height: '68px', background: '#000', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                                <video src={getVideoUrl(video.url)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{video.filename}</div>
                                <div style={{ fontSize: '0.85rem', color: '#666' }}>Uploaded: {new Date(video.createdAt).toLocaleDateString()}</div>
                            </div>
                            <div>
                                {video.active ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                                        <span style={{
                                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                                            background: '#d1fae5', color: '#065f46', padding: '0.25rem 0.75rem', borderRadius: '999px',
                                            fontSize: '0.8rem', fontWeight: 'bold'
                                        }}>
                                            <Check size={14} /> Active
                                        </span>

                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: '#f8f9fa', padding: '0.5rem', borderRadius: '8px', border: '1px solid #eee' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={video.loopVideo !== false} // Default true if undefined
                                                    onChange={(e) => handleUpdateSettings(video.id, e.target.checked, video.muteDefault !== false)}
                                                />
                                                Loop
                                            </label>

                                            <div style={{ height: '20px', width: '1px', background: '#ddd' }}></div>

                                            <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem' }}>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                                                    <input
                                                        type="radio"
                                                        name={`sound-${video.id}`}
                                                        checked={video.muteDefault === true} // Default true
                                                        onChange={() => handleUpdateSettings(video.id, video.loopVideo !== false, true)}
                                                    />
                                                    Mute
                                                </label>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                                                    <input
                                                        type="radio"
                                                        name={`sound-${video.id}`}
                                                        checked={video.muteDefault === false}
                                                        onChange={() => handleUpdateSettings(video.id, video.loopVideo !== false, false)}
                                                    />
                                                    Sound
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        className="btn btn-outline"
                                        onClick={() => handleSetActive(video.id)}
                                    >
                                        Set Active
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default BuyerVideoPage;
