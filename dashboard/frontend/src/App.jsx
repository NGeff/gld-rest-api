import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ApiKeys from './pages/ApiKeys';
import Documentation from './pages/Documentation';
import Billing from './pages/Billing';
import Settings from './pages/Settings';
import Support from './pages/Support';
import Admin from './pages/Admin';
import AdminTicketView from './pages/AdminTicketView';
import NotFound from './pages/NotFound';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PrivateRoute from './components/PrivateRoute';
import './styles/global.css';

const LandingRedirect = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && isAuthenticated && location.pathname === '/') {
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, location, navigate]);

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Carregando...</div>;
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />;
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/dashboard/api-keys" element={<PrivateRoute><ApiKeys /></PrivateRoute>} />
            <Route path="/dashboard/docs" element={<PrivateRoute><Documentation /></PrivateRoute>} />
            <Route path="/dashboard/billing" element={<PrivateRoute><Billing /></PrivateRoute>} />
            <Route path="/dashboard/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
            <Route path="/dashboard/support" element={<PrivateRoute><Support /></PrivateRoute>} />
            <Route path="/dashboard/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
            <Route path="/dashboard/admin/ticket/:id" element={<PrivateRoute><AdminTicketView /></PrivateRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
