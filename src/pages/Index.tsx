import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import LiveMap from '@/components/LiveMap';
import Auth from '@/components/Auth';
import PublicMap from '@/components/PublicMap';
import LanguageSelector from '@/components/LanguageSelector';
import ThemeToggle from '@/components/ThemeToggle';
import OnboardingTour from '@/components/OnboardingTour';
import AIAssistant from '@/components/AIAssistant';
import PriceCalculator from '@/components/PriceCalculator';
import ChatNotifications from '@/components/ChatNotifications';
import CookieBanner from '@/components/CookieBanner';
import UserStats from '@/components/UserStats';
import { useTranslation } from 'react-i18next';
import DeliveryForm from '@/components/DeliveryForm';
import DeliveryFormMultiStep from '@/components/DeliveryFormMultiStep';
import CarrierStatus from '@/components/CarrierStatus';
import NearbyDriverNotification from '@/components/NearbyDriverNotification';
import DeliveryHistory from '@/components/DeliveryHistory';
import RouteManager from '@/components/RouteManager';
import VehicleManager from '@/components/VehicleManager';
import FleetManager from '@/components/FleetManager';
import DocumentGenerator from '@/components/DocumentGenerator';
import ClientNotifications from '@/components/ClientNotifications';
import DeliveryTracking from '@/components/DeliveryTracking';
import RestStatusManager from '@/components/RestStatusManager';
import RouteOptimizer from '@/components/RouteOptimizer';
import DeliveryPhotoUpload from '@/components/DeliveryPhotoUpload';
import RatingSystem from '@/components/RatingSystem';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import RotatingAdBanner from '@/components/RotatingAdBanner';
import AppDownload from '@/components/AppDownload';
import { UserProfile } from '@/components/UserProfile';
import { UserStatusSelector } from '@/components/UserStatusSelector';
import { RoleSelectionModal } from '@/components/RoleSelectionModal';
import TelegramPromptModal from '@/components/TelegramPromptModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { detectUserCountry, getCurrencyByCountry, getLanguageByCountry } from '@/utils/geoip';
import { secureLocalStorage } from '@/utils/security';

