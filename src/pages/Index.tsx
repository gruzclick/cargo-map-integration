import { useState, useEffect } from 'react';
import Auth from '@/components/Auth';
import PublicMap from '@/components/PublicMap';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import CookieBanner from '@/components/CookieBanner';
import UserStats from '@/components/UserStats';
import { UserProfile } from '@/components/UserProfile';
import { RoleSelectionModal } from '@/components/RoleSelectionModal';
import TelegramPromptModal from '@/components/TelegramPromptModal';
import IndexHeader from '@/components/IndexHeader';
import IndexDesktopNavigation from '@/components/IndexDesktopNavigation';
import IndexMobileNavigation from '@/components/IndexMobileNavigation';
import IndexTabsContent from '@/components/IndexTabsContent';
import { Tabs } from '@/components/ui/tabs';
import { useTranslation } from 'react-i18next';
import { detectUserCountry, getCurrencyByCountry, getLanguageByCountry } from '@/utils/geoip';
import { secureLocalStorage } from '@/utils/security';

const Index = () => {
  const { i18n } = useTranslation();
  const [user, setUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [driverRoute, setDriverRoute] = useState<Array<{ warehouse: string; time: string }>>([]);
  const [trackingDeliveryId, setTrackingDeliveryId] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showStatusSelector, setShowStatusSelector] = useState(false);
  const [showTelegramPrompt, setShowTelegramPrompt] = useState(false);
  const [userStatus, setUserStatus] = useState<'cargo' | 'vehicle' | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = secureLocalStorage.get('auth_token');
      const userData = secureLocalStorage.get('user_data');
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          
          const userId = parsedUser.user_id || parsedUser.id;
          if (userId) {
            try {
              const response = await fetch('https://functions.poehali.dev/1ff38065-516a-4892-8531-03c46020b273', {
                method: 'GET',
                headers: {
                  'X-User-Id': userId
                }
              });
              
              if (response.ok) {
                const data = await response.json();
                if (data.success && data.user) {
                  console.log('Loaded fresh user data from server');
                  secureLocalStorage.set('user_data', JSON.stringify(data.user));
                  setUser(data.user);
                  setShowAuth(false);
                  return;
                }
              }
            } catch (serverError) {
              console.log('Server unavailable, using cached data');
            }
          }
          
          setUser(parsedUser);
          setShowAuth(false);
        } catch (error) {
          console.error('Failed to parse user data:', error);
          secureLocalStorage.remove('auth_token');
          secureLocalStorage.remove('user_data');
          setShowAuth(true);
        }
      } else {
        setShowAuth(true);
      }
    };

    checkAuth();

    const handleUserDataUpdate = (event: CustomEvent) => {
      console.log('User data updated:', event.detail);
      setUser(event.detail);
    };

    window.addEventListener('userDataUpdated', handleUserDataUpdate as EventListener);
    return () => window.removeEventListener('userDataUpdated', handleUserDataUpdate as EventListener);

    const initializeGeoSettings = async () => {
      const savedCurrency = localStorage.getItem('user_currency');
      const savedLanguage = localStorage.getItem('user_language');

      if (!savedCurrency || !savedLanguage) {
        const geoData = await detectUserCountry();
        if (geoData) {
          const currency = getCurrencyByCountry(geoData.country);
          const language = getLanguageByCountry(geoData.country);

          if (!savedCurrency) {
            localStorage.setItem('user_currency', currency);
          }
          if (!savedLanguage) {
            localStorage.setItem('user_language', language);
            i18n.changeLanguage(language);
          }
        }
      }
    };

    initializeGeoSettings();
  }, [i18n]);

  const handleLogout = () => {
    secureLocalStorage.remove('auth_token');
    secureLocalStorage.remove('user_data');
    setUser(null);
    setShowAuth(false);
  };

  const handleAuthSuccess = (userData: any) => {
    console.log('Auth success, saving user data:', userData);
    setUser(userData);
    secureLocalStorage.set('auth_token', userData.session_token || 'authenticated');
    secureLocalStorage.set('user_data', JSON.stringify(userData));
    setShowAuth(false);
    
    if (!userData.role_status_set) {
      setShowStatusSelector(true);
    } else {
      const telegramVerified = localStorage.getItem('telegram_verified');
      const telegramSkipped = localStorage.getItem('telegram_prompt_skipped');
      
      if (!telegramVerified && !telegramSkipped && !userData.telegram_verified) {
        setTimeout(() => {
          setShowTelegramPrompt(true);
        }, 2000);
      }
    }
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Ошибка получения геолокации:', error);
        }
      );
    }
  };
  
  const handleStatusSelect = (status: 'cargo' | 'vehicle') => {
    setUserStatus(status);
    localStorage.setItem('user_status', status);
    setShowStatusSelector(false);
  };

  const handleRoleStatusComplete = async () => {
    setShowStatusSelector(false);
    
    const userData = secureLocalStorage.get('user_data');
    if (userData) {
      try {
        const updatedUser = JSON.parse(userData);
        updatedUser.role_status_set = true;
        secureLocalStorage.set('user_data', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        const telegramVerified = localStorage.getItem('telegram_verified');
        const telegramSkipped = localStorage.getItem('telegram_prompt_skipped');
        
        if (!telegramVerified && !telegramSkipped && !updatedUser.telegram_verified) {
          setTimeout(() => {
            setShowTelegramPrompt(true);
          }, 1000);
        }
      } catch (error) {
        console.error('Failed to update user data:', error);
      }
    }
  };

  if (!user && !showAuth) {
    return (
      <>
        <PublicMap onRegister={() => setShowAuth(true)} />
        <UserStats />
        <CookieBanner />
      </>
    );
  }

  if (!user && showAuth) {
    return (
      <>
        <Auth onSuccess={handleAuthSuccess} />
        <CookieBanner />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {showStatusSelector && user && (
        <RoleSelectionModal user={user} onComplete={handleRoleStatusComplete} />
      )}
      
      {showTelegramPrompt && user && (
        <TelegramPromptModal user={user} onComplete={() => setShowTelegramPrompt(false)} />
      )}
      
      <PWAInstallPrompt />
      <CookieBanner />
      
      <IndexHeader 
        user={user}
        userStatus={userStatus}
        onProfileClick={() => setShowProfile(true)}
        onLogout={handleLogout}
      />

      <div className="container mx-auto px-0 pb-20 md:pb-2">
        <Tabs defaultValue="map" className="w-full">
          <IndexDesktopNavigation userType={user.user_type} />
          <IndexMobileNavigation userType={user.user_type} />
          <IndexTabsContent user={user} driverRoute={driverRoute} />
        </Tabs>
      </div>
      
      {showProfile && (
        <UserProfile user={user} onClose={() => setShowProfile(false)} />
      )}
    </div>
  );
};

export default Index;
