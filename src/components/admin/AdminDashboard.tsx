import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { secureLocalStorage } from '@/utils/security';
import AdminSecurity from '@/pages/AdminSecurity';
import { DashboardStats } from './DashboardStats';
import { UsersTable } from './UsersTable';
import { DeliveriesTable } from './DeliveriesTable';

interface AdminDashboardProps {
  onLogout: () => void;
}

interface User {
  id: string;
  phone_number: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

interface Delivery {
  id: string;
  user_id: string;
  driver_id: string;
  status: string;
  pickup_address: string;
  delivery_address: string;
  delivery_price: number;
  created_at: string;
}

export const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeOrders: 0,
    totalRevenue: 0,
    activeDrivers: 0
  });
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('admin_theme') as 'light' | 'dark' || 'dark';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');

    const profile = secureLocalStorage.get('admin_profile');
    if (profile) {
      setAdminProfile(JSON.parse(profile));
    }

    loadStats();
    loadUsers();
    loadDeliveries();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('admin_theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const loadStats = async () => {
    setLoading(true);
    try {
      const token = secureLocalStorage.get('admin_token');
      
      const response = await fetch('https://functions.poehali.dev/f06efb37-9437-4df8-8032-f2ba53b2e2d6', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Auth-Token': token || ''
        },
        body: JSON.stringify({
          action: 'get_stats'
        })
      });

      const data = await response.json();

      if (response.ok && data.stats) {
        setStats(data.stats);
      } else {
        setStats({
          totalUsers: 0,
          activeOrders: 0,
          totalRevenue: 0,
          activeDrivers: 0
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
      setStats({
        totalUsers: 0,
        activeOrders: 0,
        totalRevenue: 0,
        activeDrivers: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const token = secureLocalStorage.get('admin_token');
      
      const response = await fetch('https://functions.poehali.dev/f06efb37-9437-4df8-8032-f2ba53b2e2d6', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Auth-Token': token || ''
        },
        body: JSON.stringify({
          action: 'get_users'
        })
      });

      const data = await response.json();

      if (response.ok && data.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadDeliveries = async () => {
    setLoadingDeliveries(true);
    try {
      const token = secureLocalStorage.get('admin_token');
      
      const response = await fetch('https://functions.poehali.dev/f06efb37-9437-4df8-8032-f2ba53b2e2d6', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Auth-Token': token || ''
        },
        body: JSON.stringify({
          action: 'get_deliveries'
        })
      });

      const data = await response.json();

      if (response.ok && data.deliveries) {
        setDeliveries(data.deliveries);
      }
    } catch (error) {
      console.error('Ошибка загрузки заказов:', error);
    } finally {
      setLoadingDeliveries(false);
    }
  };

  const updateUserStatus = async (userId: string, status: string) => {
    try {
      const token = secureLocalStorage.get('admin_token');
      
      const response = await fetch('https://functions.poehali.dev/f06efb37-9437-4df8-8032-f2ba53b2e2d6', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Auth-Token': token || ''
        },
        body: JSON.stringify({
          action: 'update_user_status',
          user_id: userId,
          status
        })
      });

      if (response.ok) {
        loadUsers();
      }
    } catch (error) {
      console.error('Ошибка обновления статуса:', error);
    }
  };

  const updateDeliveryStatus = async (deliveryId: string, status: string) => {
    try {
      const token = secureLocalStorage.get('admin_token');
      
      const response = await fetch('https://functions.poehali.dev/f06efb37-9437-4df8-8032-f2ba53b2e2d6', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Auth-Token': token || ''
        },
        body: JSON.stringify({
          action: 'update_delivery_status',
          delivery_id: deliveryId,
          status
        })
      });

      if (response.ok) {
        loadDeliveries();
        loadStats();
      }
    } catch (error) {
      console.error('Ошибка обновления заказа:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 transition-colors">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
              <Icon name="LayoutDashboard" size={32} />
              Панель управления
            </h1>
            {adminProfile && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Добро пожаловать, {adminProfile.full_name}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleTheme}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <Icon name={theme === 'dark' ? 'Sun' : 'Moon'} size={20} />
            </Button>
            <Button 
              variant="outline" 
              onClick={onLogout}
              className="border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
            >
              <Icon name="LogOut" size={16} className="mr-2" />
              Выйти
            </Button>
          </div>
        </div>

        <DashboardStats stats={stats} loading={loading} />

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800 text-gray-900 dark:text-gray-100">Обзор</TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800 text-gray-900 dark:text-gray-100">Пользователи</TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800 text-gray-900 dark:text-gray-100">Заказы</TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800 text-gray-900 dark:text-gray-100">Безопасность</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Последние активности</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">Недавние действия в системе</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Icon name="Activity" size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p>Нет данных для отображения</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <UsersTable 
              users={users} 
              loading={loadingUsers} 
              onUpdateStatus={updateUserStatus}
            />
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <DeliveriesTable 
              deliveries={deliveries} 
              loading={loadingDeliveries} 
              onUpdateStatus={updateDeliveryStatus}
            />
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <AdminSecurity />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
