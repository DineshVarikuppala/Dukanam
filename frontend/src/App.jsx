import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import StoreSetup from './pages/StoreSetup';
import Inventory from './pages/Inventory';
import Dashboard from './pages/Dashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import StorePage from './pages/StorePage'; // Restored import
import CartPage from './pages/CartPage'; // Restored import
import CheckoutPage from './pages/CheckoutPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import ProfilePage from './pages/ProfilePage';
import SavedAddressesPage from './pages/SavedAddressesPage';
import SettingsPage from './pages/SettingsPage';
import AboutPage from './pages/AboutPage';
import StoreOrdersPage from './pages/StoreOrdersPage';
import ProductDetailPage from './pages/ProductDetailPage';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import AdminUserDetailsPage from './pages/AdminUserDetailsPage';
import ManageBuyerPage from './pages/ManageBuyerPage';
import BuyerVideoPage from './pages/BuyerVideoPage';
import AllProductsPage from './pages/AllProductsPage';
import BestsellersPage from './pages/BestsellersPage';
import SectionProductsPage from './pages/SectionProductsPage';
import HelpPage from './pages/HelpPage';
import UserOrdersPage from './pages/UserOrdersPage';
import UserRequestsPage from './pages/UserRequestsPage';
import UserLoginStatsPage from './pages/UserLoginStatsPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/all-products" element={<ProtectedRoute><AllProductsPage /></ProtectedRoute>} />
            <Route path="/bestsellers" element={<ProtectedRoute><BestsellersPage /></ProtectedRoute>} />
            <Route path="/section/:sectionName" element={<ProtectedRoute><SectionProductsPage /></ProtectedRoute>} />
            <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users/:userId" element={<ProtectedRoute><AdminUserDetailsPage /></ProtectedRoute>} />
            <Route path="/admin/users/:userId/orders" element={<ProtectedRoute><UserOrdersPage /></ProtectedRoute>} />
            <Route path="/admin/users/:userId/requests" element={<ProtectedRoute><UserRequestsPage /></ProtectedRoute>} />
            <Route path="/admin/users/:userId/login-stats" element={<ProtectedRoute><UserLoginStatsPage /></ProtectedRoute>} />
            <Route path="/admin/manage-buyer" element={<ProtectedRoute><ManageBuyerPage /></ProtectedRoute>} />
            <Route path="/admin/manage-buyer/video" element={<ProtectedRoute><BuyerVideoPage /></ProtectedRoute>} />
            <Route path="/store-setup" element={<ProtectedRoute><StoreSetup /></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
            <Route path="/customer-dashboard" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
            <Route path="/store/:storeId" element={<ProtectedRoute><StorePage /></ProtectedRoute>} />
            <Route path="/product/:productId" element={<ProtectedRoute><ProductDetailPage /></ProtectedRoute>} />
            <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/addresses" element={<ProtectedRoute><SavedAddressesPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/store-orders" element={<ProtectedRoute><StoreOrdersPage /></ProtectedRoute>} />
            <Route path="/help" element={<ProtectedRoute><HelpPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
          <Toaster position="top-center" />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
