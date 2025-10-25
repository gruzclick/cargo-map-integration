import { useState, useEffect } from 'react';
import { secureLocalStorage } from '@/utils/security';
import { AdminLoginForm } from '@/components/admin/AdminLoginForm';
import { AdminForgotPassword } from '@/components/admin/AdminForgotPassword';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  useEffect(() => {
    const adminToken = secureLocalStorage.get('admin_token');
    const tokenExpiry = secureLocalStorage.get('admin_token_expiry');
    
    if (adminToken && tokenExpiry) {
      const expiryTime = parseInt(tokenExpiry);
      if (Date.now() < expiryTime) {
        setIsAuthenticated(true);
      } else {
        secureLocalStorage.remove('admin_token');
        secureLocalStorage.remove('admin_token_expiry');
      }
    }
  }, []);

  const handleLoginSuccess = (token: string, admin: any) => {
    const expiry = Date.now() + (2 * 60 * 60 * 1000);
    secureLocalStorage.set('admin_token', token);
    secureLocalStorage.set('admin_token_expiry', expiry.toString());
    secureLocalStorage.set('admin_profile', JSON.stringify(admin));
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    secureLocalStorage.remove('admin_token');
    secureLocalStorage.remove('admin_token_expiry');
    secureLocalStorage.remove('admin_profile');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    if (showForgotPassword) {
      return <AdminForgotPassword onBack={() => setShowForgotPassword(false)} />;
    }
    return (
      <AdminLoginForm 
        onSuccess={handleLoginSuccess}
        onShowForgotPassword={() => setShowForgotPassword(true)}
      />
    );
  }

  return <AdminDashboard onLogout={handleLogout} />;
};

export default Admin;
