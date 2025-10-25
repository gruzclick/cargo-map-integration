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
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loginData, setLoginData] = useState({ 
    email: '', 
    password: '', 
    full_name: ''
  });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState<'email' | 'code' | 'password'>('email');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const handleAuth = async () => {
    if (!loginData.email || !loginData.password) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive'
      });
      return;
    }

    if (isRegisterMode && !loginData.full_name) {
      toast({
        title: 'Ошибка',
        description: 'Укажите ваше полное имя',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://functions.poehali.dev/f06efb37-9437-4df8-8032-f2ba53b2e2d6', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isRegisterMode ? 'register' : 'login',
          email: loginData.email,
          password: loginData.password,
          full_name: loginData.full_name
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка запроса');
      }

      const token = data.token;
      const expiry = Date.now() + (2 * 60 * 60 * 1000);

      secureLocalStorage.set('admin_token', token);
      secureLocalStorage.set('admin_token_expiry', expiry.toString());
      secureLocalStorage.set('admin_profile', JSON.stringify(data.admin));

      setIsAuthenticated(true);
      loadStats();

      toast({
        title: isRegisterMode ? 'Регистрация успешна' : 'Вход выполнен',
        description: `Добро пожаловать, ${data.admin.full_name}!`
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
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

      setLoading(true);
      
      try {
        const response = await fetch('https://functions.poehali.dev/f06efb37-9437-4df8-8032-f2ba53b2e2d6', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'send_reset_code',
            email: resetEmail
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Ошибка отправки кода');
        }

        toast({
          title: 'Код отправлен',
          description: `Код восстановления отправлен на ${resetEmail}`
        });
        setResetStep('code');
      } catch (error: any) {
        toast({
          title: 'Ошибка',
          description: error.message,
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    } else if (resetStep === 'code') {
      if (!resetCode) {
        toast({
          title: 'Ошибка',
          description: 'Введите код',
          variant: 'destructive'
        });
        return;
      }
      
      setResetStep('password');
      toast({
        title: 'Код подтвержден',
        description: 'Теперь введите новый пароль'
      });
    } else if (resetStep === 'password') {
      if (!newPassword || newPassword.length < 6) {
        toast({
          title: 'Ошибка',
          description: 'Пароль должен быть минимум 6 символов',
          variant: 'destructive'
        });
        return;
      }

      setLoading(true);
      
      try {
        const response = await fetch('https://functions.poehali.dev/f06efb37-9437-4df8-8032-f2ba53b2e2d6', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'reset_password',
            email: resetEmail,
            code: resetCode,
            new_password: newPassword
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Ошибка сброса пароля');
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
      } catch (error: any) {
        toast({
          title: 'Ошибка',
          description: error.message,
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLogout = () => {
    secureLocalStorage.remove('admin_token');
    secureLocalStorage.remove('admin_token_expiry');
    secureLocalStorage.remove('admin_profile');
    setIsAuthenticated(false);
    setLoginData({ email: '', password: '', full_name: '' });
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
              {showForgotPassword ? 'Сброс пароля администратора' : isRegisterMode ? 'Создайте учетную запись администратора' : 'Защищенный вход для администраторов'}
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
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder="Введите новый пароль"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleForgotPassword()}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          <Icon name={showNewPassword ? 'EyeOff' : 'Eye'} size={18} className="text-muted-foreground" />
                        </Button>
                      </div>
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
                  <Button onClick={handleForgotPassword} disabled={loading} className="flex-1">
                    {loading ? (
                      <>
                        <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                        Загрузка...
                      </>
                    ) : (
                      resetStep === 'email' ? 'Отправить код' : resetStep === 'code' ? 'Проверить' : 'Сохранить'
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
                  />
                </div>

                {isRegisterMode && (
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Полное имя</Label>
                    <Input
                      id="full_name"
                      type="text"
                      placeholder="Иван Иванов"
                      value={loginData.full_name}
                      onChange={(e) => setLoginData({ ...loginData, full_name: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">Пароль</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showLoginPassword ? 'text' : 'password'}
                      placeholder="Введите пароль"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                    >
                      <Icon name={showLoginPassword ? 'EyeOff' : 'Eye'} size={18} className="text-muted-foreground" />
                    </Button>
                  </div>
                </div>

                <Button onClick={handleAuth} disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                      Загрузка...
                    </>
                  ) : (
                    <>
                      <Icon name={isRegisterMode ? 'UserPlus' : 'LogIn'} size={18} className="mr-2" />
                      {isRegisterMode ? 'Зарегистрироваться' : 'Войти'}
                    </>
                  )}
                </Button>

                <div className="flex flex-col gap-2">
                  <Button 
                    variant="link" 
                    onClick={() => setShowForgotPassword(true)} 
                    className="text-sm"
                  >
                    Забыли пароль?
                  </Button>

                  <Button 
                    variant="outline" 
                    onClick={() => setIsRegisterMode(!isRegisterMode)} 
                    className="w-full text-sm"
                  >
                    {isRegisterMode ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
                  </Button>
                </div>
              </>
            )}

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <Icon name="Shield" size={14} />
                <span>Защищено SSL шифрованием</span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего пользователей</CardTitle>
              <Icon name="Users" size={16} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Активные заказы</CardTitle>
              <Icon name="Package" size={16} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Общий доход</CardTitle>
              <Icon name="DollarSign" size={16} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString('ru-RU')} ₽</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Активные водители</CardTitle>
              <Icon name="Truck" size={16} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeDrivers}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="users">Пользователи</TabsTrigger>
            <TabsTrigger value="orders">Заказы</TabsTrigger>
            <TabsTrigger value="security">Безопасность</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Статистика платформы</CardTitle>
                <CardDescription>Основные показатели работы системы</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Добро пожаловать в административную панель ГрузКлик
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Управление пользователями</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Список пользователей будет здесь
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Управление заказами</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Список заказов будет здесь
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <AdminSecurity />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;