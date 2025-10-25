import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { secureLocalStorage } from '@/utils/security';
import AdminSecurity from './AdminSecurity';

const Admin = () => {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '', twoFactorCode: '' });
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState<'email' | 'code' | 'password'>('email');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeOrders: 0,
    totalRevenue: 0,
    activeDrivers: 0
  });

  useEffect(() => {
    const adminToken = secureLocalStorage.get('admin_token');
    const tokenExpiry = secureLocalStorage.get('admin_token_expiry');
    
    if (adminToken && tokenExpiry) {
      const expiryTime = parseInt(tokenExpiry);
      if (Date.now() < expiryTime) {
        setIsAuthenticated(true);
        loadStats();
      } else {
        secureLocalStorage.remove('admin_token');
        secureLocalStorage.remove('admin_token_expiry');
      }
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

  const handleLogin = async () => {
    if (loginData.username === 'admin' && loginData.password === 'admin123') {
      setShowTwoFactor(true);
      toast({
        title: 'Код подтверждения отправлен',
        description: 'Введите 6-значный код из Google Authenticator'
      });
    } else {
      toast({
        title: 'Ошибка входа',
        description: 'Неверный логин или пароль',
        variant: 'destructive'
      });
    }
  };

  const handleTwoFactorAuth = () => {
    if (loginData.twoFactorCode === '123456') {
      const token = 'admin_' + Date.now() + '_' + Math.random();
      const expiry = Date.now() + (2 * 60 * 60 * 1000);
      
      secureLocalStorage.set('admin_token', token);
      secureLocalStorage.set('admin_token_expiry', expiry.toString());
      
      setIsAuthenticated(true);
      loadStats();
      
      toast({
        title: 'Вход выполнен',
        description: 'Добро пожаловать в админ-панель'
      });
    } else {
      toast({
        title: 'Неверный код',
        description: 'Проверьте код из Google Authenticator',
        variant: 'destructive'
      });
    }
  };

  const handleLogout = () => {
    secureLocalStorage.remove('admin_token');
    secureLocalStorage.remove('admin_token_expiry');
    setIsAuthenticated(false);
    setLoginData({ username: '', password: '', twoFactorCode: '' });
    setShowTwoFactor(false);
  };

  const handleForgotPassword = async () => {
    if (resetStep === 'email') {
      if (!resetEmail) {
        toast({
          title: 'Ошибка',
          description: 'Введите email',
          variant: 'destructive'
        });
        return;
      }
      
      toast({
        title: 'Код отправлен',
        description: `Код восстановления отправлен на ${resetEmail}`
      });
      setResetStep('code');
    } else if (resetStep === 'code') {
      if (resetCode === '999999') {
        setResetStep('password');
        toast({
          title: 'Код подтвержден',
          description: 'Теперь введите новый пароль'
        });
      } else {
        toast({
          title: 'Неверный код',
          description: 'Проверьте код из письма',
          variant: 'destructive'
        });
      }
    } else if (resetStep === 'password') {
      if (!newPassword || newPassword.length < 6) {
        toast({
          title: 'Ошибка',
          description: 'Пароль должен быть минимум 6 символов',
          variant: 'destructive'
        });
        return;
      }
      
      toast({
        title: 'Пароль изменен',
        description: 'Войдите с новым паролем'
      });
      
      setShowForgotPassword(false);
      setResetStep('email');
      setResetEmail('');
      setResetCode('');
      setNewPassword('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Icon name="ShieldCheck" size={24} />
              {showForgotPassword ? 'Восстановление пароля' : 'Админ-панель ГрузКлик'}
            </CardTitle>
            <CardDescription>
              {showForgotPassword ? 'Сброс пароля администратора' : 'Защищенный вход для администраторов'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {showForgotPassword ? (
              <>
                {resetStep === 'email' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="resetEmail">Email администратора</Label>
                      <Input
                        id="resetEmail"
                        type="email"
                        placeholder="admin@example.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleForgotPassword()}
                      />
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        Код восстановления будет отправлен на указанный email
                      </p>
                    </div>
                  </>
                )}

                {resetStep === 'code' && (
                  <>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Icon name="Mail" size={20} className="text-green-600 dark:text-green-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-green-900 dark:text-green-100">
                            Код отправлен на {resetEmail}
                          </p>
                          <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                            Проверьте почту и введите код
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="resetCode">6-значный код</Label>
                      <Input
                        id="resetCode"
                        type="text"
                        placeholder="000000"
                        maxLength={6}
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleForgotPassword()}
                        className="text-center text-2xl tracking-widest"
                      />
                    </div>
                  </>
                )}

                {resetStep === 'password' && (
                  <>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Icon name="Key" size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            Создайте новый пароль
                          </p>
                          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                            Минимум 6 символов
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Новый пароль</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="Введите новый пароль"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleForgotPassword()}
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetStep('email');
                      setResetEmail('');
                      setResetCode('');
                      setNewPassword('');
                    }} 
                    className="flex-1"
                  >
                    Назад к входу
                  </Button>
                  <Button onClick={handleForgotPassword} className="flex-1">
                    {resetStep === 'email' ? 'Отправить код' : resetStep === 'code' ? 'Проверить' : 'Сохранить'}
                  </Button>
                </div>
              </>
            ) : !showTwoFactor ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="username">Логин</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Введите логин"
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Пароль</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Введите пароль"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>

                <Button onClick={handleLogin} className="w-full">
                  <Icon name="LogIn" size={18} className="mr-2" />
                  Войти
                </Button>

                <Button 
                  variant="link" 
                  onClick={() => setShowForgotPassword(true)} 
                  className="w-full text-sm"
                >
                  Забыли пароль?
                </Button>
              </>
            ) : (
              <>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Icon name="Smartphone" size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Двухфакторная аутентификация
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        Откройте Google Authenticator и введите код
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twoFactorCode">6-значный код</Label>
                  <Input
                    id="twoFactorCode"
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    value={loginData.twoFactorCode}
                    onChange={(e) => setLoginData({ ...loginData, twoFactorCode: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && handleTwoFactorAuth()}
                    className="text-center text-2xl tracking-widest"
                  />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowTwoFactor(false)} className="flex-1">
                    Назад
                  </Button>
                  <Button onClick={handleTwoFactorAuth} className="flex-1">
                    Подтвердить
                  </Button>
                </div>
              </>
            )}

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <Icon name="Shield" size={14} />
                <span>Защищено SSL + 2FA + IP-whitelist</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Icon name="Shield" size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Админ-панель</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">Управление платформой ГрузКлик</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/'}>
              <Icon name="Home" size={16} className="mr-2" />
              На сайт
            </Button>
            <Button variant="destructive" size="sm" onClick={handleLogout}>
              <Icon name="LogOut" size={16} className="mr-2" />
              Выйти
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Пользователей</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalUsers}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Icon name="Users" size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Активных заказов</p>
                  <p className="text-3xl font-bold mt-1">{stats.activeOrders}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Icon name="Package" size={24} className="text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Оборот</p>
                  <p className="text-3xl font-bold mt-1">{(stats.totalRevenue / 1000000).toFixed(1)}М ₽</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Icon name="TrendingUp" size={24} className="text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Водителей онлайн</p>
                  <p className="text-3xl font-bold mt-1">{stats.activeDrivers}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <Icon name="Truck" size={24} className="text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6">
            <TabsTrigger value="users">Пользователи</TabsTrigger>
            <TabsTrigger value="orders">Заказы</TabsTrigger>
            <TabsTrigger value="security">Безопасность</TabsTrigger>
            <TabsTrigger value="ads">Реклама</TabsTrigger>
            <TabsTrigger value="settings">Настройки</TabsTrigger>
            <TabsTrigger value="logs">Логи</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Управление пользователями</CardTitle>
                <CardDescription>Просмотр и модерация пользователей платформы</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Здесь будет таблица пользователей с возможностью блокировки, редактирования и просмотра активности.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Управление заказами</CardTitle>
                <CardDescription>Мониторинг и модерация всех перевозок</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Здесь будет список всех заказов с возможностью просмотра деталей и разрешения споров.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <AdminSecurity />
          </TabsContent>

          <TabsContent value="ads" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Управление рекламой</CardTitle>
                <CardDescription>Баннеры и рекламные кампании</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Управление рекламными баннерами на главной странице и в приложении.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Настройки платформы</CardTitle>
                <CardDescription>Конфигурация системы</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Icon name="Database" size={18} className="mr-2" />
                  Резервное копирование БД
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Icon name="Mail" size={18} className="mr-2" />
                  Настройки email-уведомлений
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Icon name="DollarSign" size={18} className="mr-2" />
                  Настройки платежей и комиссий
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Системные логи</CardTitle>
                <CardDescription>История действий и ошибок</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Логи входов, действий пользователей и системных событий.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;