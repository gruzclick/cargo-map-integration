/**
 * Компонент авторизации через Telegram
 * 
 * Назначение: Выполняет вход/регистрацию пользователя через Telegram username
 * 
 * Флоу:
 * 1. Пользователь вводит Telegram username
 * 2. Система отправляет 6-значный код через Telegram бота
 * 3. Backend определяет: это вход или регистрация
 * 4. Пользователь вводит код
 * 5. При успехе: создаётся токен, сохраняются данные пользователя
 * 
 * Особенности:
 * - Автоматическое определение входа/регистрации
 * - Разные сообщения для новых и существующих пользователей
 * - Показ демо-кода, если Telegram бот не настроен
 * - Опциональные поля: телефон и имя
 * 
 * Используется в: Auth.tsx при выборе Telegram метода
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { secureLocalStorage } from '@/utils/security';
import { BACKEND_URLS } from '@/utils/backend';

interface TelegramAuthProps {
  onSuccess: (userData: any) => void;
  onBack: () => void;
}

const TelegramAuth = ({ onSuccess, onBack }: TelegramAuthProps) => {
  const [step, setStep] = useState<'username' | 'code'>('username');
  const [loading, setLoading] = useState(false);
  const [telegramUsername, setTelegramUsername] = useState('');
  const [code, setCode] = useState('');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const { toast } = useToast();

  const sendCode = async () => {
    if (!telegramUsername) {
      toast({
        variant: 'destructive',
        title: 'Укажите Telegram username'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(BACKEND_URLS.TELEGRAM_REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_code',
          telegram_username: telegramUsername,
          phone: phone || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Не удалось отправить код');
      }

      const actionText = data.is_login ? 'входа' : 'регистрации';
      
      if (data.bot_configured) {
        toast({
          title: 'Код отправлен!',
          description: `Проверьте Telegram @${telegramUsername}. ${data.is_login ? 'Добро пожаловать снова!' : 'Новая регистрация'}`
        });
      } else {
        toast({
          title: 'Демо-режим',
          description: (
            <div className="space-y-2">
              <p>Telegram бот не настроен. Код для входа: <strong>{data.code_for_demo}</strong></p>
              <a href="/setup/telegram-bot" className="text-blue-500 underline text-sm">
                Настроить бота сейчас →
              </a>
            </div>
          ) as any,
          variant: 'default',
          duration: 10000
        });
      }

      setStep('code');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!code || code.length !== 6) {
      toast({
        variant: 'destructive',
        title: 'Введите 6-значный код'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(BACKEND_URLS.TELEGRAM_REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_code',
          telegram_username: telegramUsername,
          code: code,
          phone: phone || undefined,
          full_name: fullName || telegramUsername
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Неверный код');
      }

      const mockToken = btoa(JSON.stringify({ userId: data.user.user_id, exp: Date.now() + 86400000 }));

      secureLocalStorage.set('auth_token', mockToken);
      secureLocalStorage.set('user_data', JSON.stringify(data.user));

      const successTitle = data.is_login ? 'Вход выполнен!' : 'Регистрация успешна!';
      const successDescription = data.is_login ? 'С возвращением!' : 'Добро пожаловать!';
      
      toast({
        title: successTitle,
        description: successDescription
      });

      onSuccess(data.user);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <div>
            <CardTitle className="flex items-center gap-2">
              <Icon name="MessageCircle" size={24} className="text-blue-500" />
              Telegram вход
            </CardTitle>
            <CardDescription>
              {step === 'username' ? 'Введите ваш Telegram username' : 'Введите код из Telegram'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 'username' ? (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Telegram username *</label>
              <Input
                value={telegramUsername}
                onChange={(e) => setTelegramUsername(e.target.value)}
                placeholder="@username"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Убедитесь, что у вас открыт Telegram
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Телефон (необязательно)</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 900 123 45 67"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Имя (необязательно)</label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Иван Иванов"
                disabled={loading}
              />
            </div>

            <Button 
              onClick={sendCode} 
              disabled={loading || !telegramUsername}
              className="w-full"
            >
              {loading ? (
                <Icon name="Loader2" size={18} className="animate-spin mr-2" />
              ) : (
                <Icon name="Send" size={18} className="mr-2" />
              )}
              Отправить код
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Код подтверждения</label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                maxLength={6}
                disabled={loading}
                className="text-center text-2xl tracking-widest"
              />
              <p className="text-xs text-muted-foreground">
                Введите 6-значный код из Telegram
              </p>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => setStep('username')} 
                variant="outline"
                disabled={loading}
                className="flex-1"
              >
                Назад
              </Button>
              <Button 
                onClick={verifyCode} 
                disabled={loading || code.length !== 6}
                className="flex-1"
              >
                {loading ? (
                  <Icon name="Loader2" size={18} className="animate-spin mr-2" />
                ) : (
                  <Icon name="CheckCircle2" size={18} className="mr-2" />
                )}
                Подтвердить
              </Button>
            </div>
          </>
        )}

        <div className="text-center text-sm text-muted-foreground">
          <p>Регистрируясь, вы соглашаетесь с условиями использования и политикой конфиденциальности</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TelegramAuth;