const Index = () => {
  const { t, i18n } = useTranslation();
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
          
          // Пытаемся загрузить актуальные данные с сервера
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
          
          // Fallback: используем данные из localStorage
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
      <header className="border-b border-gray-200/20 dark:border-gray-700/30 sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl z-50 shadow-sm animate-slide-in-down">
        <div className="container mx-auto px-2 md:px-3 py-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 bg-gray-900 dark:bg-gray-100 rounded-xl flex items-center justify-center">
              <Icon name="Truck" size={18} className="text-white dark:text-gray-900" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-gray-900 dark:text-gray-100 hidden md:inline">ГрузКлик</span>
              {userStatus && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  userStatus === 'cargo' 
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                    : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                }`}>
                  <Icon 
                    name={userStatus === 'cargo' ? 'Package' : 'Car'} 
                    size={12} 
                  />
                  <span className="hidden sm:inline">
                    {userStatus === 'cargo' ? 'Груз' : 'Авто'}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1 max-w-md hidden md:block">
            <RotatingAdBanner />
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                const url = window.location.origin;
                const shareText = `🚛 Присоединяйся к грузовой бирже!\n\n✅ Находи грузы и водителей рядом с тобой\n✅ Отслеживай доставки в реальном времени\n✅ Безопасные сделки с рейтингом\n\nОткрой прямо сейчас: ${url}`;
                
                if (navigator.share) {
                  navigator.share({
                    title: '🚛 Груз Клик',
                    text: shareText,
                    url: url
                  }).catch(() => {
                    navigator.clipboard.writeText(url);
                    alert('✅ Ссылка скопирована! Отправьте её своим клиентам и партнёрам');
                  });
                } else {
                  navigator.clipboard.writeText(url);
                  alert('✅ Ссылка скопирована в буфер обмена!\n\nОтправьте её в WhatsApp, Telegram или Email своим клиентам');
                }
              }}
              className="h-9 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Icon name="Share2" size={14} className="mr-1.5" />
              <span className="text-xs hidden md:inline">Поделиться</span>
            </Button>

            <div className="h-9 flex items-center">
              <ChatNotifications currentUserId={user.user_id || user.phone} />
            </div>
            <div className="h-9 flex items-center">
              <ThemeToggle />
            </div>
            
            {user.email === 'bgs1990st@mail.ru' && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => window.open('/admin', '_blank')} 
                className="h-9 rounded-lg text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/20"
              >
                <Icon name="Shield" size={14} className="mr-1.5" />
                <span className="text-xs hidden md:inline">Админ</span>
              </Button>
            )}

            <Button variant="ghost" size="sm" onClick={() => setShowProfile(true)} className="h-9 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
              <Icon name="User" size={14} className="mr-1.5" />
              <span className="text-xs hidden md:inline">Профиль</span>
            </Button>

            <Button variant="ghost" size="sm" onClick={handleLogout} className="h-9 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
              <Icon name="LogOut" size={14} className="mr-1.5" />
              <span className="text-xs hidden md:inline">Выйти</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-0 pb-20 md:pb-2">
        <Tabs defaultValue="map" className="w-full">
          <TabsList className="hidden md:grid w-full max-w-4xl mx-auto grid-cols-3 md:grid-cols-5 mb-2 bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl border border-gray-200/20 dark:border-gray-700/30 p-1.5 rounded-2xl shadow-lg">
            <TabsTrigger value="map" className="rounded-xl data-[state=active]:bg-white/80 dark:data-[state=active]:bg-gray-800/80 data-[state=active]:backdrop-blur-xl data-[state=active]:shadow-md text-xs md:text-sm">
              <Icon name="Map" size={16} className="mr-2" />
              Карта
            </TabsTrigger>
            {user.user_type === 'client' && (
              <>
                <TabsTrigger value="delivery" className="rounded-xl data-[state=active]:bg-white/80 dark:data-[state=active]:bg-gray-800/80 data-[state=active]:backdrop-blur-xl data-[state=active]:shadow-md text-xs md:text-sm">
                  <Icon name="Plus" size={16} className="mr-2" />
                  Поставка
                </TabsTrigger>
                <TabsTrigger value="documents" className="rounded-xl data-[state=active]:bg-white/80 dark:data-[state=active]:bg-gray-800/80 data-[state=active]:backdrop-blur-xl data-[state=active]:shadow-md text-xs md:text-sm">
                  <Icon name="FileText" size={16} className="mr-2" />
                  Документы
                </TabsTrigger>
              </>
            )}
            {user.user_type === 'carrier' && (
              <>
                <TabsTrigger value="orders" className="rounded-xl data-[state=active]:bg-white/80 dark:data-[state=active]:bg-gray-800/80 data-[state=active]:backdrop-blur-xl data-[state=active]:shadow-md text-xs md:text-sm">
                  <Icon name="List" size={16} className="mr-2" />
                  Заказы
                </TabsTrigger>
                <TabsTrigger value="vehicles" className="rounded-xl data-[state=active]:bg-white/80 dark:data-[state=active]:bg-gray-800/80 data-[state=active]:backdrop-blur-xl data-[state=active]:shadow-md text-xs md:text-sm">
                  <Icon name="Truck" size={16} className="mr-2" />
                  Автопарк
                </TabsTrigger>
              </>
            )}
            <TabsTrigger value="history" className="rounded-xl data-[state=active]:bg-white/80 dark:data-[state=active]:bg-gray-800/80 data-[state=active]:backdrop-blur-xl data-[state=active]:shadow-md text-xs md:text-sm">
              <Icon name="History" size={16} className="mr-2" />
              История
            </TabsTrigger>
            <TabsTrigger value="more" className="rounded-xl data-[state=active]:bg-white/80 dark:data-[state=active]:bg-gray-800/80 data-[state=active]:backdrop-blur-xl data-[state=active]:shadow-md text-xs md:text-sm">
              <Icon name="MoreHorizontal" size={16} className="mr-2" />
              Ещё
            </TabsTrigger>
          </TabsList>

          <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
            <TabsList className="grid w-full grid-cols-4 h-16 bg-transparent p-0">
              <TabsTrigger value="map" className="flex-col gap-1 rounded-none data-[state=active]:bg-transparent data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=inactive]:text-gray-500">
                <Icon name="Map" size={20} />
                <span className="text-[10px]">Карта</span>
              </TabsTrigger>
              {user.user_type === 'client' && (
                <TabsTrigger value="delivery" className="flex-col gap-1 rounded-none data-[state=active]:bg-transparent data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=inactive]:text-gray-500">
                  <Icon name="Plus" size={20} />
                  <span className="text-[10px]">Создать</span>
                </TabsTrigger>
              )}
              {user.user_type === 'carrier' && (
                <TabsTrigger value="orders" className="flex-col gap-1 rounded-none data-[state=active]:bg-transparent data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=inactive]:text-gray-500">
                  <Icon name="List" size={20} />
                  <span className="text-[10px]">Заказы</span>
                </TabsTrigger>
              )}
              <TabsTrigger value="history" className="flex-col gap-1 rounded-none data-[state=active]:bg-transparent data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=inactive]:text-gray-500">
                <Icon name="History" size={20} />
                <span className="text-[10px]">История</span>
              </TabsTrigger>
              <TabsTrigger value="more" className="flex-col gap-1 rounded-none data-[state=active]:bg-transparent data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=inactive]:text-gray-500">
                <Icon name="MoreHorizontal" size={20} />
                <span className="text-[10px]">Ещё</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="map" className="animate-slide-in-up">
            {user.user_type === 'client' && (
              <div className="max-w-6xl mx-auto mb-2 px-2">
                <ClientNotifications />
              </div>
            )}
            
            <LiveMap />
            <OnboardingTour 
              userRole={user.user_type === 'carrier' ? 'driver' : 'client'}
              onComplete={() => console.log('Tour completed')}
            />
            <AIAssistant />
            
            {user.user_type === 'carrier' && (
              <NearbyDriverNotification 
                driverRoute={driverRoute}
                enabled={true}
                userType="driver"
              />
            )}
          </TabsContent>

          {user.user_type === 'client' && (
            <>
              <TabsContent value="delivery" className="animate-slide-in-up">
                <div className="max-w-4xl mx-auto p-4">
                  <DeliveryFormMultiStep onSuccess={() => {}} />
                </div>
              </TabsContent>
              
              <TabsContent value="documents" className="animate-slide-in-up">
                <div className="max-w-4xl mx-auto">
                  <DocumentGenerator />
                </div>
              </TabsContent>
            </>
          )}

          {user.user_type === 'carrier' && (
            <TabsContent value="orders" className="animate-slide-in-up">
              <div className="space-y-6">
                <div className="max-w-4xl mx-auto">
                  <RestStatusManager userType="driver" onStatusChange={() => {}} />
                </div>
                
                <div className="max-w-4xl mx-auto">
                  <RouteOptimizer />
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <CarrierStatus userId={user.id} />
                  <RouteManager userId={user.id} />
                </div>
              </div>
            </TabsContent>
          )}
          
          {user.user_type === 'carrier' && (
            <TabsContent value="vehicles" className="animate-slide-in-up">
              <div className="max-w-6xl mx-auto space-y-6">
                <FleetManager />
              </div>
            </TabsContent>
          )}

          <TabsContent value="history" className="animate-slide-in-up">
            <div className="max-w-4xl mx-auto">
              <DeliveryHistory userId={user.id} userType={user.user_type} />
            </div>
          </TabsContent>

          <TabsContent value="more" className="animate-slide-in-up">
            <div className="max-w-4xl mx-auto space-y-4 p-4">
              <h2 className="text-2xl font-bold mb-4">Дополнительно</h2>
              
              {user.user_type === 'client' && (
                <button
                  onClick={() => document.querySelector('[value="documents"]')?.click()}
                  className="w-full flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                >
                  <Icon name="FileText" size={24} className="text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium">Документы</div>
                    <div className="text-sm text-gray-500">Генерация накладных и актов</div>
                  </div>
                </button>
              )}
              
              {user.user_type === 'carrier' && (
                <button
                  onClick={() => document.querySelector('[value="vehicles"]')?.click()}
                  className="w-full flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                >
                  <Icon name="Truck" size={24} className="text-green-600" />
                  <div className="text-left">
                    <div className="font-medium">Автопарк</div>
                    <div className="text-sm text-gray-500">Управление транспортом</div>
                  </div>
                </button>
              )}
              
              <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
              
              <AppDownload />
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {showProfile && (
        <UserProfile user={user} onClose={() => setShowProfile(false)} />
      )}
    </div>
  );
};

export default Index;