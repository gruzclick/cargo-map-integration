import { useState } from 'react';
import LiveMap from '@/components/LiveMap';
import OnboardingTour from '@/components/OnboardingTour';
import AIAssistant from '@/components/AIAssistant';
import NearbyDriverNotification from '@/components/NearbyDriverNotification';
import DeliveryFormMultiStep from '@/components/DeliveryFormMultiStep';
import DocumentGenerator from '@/components/DocumentGenerator';
import RestStatusManager from '@/components/RestStatusManager';
import RouteOptimizer from '@/components/RouteOptimizer';
import CarrierStatus from '@/components/CarrierStatus';
import RouteManager from '@/components/RouteManager';
import FleetManager from '@/components/FleetManager';
import DeliveryHistory from '@/components/DeliveryHistory';
import ClientNotifications from '@/components/ClientNotifications';
import AppDownload from '@/components/AppDownload';
import SecurityRecommendations from '@/components/SecurityRecommendations';
import { AllOrdersMap } from '@/components/orders/AllOrdersMap';
import Icon from '@/components/ui/icon';
import { TabsContent } from '@/components/ui/tabs';

interface IndexTabsContentProps {
  user: any;
  driverRoute: Array<{ warehouse: string; time: string }>;
}

const IndexTabsContent = ({ user, driverRoute }: IndexTabsContentProps) => {
  const [showSecurity, setShowSecurity] = useState(false);

  return (
    <>
      {showSecurity && <SecurityRecommendations onClose={() => setShowSecurity(false)} />}
      
      <TabsContent value="map" className="animate-slide-in-up">
        {user.user_type === 'client' && (
          <div className="max-w-6xl mx-auto mb-2 px-2">
            <ClientNotifications />
          </div>
        )}
        
        <div className="max-w-6xl mx-auto mb-4 px-4">
          <AllOrdersMap
            currentUserId={user.id || user.user_id}
            currentUserName={user.name || user.email}
            onOrderAccept={(orderId) => console.log('Order accepted:', orderId)}
          />
        </div>
        
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
          
          <button
            onClick={() => setShowSecurity(true)}
            className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl border border-red-200 dark:border-red-700 hover:shadow-lg transition-all"
          >
            <Icon name="Shield" size={24} className="text-red-600" />
            <div className="text-left">
              <div className="font-medium">Правила безопасности</div>
              <div className="text-sm text-gray-500">Защита от мошенников</div>
            </div>
          </button>
          
          <AppDownload />
        </div>
      </TabsContent>
    </>
  );
};

export default IndexTabsContent;