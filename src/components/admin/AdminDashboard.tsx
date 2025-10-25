import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { secureLocalStorage } from '@/utils/security';
import AdminSecurity from '@/pages/AdminSecurity';

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
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [deliverySearch, setDeliverySearch] = useState('');
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState('all');

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

  const filteredUsers = users.filter(user => {
    const matchesSearch = userSearch === '' || 
      user.full_name.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.phone_number.toLowerCase().includes(userSearch.toLowerCase());
    
    const matchesRole = userRoleFilter === 'all' || user.role === userRoleFilter;
    const matchesStatus = userStatusFilter === 'all' || user.status === userStatusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = deliverySearch === '' ||
      delivery.pickup_address.toLowerCase().includes(deliverySearch.toLowerCase()) ||
      delivery.delivery_address.toLowerCase().includes(deliverySearch.toLowerCase());
    
    const matchesStatus = deliveryStatusFilter === 'all' || delivery.status === deliveryStatusFilter;
    
    return matchesSearch && matchesStatus;
  });

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Всего пользователей
              </CardTitle>
              <Icon name="Users" size={20} className="text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? '...' : stats.totalUsers.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Активные заказы
              </CardTitle>
              <Icon name="Package" size={20} className="text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? '...' : stats.activeOrders}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Общая выручка
              </CardTitle>
              <Icon name="DollarSign" size={20} className="text-yellow-600 dark:text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? '...' : `${stats.totalRevenue.toLocaleString()} ₽`}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Активные водители
              </CardTitle>
              <Icon name="Truck" size={20} className="text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? '...' : stats.activeDrivers}
              </div>
            </CardContent>
          </Card>
        </div>

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
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Управление пользователями</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">Просмотр и управление пользователями системы</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4 flex-wrap">
                  <Input
                    placeholder="Поиск по имени, email, телефону..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="max-w-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="px-3 py-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
                  >
                    <option value="all">Все роли</option>
                    <option value="client">Клиент</option>
                    <option value="carrier">Перевозчик</option>
                  </select>
                  <select
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value)}
                    className="px-3 py-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
                  >
                    <option value="all">Все статусы</option>
                    <option value="active">Активные</option>
                    <option value="inactive">Неактивные</option>
                  </select>
                </div>
                {loadingUsers ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Загрузка...
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Icon name="Users" size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p>Нет пользователей</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-800">
                          <th className="text-left p-3 text-gray-600 dark:text-gray-400">ID</th>
                          <th className="text-left p-3 text-gray-600 dark:text-gray-400">Телефон</th>
                          <th className="text-left p-3 text-gray-600 dark:text-gray-400">ФИО</th>
                          <th className="text-left p-3 text-gray-600 dark:text-gray-400">Email</th>
                          <th className="text-left p-3 text-gray-600 dark:text-gray-400">Роль</th>
                          <th className="text-left p-3 text-gray-600 dark:text-gray-400">Статус</th>
                          <th className="text-left p-3 text-gray-600 dark:text-gray-400">Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user) => (
                          <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800">
                            <td className="p-3 text-gray-900 dark:text-gray-100 font-mono text-xs">{user.id.slice(0, 8)}...</td>
                            <td className="p-3 text-gray-900 dark:text-gray-100">{user.phone_number}</td>
                            <td className="p-3 text-gray-900 dark:text-gray-100">{user.full_name || '-'}</td>
                            <td className="p-3 text-gray-900 dark:text-gray-100">{user.email || '-'}</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded text-xs ${
                                user.role === 'driver' ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' :
                                user.role === 'admin' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                                'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded text-xs ${
                                user.status === 'active' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                                'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                              }`}>
                                {user.status}
                              </span>
                            </td>
                            <td className="p-3">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => updateUserStatus(user.id, user.status === 'active' ? 'blocked' : 'active')}
                                className="text-xs"
                              >
                                {user.status === 'active' ? 'Заблокировать' : 'Разблокировать'}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Управление заказами</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">Просмотр и управление заказами</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4 flex-wrap">
                  <Input
                    placeholder="Поиск по адресам..."
                    value={deliverySearch}
                    onChange={(e) => setDeliverySearch(e.target.value)}
                    className="max-w-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                  <select
                    value={deliveryStatusFilter}
                    onChange={(e) => setDeliveryStatusFilter(e.target.value)}
                    className="px-3 py-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
                  >
                    <option value="all">Все статусы</option>
                    <option value="pending">Ожидание</option>
                    <option value="active">Активные</option>
                    <option value="completed">Завершенные</option>
                    <option value="cancelled">Отмененные</option>
                  </select>
                </div>
                {loadingDeliveries ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Загрузка...
                  </div>
                ) : filteredDeliveries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Icon name="Package" size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p>Нет заказов</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-800">
                          <th className="text-left p-3 text-gray-600 dark:text-gray-400">ID</th>
                          <th className="text-left p-3 text-gray-600 dark:text-gray-400">Откуда</th>
                          <th className="text-left p-3 text-gray-600 dark:text-gray-400">Куда</th>
                          <th className="text-left p-3 text-gray-600 dark:text-gray-400">Цена</th>
                          <th className="text-left p-3 text-gray-600 dark:text-gray-400">Статус</th>
                          <th className="text-left p-3 text-gray-600 dark:text-gray-400">Дата</th>
                          <th className="text-left p-3 text-gray-600 dark:text-gray-400">Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDeliveries.map((delivery) => (
                          <tr key={delivery.id} className="border-b border-gray-100 dark:border-gray-800">
                            <td className="p-3 text-gray-900 dark:text-gray-100 font-mono text-xs">{delivery.id.slice(0, 8)}...</td>
                            <td className="p-3 text-gray-900 dark:text-gray-100">{delivery.pickup_address}</td>
                            <td className="p-3 text-gray-900 dark:text-gray-100">{delivery.delivery_address}</td>
                            <td className="p-3 text-gray-900 dark:text-gray-100">{delivery.delivery_price} ₽</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded text-xs ${
                                delivery.status === 'completed' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                                delivery.status === 'active' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                                delivery.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                                'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                              }`}>
                                {delivery.status}
                              </span>
                            </td>
                            <td className="p-3 text-gray-900 dark:text-gray-100">{new Date(delivery.created_at).toLocaleDateString('ru-RU')}</td>
                            <td className="p-3">
                              <select 
                                value={delivery.status}
                                onChange={(e) => updateDeliveryStatus(delivery.id, e.target.value)}
                                className="text-xs border rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
                              >
                                <option value="pending">pending</option>
                                <option value="active">active</option>
                                <option value="completed">completed</option>
                                <option value="cancelled">cancelled</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
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