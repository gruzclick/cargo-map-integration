
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import RoutesPage from "./pages/Routes";
import AdminAds from "./pages/AdminAds";
import AdPreviewPage from "./pages/AdPreviewPage";
import NotFound from "./pages/NotFound";
import './i18n/config';

const queryClient = new QueryClient();

const App = () => {
  const [textSize, setTextSize] = useState<'small' | 'medium' | 'large' | 'xlarge'>('medium');

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

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className={`text-size-${textSize}`}>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/routes" element={<RoutesPage />} />
              <Route path="/admin/ads" element={<AdminAds />} />
              <Route path="/ad-preview" element={<AdPreviewPage />} />
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