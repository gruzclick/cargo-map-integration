import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { secureLocalStorage } from '@/utils/security';

export default function TelegramVerification() {
  const { toast } = useToast();
  const [telegramUsername, setTelegramUsername] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  const sendCode = async () => {
    if (!telegramUsername.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите ваш Telegram username',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const user = JSON.parse(secureLocalStorage.get('user') || '{}');
      const phone = user.phone || secureLocalStorage.get('phone');

      const response = await fetch('https://functions.poehali.dev/60a1cff5-ff31-4b02-9d6a-83f52d5254e2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_code',
          telegram_username: telegramUsername,
          phone
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка отправки кода');
      }

      setCodeSent(true);
      toast({
        title: 'Код отправлен',
        description: `Проверьте сообщения в Telegram ${telegramUsername}`,
        duration: 5000
      });

      if (data.code_for_demo) {
        toast({
          title: 'Демо-код',
          description: `Для теста используйте код: ${data.code_for_demo}`,
          duration: 10000
        });
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось отправить код',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!code.trim() || code.length !== 6) {
      toast({
        title: 'Ошибка',
        description: 'Введите 6-значный код',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const user = JSON.parse(secureLocalStorage.get('user') || '{}');
      const phone = user.phone || secureLocalStorage.get('phone');

      const response = await fetch('https://functions.poehali.dev/60a1cff5-ff31-4b02-9d6a-83f52d5254e2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_code',
          phone,
          code
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Неверный код');
      }

      setVerified(true);
      toast({
        title: 'Telegram подтверждён',
        description: 'Теперь вы будете получать уведомления в Telegram'
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось подтвердить код',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (verified) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <Icon name="CheckCircle2" size={24} className="text-green-600 dark:text-green-400" />
          <div className="flex-1">
            <p className="font-medium text-green-900 dark:text-green-100">Telegram подтверждён</p>
            <p className="text-sm text-green-700 dark:text-green-300">@{telegramUsername}</p>
          </div>
        </div>
        <Button
          onClick={() => {
            setVerified(false);
            setTelegramUsername('');
            setCode('');
            setCodeSent(false);
            localStorage.removeItem('telegram_verified');
          }}
          variant="outline"
          className="w-full"
        >
          <Icon name="RefreshCw" size={18} className="mr-2" />
          Изменить Telegram
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Telegram username</label>
        <div className="flex gap-2">
          <Input
            value={telegramUsername}
            onChange={(e) => setTelegramUsername(e.target.value)}
            placeholder="@username"
            disabled={codeSent}
            className="flex-1"
          />
          <Button onClick={sendCode} disabled={loading || codeSent}>
            {loading ? (
              <Icon name="Loader2" size={18} className="animate-spin" />
            ) : codeSent ? (
              'Код отправлен'
            ) : (
              'Отправить код'
            )}
          </Button>
        </div>
      </div>

      {codeSent && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Код из Telegram</label>
          <div className="flex gap-2">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              maxLength={6}
              className="flex-1"
            />
            <Button onClick={verifyCode} disabled={loading || code.length !== 6}>
              {loading ? (
                <Icon name="Loader2" size={18} className="animate-spin" />
              ) : (
                'Подтвердить'
              )}
            </Button>
          </div>
          <button
            onClick={() => {
              setCodeSent(false);
              setCode('');
            }}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            Отправить код повторно
          </button>
        </div>
      )}
    </div>
  );
}