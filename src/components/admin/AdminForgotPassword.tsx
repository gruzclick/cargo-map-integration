import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface AdminForgotPasswordProps {
  onBack: () => void;
}

export const AdminForgotPassword = ({ onBack }: AdminForgotPasswordProps) => {
  const { toast } = useToast();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState<'email' | 'code' | 'password'>('email');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendMethod, setSendMethod] = useState<'email' | 'telegram' | 'both'>('email');

  useEffect(() => {
    const savedTheme = localStorage.getItem('admin_theme') as 'light' | 'dark' || 'dark';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('admin_theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
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
            email: resetEmail,
            method: sendMethod
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Ошибка отправки кода');
        }

        const methodText = sendMethod === 'email' ? 'email' : sendMethod === 'telegram' ? 'Telegram' : 'email и Telegram';
        toast({
          title: 'Код отправлен',
          description: `Код восстановления отправлен через ${methodText}`
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
        
        setResetStep('email');
        setResetEmail('');
        setResetCode('');
        setNewPassword('');
        onBack();
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-black p-4">
      <Card className="w-full max-w-md bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl text-gray-900 dark:text-white">
                <Icon name="ShieldCheck" size={24} />
                Восстановление пароля
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Сброс пароля администратора
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
          {resetStep === 'email' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="resetEmail" className="text-gray-900 dark:text-gray-100">Email администратора</Label>
                <Input
                  id="resetEmail"
                  type="email"
                  placeholder="admin@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-900 dark:text-gray-100">Способ отправки кода</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={sendMethod === 'email' ? 'default' : 'outline'}
                    onClick={() => setSendMethod('email')}
                    className="flex items-center gap-2"
                  >
                    <Icon name="Mail" size={16} />
                    Email
                  </Button>
                  <Button
                    type="button"
                    variant={sendMethod === 'telegram' ? 'default' : 'outline'}
                    onClick={() => setSendMethod('telegram')}
                    className="flex items-center gap-2"
                  >
                    <Icon name="Send" size={16} />
                    Telegram
                  </Button>
                  <Button
                    type="button"
                    variant={sendMethod === 'both' ? 'default' : 'outline'}
                    onClick={() => setSendMethod('both')}
                    className="flex items-center gap-2"
                  >
                    <Icon name="Zap" size={16} />
                    Оба
                  </Button>
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={handleForgotPassword}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  'Отправить код'
                )}
              </Button>
            </>
          )}

          {resetStep === 'code' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="resetCode" className="text-gray-900 dark:text-gray-100">
                  Код подтверждения
                </Label>
                <Input
                  id="resetCode"
                  placeholder="123456"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  maxLength={6}
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {sendMethod === 'email' && 'Проверьте email'}
                  {sendMethod === 'telegram' && 'Проверьте Telegram'}
                  {sendMethod === 'both' && 'Проверьте email или Telegram'}
                </p>
              </div>
              <Button 
                className="w-full" 
                onClick={handleForgotPassword}
              >
                Подтвердить код
              </Button>
            </>
          )}

          {resetStep === 'password' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-gray-900 dark:text-gray-100">Новый пароль</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <Icon name={showNewPassword ? 'EyeOff' : 'Eye'} size={20} />
                  </button>
                </div>
              </div>
              <Button 
                className="w-full" 
                onClick={handleForgotPassword}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  'Изменить пароль'
                )}
              </Button>
            </>
          )}

          <Button
            variant="outline"
            className="w-full border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
            onClick={onBack}
          >
            Назад к входу
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};