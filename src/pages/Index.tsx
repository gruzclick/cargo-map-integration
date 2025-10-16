import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import LiveMap from '@/components/LiveMap';
import Auth from '@/components/Auth';
import DeliveryForm from '@/components/DeliveryForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
  };

  if (!user) {
    return <Auth onSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 sticky top-0 bg-card/80 backdrop-blur-xl z-50">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
              <Icon name="Truck" size={22} className="text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Груз Клик</h1>
              <p className="text-xs text-muted-foreground">{user.full_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-accent/10 rounded-lg">
              <Icon 
                name={user.user_type === 'client' ? 'Package' : 'Truck'} 
                size={16} 
                className="text-accent" 
              />
              <span className="text-sm font-medium">
                {user.user_type === 'client' ? 'Клиент' : 'Перевозчик'}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="rounded-full">
              <Icon name="LogOut" size={16} className="mr-2" />
              Выйти
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="map" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="map">
              <Icon name="Map" size={16} className="mr-2" />
              Карта
            </TabsTrigger>
            {user.user_type === 'client' && (
              <TabsTrigger value="delivery">
                <Icon name="Plus" size={16} className="mr-2" />
                Поставка
              </TabsTrigger>
            )}
            {user.user_type === 'carrier' && (
              <TabsTrigger value="orders">
                <Icon name="List" size={16} className="mr-2" />
                Заказы
              </TabsTrigger>
            )}
            <TabsTrigger value="profile">
              <Icon name="User" size={16} className="mr-2" />
              Профиль
            </TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-4xl md:text-5xl font-semibold mb-3 text-foreground tracking-tight">
                Карта грузов и водителей
              </h2>
              <p className="text-lg text-muted-foreground">
                Все доступные грузы и свободные водители в реальном времени
              </p>
            </div>
            <LiveMap />
          </TabsContent>

          {user.user_type === 'client' && (
            <TabsContent value="delivery">
              <div className="max-w-4xl mx-auto">
                <DeliveryForm onSuccess={() => {}} />
              </div>
            </TabsContent>
          )}

          {user.user_type === 'carrier' && (
            <TabsContent value="orders">
              <div className="text-center py-12">
                <Icon name="List" size={48} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-2xl font-semibold mb-2">Доступные заказы</h3>
                <p className="text-muted-foreground">Скоро здесь появятся доступные заказы</p>
              </div>
            </TabsContent>
          )}

          <TabsContent value="profile">
            <div className="max-w-2xl mx-auto">
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
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
