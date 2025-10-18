import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import LiveMap from '@/components/LiveMap';
import Auth from '@/components/Auth';
import PublicMap from '@/components/PublicMap';
import LanguageSelector from '@/components/LanguageSelector';
import ThemeToggle from '@/components/ThemeToggle';
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
import TermsUpdateNotification from '@/components/TermsUpdateNotification';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { detectUserCountry, getCurrencyByCountry, getLanguageByCountry } from '@/utils/geoip';

const Index = () => {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [driverRoute, setDriverRoute] = useState<Array<{ warehouse: string; time: string }>>([]);
  const [trackingDeliveryId, setTrackingDeliveryId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
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
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
    setShowAuth(false);
  };

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    setShowAuth(false);
  };

  if (!user && !showAuth) {
    return <PublicMap onRegister={() => setShowAuth(true)} />;
  }

  if (!user && showAuth) {
    return <Auth onSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {user && <TermsUpdateNotification userId={user.user_id || user.phone} />}
      <header className="border-b border-gray-200/50 dark:border-gray-800/50 sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl z-50 shadow-sm">
        <div className="container mx-auto px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gray-900 dark:bg-gray-100 rounded-xl flex items-center justify-center">
              <Icon name="Truck" size={18} className="text-white dark:text-gray-900" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100">{t('appTitle')}</h1>
              <p className="text-[10px] text-gray-600 dark:text-gray-400">{t('appSubtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSelector />
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Icon 
                name={user.user_type === 'client' ? 'Package' : 'Truck'} 
                size={14} 
                className="text-gray-700 dark:text-gray-300" 
              />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {user.user_type === 'client' ? 'Клиент' : 'Перевозчик'}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
              <Icon name="LogOut" size={14} className="mr-1.5" />
              <span className="text-xs">Выйти</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="map" className="w-full">
          <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-3 md:grid-cols-6 mb-8 bg-muted/30 p-1.5 rounded-2xl">
            <TabsTrigger value="map" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md">
              <Icon name="Map" size={16} className="mr-2" />
              Карта
            </TabsTrigger>
            {user.user_type === 'client' && (
              <>
                <TabsTrigger value="delivery" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md">
                  <Icon name="Plus" size={16} className="mr-2" />
                  Поставка
                </TabsTrigger>
                <TabsTrigger value="documents" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md">
                  <Icon name="FileText" size={16} className="mr-2" />
                  Документы
                </TabsTrigger>
              </>
            )}
            {user.user_type === 'carrier' && (
              <>
                <TabsTrigger value="orders" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md">
                  <Icon name="List" size={16} className="mr-2" />
                  Заказы
                </TabsTrigger>
                <TabsTrigger value="vehicles" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md">
                  <Icon name="Truck" size={16} className="mr-2" />
                  Автопарк
                </TabsTrigger>
              </>
            )}
            <TabsTrigger value="history" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md">
              <Icon name="History" size={16} className="mr-2" />
              История
            </TabsTrigger>
            <TabsTrigger value="profile" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md">
              <Icon name="User" size={16} className="mr-2" />
              Профиль
            </TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-4xl md:text-5xl font-semibold mb-3 text-foreground tracking-tight">
                Информационная платформа Груз Клик
              </h2>
              <p className="text-lg text-muted-foreground">
                Все доступные грузы и свободные водители в реальном времени
              </p>
            </div>
            
            {user.user_type === 'client' && (
              <div className="max-w-4xl mx-auto mb-6">
                <ClientNotifications />
              </div>
            )}
            
            <LiveMap />
            
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
              <TabsContent value="delivery">
                <div className="max-w-4xl mx-auto">
                  <DeliveryForm onSuccess={() => {}} />
                </div>
              </TabsContent>
              
              <TabsContent value="documents">
                <div className="max-w-4xl mx-auto">
                  <DocumentGenerator />
                </div>
              </TabsContent>
            </>
          )}

          {user.user_type === 'carrier' && (
            <TabsContent value="orders">
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
            <TabsContent value="vehicles">
              <div className="max-w-6xl mx-auto space-y-6">
                <FleetManager />
              </div>
            </TabsContent>
          )}

          <TabsContent value="history">
            <div className="max-w-4xl mx-auto">
              <DeliveryHistory userId={user.id} userType={user.user_type} />
            </div>
          </TabsContent>

          <TabsContent value="profile">
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
        </Tabs>
      </div>
    </div>
  );
};

export default Index;