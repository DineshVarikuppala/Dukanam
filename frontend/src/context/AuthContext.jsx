import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const sendOtp = async (contactInfo) => {
        try {
            await api.post('/auth/send-otp', { contactInfo });
            toast.success('OTP sent successfully!');
            return true;
        } catch (error) {
            toast.error('Failed to send OTP. Try again.');
            return false;
        }
    };

    const register = async (registerData) => {
        try {
            const response = await api.post('/auth/register', registerData);
            const userData = response.data;
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            toast.success(`Registration Successful! Welcome ${userData.userName}`);
            return true;
        } catch (error) {
            toast.error(error.response?.data || 'Registration Failed');
            return false;
        }
    };

    const login = async (loginData) => {
        try {
            const response = await api.post('/auth/login', loginData);
            const userData = response.data;
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            toast.success(`Welcome back, ${userData.userName}!`);
            return true;
        } catch (error) {
            toast.error(error.response?.data || 'Invalid Credentials');
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        toast.success('Logged out successfully.');
    };

    return (
        <AuthContext.Provider value={{ user, loading, sendOtp, register, login, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
