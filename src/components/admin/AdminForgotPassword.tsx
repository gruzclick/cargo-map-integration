import { useState } from 'react';
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
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState<'email' | 'code' | 'password'>('email');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Icon name="ShieldCheck" size={24} />
            Восстановление пароля
          </CardTitle>
          <CardDescription>
            Сброс пароля администратора
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
                />
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
                <Label htmlFor="resetCode">Код из письма</Label>
                <Input
                  id="resetCode"
                  placeholder="123456"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  maxLength={6}
                />
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
                <Label htmlFor="newPassword">Новый пароль</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
            className="w-full"
            onClick={onBack}
          >
            Назад к входу
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
