import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../api';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cartCount, setCartCount] = useState(0);

    const fetchCartCount = async () => {
        if (!user || user.role !== 'CUSTOMER') {
            setCartCount(0);
            return;
        }
        try {
            const res = await api.get(`/cart?userId=${user.userId}`);
            // Check if response has items array
            if (res.data && res.data.items) {
                const count = res.data.items.reduce((sum, item) => sum + item.quantity, 0);
                setCartCount(count);
            } else if (Array.isArray(res.data)) {
                // Fallback if API returns array directly
                const count = res.data.reduce((sum, item) => sum + item.quantity, 0);
                setCartCount(count);
            } else {
                setCartCount(0);
            }
        } catch (error) {
            console.error('Failed to fetch cart count:', error);
            setCartCount(0);
        }
    };

    useEffect(() => {
        fetchCartCount();
    }, [user]);

    const refreshCart = () => {
        fetchCartCount();
    };

    const addToCart = async (productId, quantity = 1) => {
        if (!user || user.role !== 'CUSTOMER') {
            throw new Error('Only customers can add items to cart');
        }
        try {
            await api.post(`/cart/add?userId=${user.userId}`, {
                productId,
                quantity
            });
            // Refresh cart count after adding
            await fetchCartCount();
        } catch (error) {
            console.error('Failed to add to cart:', error);
            throw error;
        }
    };

    return (
        <CartContext.Provider value={{ cartCount, refreshCart, addToCart }}>
            {children}
        </CartContext.Provider>
    );
};
