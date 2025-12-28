import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Register = () => {
    const navigate = useNavigate();
    const { sendOtp, register } = useAuth();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        mobileNumber: '',
        password: '',
        confirmPassword: '',
        role: 'CUSTOMER',
        otp: ''
    });

    const [otpSent, setOtpSent] = useState(false);
    const [timer, setTimer] = useState(0);

    // Timer logic
    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSendOtp = async () => {
        if (!formData.email) return alert('Please enter Email');
        // Send OTP to Email
        const success = await sendOtp(formData.email);
        if (success) {
            setOtpSent(true);
            setTimer(60); // Start 60s countdown
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return toast.error("Passwords don't match");
        }
        const success = await register(formData);
        if (success) navigate('/login');
    };

    return (
        <div className="container" style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px' }}>
                {/* DUKANAM Logo */}
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <img
                        src="/dukanam-logo.png"
                        alt="DUKANAM"
                        style={{ width: '180px', height: 'auto', marginBottom: '0.5rem' }}
                    />
                </div>

                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Create Account</h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <input name="firstName" placeholder="First Name" className="input-field" onChange={handleChange} required />
                        <input name="lastName" placeholder="Last Name" className="input-field" onChange={handleChange} required />
                    </div>

                    <select name="role" className="input-field" onChange={handleChange} value={formData.role}>
                        <option value="CUSTOMER">I am a Customer</option>
                        <option value="STORE_OWNER">I am a Store Owner</option>
                    </select>

                    {/* Mobile Number Field */}
                    <input name="mobileNumber" placeholder="Mobile Number" className="input-field" onChange={handleChange} required />

                    {/* Email Field with OTP Button */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input name="email" type="email" placeholder="Email Address" className="input-field" onChange={handleChange} required />
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={handleSendOtp}
                            disabled={timer > 0}
                            style={{ minWidth: '140px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                        >
                            {timer > 0 ? `Resend in ${timer}s` : (otpSent ? 'Resend OTP' : 'Get OTP')}
                        </button>
                    </div>

                    {otpSent && (
                        <input name="otp" placeholder="Enter Email OTP" className="input-field" onChange={handleChange} required />
                    )}

                    <input type="password" name="password" placeholder="Password" className="input-field" onChange={handleChange} required />
                    <input type="password" name="confirmPassword" placeholder="Confirm Password" className="input-field" onChange={handleChange} required />

                    <button type="submit" className="btn btn-primary">Register</button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)' }}>Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
