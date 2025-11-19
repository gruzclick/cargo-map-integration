
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import RoutesPage from "./pages/Routes";
import Admin from "./pages/Admin";
import AdminAds from "./pages/AdminAds";
import AdminUsers from "./pages/AdminUsers";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminNotifications from "./pages/AdminNotifications";
import AdminContent from "./pages/AdminContent";
import AdminTransport from "./pages/AdminTransport";
import AdminSettings from "./pages/AdminSettings";
import AdminSupport from "./pages/AdminSupport";
import AdminMarketing from "./pages/AdminMarketing";

import AdminSecurity from "./pages/AdminSecurity";
import AdminLegalDocs from "./pages/AdminLegalDocs";
import AdPreviewPage from "./pages/AdPreviewPage";
import QRPage from "./pages/QRPage";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import TermsUpdateDialog from "./components/TermsUpdateDialog";
import './i18n/config';
import { secureLocalStorage } from './utils/security';
import { useServiceWorker } from './hooks/useServiceWorker';

const queryClient = new QueryClient();

const App = () => {
  const [textSize, setTextSize] = useState<'small' | 'medium' | 'large' | 'xlarge'>('medium');
  const [showTermsUpdate, setShowTermsUpdate] = useState(false);
  useServiceWorker();

useEffect(() => {
    const savedSize = localStorage.getItem('textSize') as 'small' | 'medium' | 'large' | 'xlarge' | null;
    if (savedSize) {
      setTextSize(savedSize);
    }

    const handleTextSizeChange = (e: CustomEvent<'small' | 'medium' | 'large' | 'xlarge'>) => {
      setTextSize(e.detail);
      localStorage.setItem('textSize', e.detail);
    };

    window.addEventListener('textSizeChange' as any, handleTextSizeChange as EventListener);
    return () => window.removeEventListener('textSizeChange' as any, handleTextSizeChange as EventListener);
  }, []);

  useEffect(() => {
    const needsUpdate = secureLocalStorage.getItem('needs_terms_update');
    if (needsUpdate === 'true') {
      setShowTermsUpdate(true);
    }
  }, []);

  const handleTermsAccept = async () => {
    const pendingAuth = secureLocalStorage.getItem('pending_auth');
    if (pendingAuth) {
      const { token, user } = JSON.parse(pendingAuth);
      secureLocalStorage.set('auth_token', token);
      secureLocalStorage.set('user_data', JSON.stringify(user));
      secureLocalStorage.removeItem('pending_auth');
      secureLocalStorage.removeItem('needs_terms_update');
      setShowTermsUpdate(false);
      window.location.href = '/';
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className={`text-size-${textSize}`}>
          <Toaster />
          <Sonner />
          <TermsUpdateDialog open={showTermsUpdate} onAccept={handleTermsAccept} />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/routes" element={<RoutesPage />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/ads" element={<AdminAds />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/notifications" element={<AdminNotifications />} />
              <Route path="/admin/content" element={<AdminContent />} />
              <Route path="/admin/transport" element={<AdminTransport />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/support" element={<AdminSupport />} />
              <Route path="/admin/marketing" element={<AdminMarketing />} />
              <Route path="/admin/security" element={<AdminSecurity />} />
              <Route path="/admin/legal-docs" element={<AdminLegalDocs />} />

              <Route path="/ad-preview" element={<AdPreviewPage />} />
              <Route path="/qr" element={<QRPage />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;