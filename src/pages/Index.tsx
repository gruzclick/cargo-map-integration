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
  const [userStatus, setUserStatus] = useState<'cargo' | 'vehicle' | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    const token = secureLocalStorage.get('auth_token');
    const userData = secureLocalStorage.get('user_data');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Failed to parse user data:', error);
        secureLocalStorage.remove('auth_token');
        secureLocalStorage.remove('user_data');
      }
    }

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
    setUser(userData);
    setShowAuth(false);
    
    const savedStatus = localStorage.getItem('user_status');
    if (!savedStatus) {
      setShowStatusSelector(true);
    } else {
      setUserStatus(savedStatus as 'cargo' | 'vehicle');
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
      {showStatusSelector && (
        <UserStatusSelector onStatusSelect={handleStatusSelect} />
      )}
      
      <PWAInstallPrompt />
      <CookieBanner />
      <header className="border-b border-gray-200/20 dark:border-gray-700/30 sticky top-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl z-50 shadow-lg animate-slide-in-down">
        <div className="container mx-auto px-1 md:px-2 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 bg-gray-900 dark:bg-gray-100 rounded-xl flex items-center justify-center">
              <Icon name="Truck" size={18} className="text-white dark:text-gray-900" />
            </div>
            <span className="text-base font-bold text-gray-900 dark:text-gray-100 hidden md:inline">ГрузКлик</span>
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

      <div className="container mx-auto px-0.5 md:px-1 py-1 md:py-2">
        <Tabs defaultValue="map" className="w-full">
          <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-3 md:grid-cols-6 mb-2 bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl border border-gray-200/20 dark:border-gray-700/30 p-1.5 rounded-2xl shadow-lg overflow-x-auto">
            <TabsTrigger value="map" className="rounded-xl data-[state=active]:bg-white/80 dark:data-[state=active]:bg-gray-800/80 data-[state=active]:backdrop-blur-xl data-[state=active]:shadow-md text-xs md:text-sm">
              <Icon name="Map" size={16} className="md:mr-2" />
              <span className="hidden md:inline">Карта</span>
            </TabsTrigger>
            {user.user_type === 'client' && (
              <>
                <TabsTrigger value="delivery" className="rounded-xl data-[state=active]:bg-white/80 dark:data-[state=active]:bg-gray-800/80 data-[state=active]:backdrop-blur-xl data-[state=active]:shadow-md text-xs md:text-sm">
                  <Icon name="Plus" size={16} className="md:mr-2" />
                  <span className="hidden md:inline">Поставка</span>
                </TabsTrigger>
                <TabsTrigger value="documents" className="rounded-xl data-[state=active]:bg-white/80 dark:data-[state=active]:bg-gray-800/80 data-[state=active]:backdrop-blur-xl data-[state=active]:shadow-md text-xs md:text-sm">
                  <Icon name="FileText" size={16} className="md:mr-2" />
                  <span className="hidden md:inline">Документы</span>
                </TabsTrigger>
              </>
            )}
            {user.user_type === 'carrier' && (
              <>
                <TabsTrigger value="orders" className="rounded-xl data-[state=active]:bg-white/80 dark:data-[state=active]:bg-gray-800/80 data-[state=active]:backdrop-blur-xl data-[state=active]:shadow-md text-xs md:text-sm">
                  <Icon name="List" size={16} className="md:mr-2" />
                  <span className="hidden md:inline">Заказы</span>
                </TabsTrigger>
                <TabsTrigger value="vehicles" className="rounded-xl data-[state=active]:bg-white/80 dark:data-[state=active]:bg-gray-800/80 data-[state=active]:backdrop-blur-xl data-[state=active]:shadow-md text-xs md:text-sm">
                  <Icon name="Truck" size={16} className="md:mr-2" />
                  <span className="hidden md:inline">Автопарк</span>
                </TabsTrigger>
              </>
            )}
            <TabsTrigger value="history" className="rounded-xl data-[state=active]:bg-white/80 dark:data-[state=active]:bg-gray-800/80 data-[state=active]:backdrop-blur-xl data-[state=active]:shadow-md text-xs md:text-sm">
              <Icon name="History" size={16} className="md:mr-2" />
              <span className="hidden md:inline">История</span>
            </TabsTrigger>

            <TabsTrigger value="profile" className="rounded-xl data-[state=active]:bg-white/80 dark:data-[state=active]:bg-gray-800/80 data-[state=active]:backdrop-blur-xl data-[state=active]:shadow-md text-xs md:text-sm">
              <Icon name="User" size={16} className="md:mr-2" />
              <span className="hidden md:inline">Профиль</span>
            </TabsTrigger>
            <TabsTrigger value="download" className="rounded-xl data-[state=active]:bg-white/80 dark:data-[state=active]:bg-gray-800/80 data-[state=active]:backdrop-blur-xl data-[state=active]:shadow-md text-xs md:text-sm">
              <Icon name="Download" size={16} className="md:mr-2" />
              <span className="hidden md:inline">Скачать</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-3 md:space-y-4 animate-slide-in-up">
            <div className="text-center mb-2 md:mb-3">
              <h2 className="text-xl md:text-3xl lg:text-4xl font-semibold mb-1 md:mb-2 text-foreground tracking-tight"></h2>
              <p className="text-xs md:text-base text-muted-foreground"></p>
            </div>
            
            {user.user_type === 'client' && (
              <div className="max-w-6xl mx-auto mb-3">
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
                <div className="max-w-4xl mx-auto">
                  <DeliveryForm onSuccess={() => {}} />
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



          <TabsContent value="profile" className="animate-slide-in-up">
            <div className="max-w-4xl mx-auto space-y-6">
              {user.user_type === 'client' && (
                <RestStatusManager userType="client" onStatusChange={() => {}} />
              )}
              
              <div className="bg-card rounded-3xl shadow-xl p-8 space-y-6">
                <div className="flex items-center gap-4 pb-6 border-b">
                  <div className="w-20 h-20 bg-accent/10 rounded-2xl flex items-center justify-center">
                    <Icon name="User" size={36} className="text-accent" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold">{user.full_name}</h3>
                    <p className="text-muted-foreground">{user.email}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-muted-foreground">Тип аккаунта</span>
                    <span className="font-medium">
                      {user.user_type === 'client' ? 'Клиент' : 'Перевозчик'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{user.email}</span>
                  </div>
                </div>
              </div>

              {user.user_type === 'carrier' && (
                <RatingSystem 
                  carrierId={user.id} 
                  carrierName={user.full_name}
                  canReview={false}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="download" className="animate-slide-in-up">
            <div className="max-w-4xl mx-auto">
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