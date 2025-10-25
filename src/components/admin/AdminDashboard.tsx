import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { secureLocalStorage } from '@/utils/security';
import AdminSecurity from '@/pages/AdminSecurity';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeOrders: 0,
    totalRevenue: 0,
    activeDrivers: 0
  });
  const [adminProfile, setAdminProfile] = useState<any>(null);

  useEffect(() => {
    loadStats();
    const profile = secureLocalStorage.get('admin_profile');
    if (profile) {
      setAdminProfile(JSON.parse(profile));
    }
  }, []);

  const loadStats = () => {
    setStats({
      totalUsers: 1247,
      activeOrders: 89,
      totalRevenue: 2450000,
      activeDrivers: 523
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Icon name="LayoutDashboard" size={32} />
              Панель управления
            </h1>
            {adminProfile && (
              <p className="text-gray-600 mt-1">
                Добро пожаловать, {adminProfile.full_name}
              </p>
            )}
          </div>
          <Button variant="outline" onClick={onLogout}>
            <Icon name="LogOut" size={16} className="mr-2" />
            Выйти
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Всего пользователей
              </CardTitle>
              <Icon name="Users" size={20} className="text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Активные заказы
              </CardTitle>
              <Icon name="Package" size={20} className="text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Общая выручка
              </CardTitle>
              <Icon name="DollarSign" size={20} className="text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalRevenue.toLocaleString()} ₽
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Активные водители
              </CardTitle>
              <Icon name="Truck" size={20} className="text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeDrivers}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="users">Пользователи</TabsTrigger>
            <TabsTrigger value="orders">Заказы</TabsTrigger>
            <TabsTrigger value="security">Безопасность</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Последние активности</CardTitle>
                <CardDescription>Недавние действия в системе</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { 
                      icon: 'UserPlus', 
                      title: 'Новый пользователь зарегистрирован', 
                      time: '5 минут назад',
                      color: 'text-green-600'
                    },
                    { 
                      icon: 'Package', 
                      title: 'Создан заказ #1247', 
                      time: '15 минут назад',
                      color: 'text-blue-600'
                    },
                    { 
                      icon: 'CheckCircle', 
                      title: 'Заказ #1246 завершен', 
                      time: '1 час назад',
                      color: 'text-purple-600'
                    },
                    { 
                      icon: 'Truck', 
                      title: 'Новый водитель добавлен', 
                      time: '2 часа назад',
                      color: 'text-orange-600'
                    }
                  ].map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-4 pb-4 border-b last:border-0">
                      <Icon name={activity.icon as any} size={20} className={activity.color} />
                      <div className="flex-1">
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Управление пользователями</CardTitle>
                <CardDescription>Просмотр и управление пользователями системы</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Icon name="Users" size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Функционал управления пользователями в разработке</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Управление заказами</CardTitle>
                <CardDescription>Просмотр и управление заказами</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Icon name="Package" size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Функционал управления заказами в разработке</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <AdminSecurity />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
