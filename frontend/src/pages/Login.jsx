import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        contactInfo: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(formData);
        if (success) navigate('/dashboard');
    };

    return (
        <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
                {/* DUKANAM Logo */}
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <img
                        src="/dukanam-logo.png"
                        alt="DUKANAM"
                        style={{ width: '200px', height: 'auto', marginBottom: '1rem' }}
                    />
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input name="contactInfo" placeholder="Email or Mobile" className="input-field" onChange={handleChange} required />
                    <input type="password" name="password" placeholder="Password" className="input-field" onChange={handleChange} required />
                    <button type="submit" className="btn btn-primary">Login</button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--primary)' }}>Register</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
