import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface AdminLoginFormProps {
  onSuccess: (token: string, admin: any) => void;
  onShowForgotPassword: () => void;
}

export const AdminLoginForm = ({ onSuccess, onShowForgotPassword }: AdminLoginFormProps) => {
  const { toast } = useToast();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loginData, setLoginData] = useState({ 
    email: '', 
    password: '', 
    full_name: ''
  });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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

      toast({
        title: isRegisterMode ? 'Регистрация успешна' : 'Вход выполнен',
        description: `Добро пожаловать, ${data.admin.full_name}!`
      });

      onSuccess(data.token, data.admin);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Icon name="ShieldCheck" size={24} />
            Админ-панель ГрузКлик
          </CardTitle>
          <CardDescription>
            {isRegisterMode ? 'Создайте учетную запись администратора' : 'Защищенный вход для администраторов'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isRegisterMode && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Полное имя</Label>
              <Input
                id="fullName"
                placeholder="Иван Иванов"
                value={loginData.full_name}
                onChange={(e) => setLoginData({...loginData, full_name: e.target.value})}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={loginData.email}
              onChange={(e) => setLoginData({...loginData, email: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <div className="relative">
              <Input
                id="password"
                type={showLoginPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
            <Button
              variant="link"
              className="w-full"
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
              className="text-blue-500 hover:underline"
            >
              {isRegisterMode ? 'Уже есть аккаунт? Войти' : 'Создать учетную запись'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
