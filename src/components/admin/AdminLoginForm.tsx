import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import FaceIDAuth from '@/components/FaceIDAuth';

interface AdminLoginFormProps {
  onSuccess: (token: string, admin: any) => void;
  onShowForgotPassword: () => void;
}

export const AdminLoginForm = ({ onSuccess, onShowForgotPassword }: AdminLoginFormProps) => {
  const { toast } = useToast();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loginData, setLoginData] = useState({ 
    email: '', 
    password: '', 
    full_name: ''
  });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('admin_theme') as 'light' | 'dark' || 'dark';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    if (window.PublicKeyCredential) {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      setBiometricAvailable(available);
    }
  };

  const tryBiometricLogin = async () => {
    const biometricEnabled = localStorage.getItem('biometric_enabled') === 'true';
    const savedCredential = localStorage.getItem('biometric_credential');

    if (!biometricEnabled || !savedCredential) return;

    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: challenge,
          rpId: window.location.hostname,
          allowCredentials: [{
            id: new Uint8Array(JSON.parse(savedCredential).rawId),
            type: 'public-key',
            transports: ['internal']
          }],
          userVerification: 'required',
          timeout: 60000
        }
      });

      if (credential) {
        toast({
          title: 'Биометрия подтверждена',
          description: 'Выполняется вход...'
        });
      }
    } catch (error) {
      console.log('Биометрическая аутентификация не удалась');
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const savedCredential = localStorage.getItem('biometric_credential');
      if (!savedCredential) {
        toast({
          title: 'Ошибка',
          description: 'Биометрия не настроена',
          variant: 'destructive'
        });
        return;
      }

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: challenge,
          rpId: window.location.hostname,
          allowCredentials: [{
            id: new Uint8Array(JSON.parse(savedCredential).rawId),
            type: 'public-key',
            transports: ['internal']
          }],
          userVerification: 'required',
          timeout: 60000
        }
      });

      if (credential) {
        setLoading(true);
        
        const response = await fetch('https://functions.poehali.dev/f06efb37-9437-4df8-8032-f2ba53b2e2d6', {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({
            action: 'login',
            email: localStorage.getItem('biometric_email') || '',
            password: localStorage.getItem('biometric_password_hash') || ''
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Ошибка входа');
        }

        toast({
          title: 'Вход выполнен',
          description: `Добро пожаловать, ${data.admin.full_name}!`
        });

        onSuccess(data.token, data.admin);
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: 'Биометрическая аутентификация не удалась',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('admin_theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
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

    // ВРЕМЕННОЕ РЕШЕНИЕ: используем мок-авторизацию из-за проблем с Cloud Provider (402)
    // TODO: восстановить нормальную авторизацию после решения проблемы с биллингом
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // имитация задержки
      
      const mockToken = 'admin_token_' + Date.now();
      const mockAdmin = {
        id: 'admin-1',
        email: loginData.email,
        full_name: loginData.full_name || 'Администратор'
      };

      toast({
        title: isRegisterMode ? 'Регистрация успешна' : 'Вход выполнен',
        description: `Добро пожаловать, ${mockAdmin.full_name}!`
      });

      onSuccess(mockToken, mockAdmin);
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-black p-4">
      <Card className="w-full max-w-md bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl text-gray-900 dark:text-white">
                <Icon name="ShieldCheck" size={24} />
                Админ-панель ГрузКлик
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                {isRegisterMode ? 'Создайте учетную запись администратора' : 'Защищенный вход для администраторов'}
              </CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleTheme}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <Icon name={theme === 'dark' ? 'Sun' : 'Moon'} size={20} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isRegisterMode && (
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-gray-900 dark:text-gray-100">Полное имя</Label>
              <Input
                id="fullName"
                placeholder="Иван Иванов"
                value={loginData.full_name}
                onChange={(e) => setLoginData({...loginData, full_name: e.target.value})}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-900 dark:text-gray-100">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={loginData.email}
              onChange={(e) => setLoginData({...loginData, email: e.target.value})}
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-900 dark:text-gray-100">Пароль</Label>
            <div className="relative">
              <Input
                id="password"
                type={showLoginPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                className="pr-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Icon name={showLoginPassword ? 'EyeOff' : 'Eye'} size={20} />
              </button>
            </div>
          </div>

          <Button 
            className="w-full" 
            onClick={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <>
                <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                Загрузка...
              </>
            ) : (
              isRegisterMode ? 'Зарегистрироваться' : 'Войти'
            )}
          </Button>

          {!isRegisterMode && (
            <div className="mt-6">
              <FaceIDAuth 
                mode="login" 
                onSuccess={() => {
                  const mockToken = 'face_id_admin_token_' + Date.now();
                  const mockAdmin = {
                    id: 'admin-1',
                    email: 'admin@gruzclick.ru',
                    full_name: 'Администратор'
                  };
                  onSuccess(mockToken, mockAdmin);
                }}
              />
            </div>
          )}

          {!isRegisterMode && biometricAvailable && (
            <Button
              variant="outline"
              className="w-full border-blue-500 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              onClick={handleBiometricLogin}
              disabled={loading}
            >
              <Icon name="Fingerprint" size={18} className="mr-2" />
              Войти по биометрии
            </Button>
          )}

          {!isRegisterMode && (
            <Button
              variant="link"
              className="w-full text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300"
              onClick={onShowForgotPassword}
            >
              Забыли пароль?
            </Button>
          )}

          <div className="text-center text-sm">
            <button
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setLoginData({ email: '', password: '', full_name: '' });
              }}
              className="text-blue-500 dark:text-blue-400 hover:underline"
            >
              {isRegisterMode ? 'Уже есть аккаунт? Войти' : 'Создать учетную запись'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};