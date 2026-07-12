import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Destinations from './pages/Destinations';
import AIItinerary from './pages/AIItinerary';
import Gallery from './pages/Gallery';
import Login from './pages/Login';
import Register from './pages/Register';
import Festivals from './pages/Festivals';
import CityDetail from './pages/CityDetail';
import SpotDetail from './pages/SpotDetail';
import Hotels from './pages/Hotels';
import HotelDetail from './pages/HotelDetail';
import AdminDashboard from './pages/AdminDashboard';
import ChatbotWidget from './components/ChatbotWidget';
import CrowdPredictionWidget from './components/CrowdPredictionWidget';
import WeatherPredictionWidget from './components/WeatherPredictionWidget';
import authService from './services/auth.service';

function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);
  return null;
}

// Helper to check if a user is an admin
const isUserAdmin = (user) => {
  if (!user) return false;
  const role = user.role || '';
  const roles = user.roles || [];
  // Robust check for ADMIN in any form (string or array)
  return (
    role === 'ADMIN' || 
    role === 'ROLE_ADMIN' || 
    roles.includes('ADMIN') || 
    roles.includes('ROLE_ADMIN') ||
    (typeof role === 'string' && role.toUpperCase().includes('ADMIN'))
  );
};

// Wrapper for Admin-only routes
const AdminRoute = ({ children }) => {
  const user = authService.getCurrentUser();
  return isUserAdmin(user) ? children : <Navigate to="/login" replace />;
};

// Wrapper for routes that require authentication
const PrivateRoute = ({ children, allowAdmin = false }) => {
  const user = authService.getCurrentUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  // If user is admin, they should go to admin dashboard instead of seeing public features, 
  // unless explicitly allowed
  if (isUserAdmin(user) && !allowAdmin) {
    return <Navigate to="/admin" replace />;
  }
  return children;
};

// Wrapper for public guest-only routes (Login/Register)
const GuestRoute = ({ children }) => {
  const user = authService.getCurrentUser();
  if (user) {
    if (isUserAdmin(user)) return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }
  return children;
};

// Wrapper for common public routes (Home/Destinations) that handles admin redirect
const CommonRoute = ({ children }) => {
  const user = authService.getCurrentUser();
  if (isUserAdmin(user)) {
    return <Navigate to="/admin" replace />;
  }
  return children;
};

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ScrollToTop />
      {!isAdminPage && <Navbar />}
      <main className={`flex-grow ${!isAdminPage ? 'pt-16' : ''}`}>
        <Routes>
          {/* Admin Protected Routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          
          {/* Common Public Routes */}
          <Route path="/" element={<CommonRoute><Home /></CommonRoute>} />
          <Route path="/destinations" element={<CommonRoute><Destinations /></CommonRoute>} />

          {/* User Protected Features */}
          <Route path="/city/:id" element={<PrivateRoute><CityDetail /></PrivateRoute>} />
          <Route path="/spot/:id" element={<PrivateRoute><SpotDetail /></PrivateRoute>} />
          <Route path="/ai-itinerary" element={<PrivateRoute allowAdmin={true}><AIItinerary /></PrivateRoute>} />
          <Route path="/festivals" element={<PrivateRoute><Festivals /></PrivateRoute>} />
          <Route path="/hotels" element={<CommonRoute><Hotels /></CommonRoute>} />
          <Route path="/hotel/:id" element={<CommonRoute><HotelDetail /></CommonRoute>} />
          <Route path="/gallery" element={<PrivateRoute><Gallery /></PrivateRoute>} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
          
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isAdminPage && (
  <>
    <CrowdPredictionWidget />
    <WeatherPredictionWidget />
    <ChatbotWidget />
  </>
)}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
