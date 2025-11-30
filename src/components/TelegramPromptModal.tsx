import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { secureLocalStorage } from '@/utils/security';

interface TelegramPromptModalProps {
  user: any;
  onComplete: () => void;
}

export default function TelegramPromptModal({ user, onComplete }: TelegramPromptModalProps) {
  const { toast } = useToast();
  const [telegramUsername, setTelegramUsername] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'prompt' | 'verify'>('prompt');

  const skipSetup = () => {
    localStorage.setItem('telegram_prompt_skipped', 'true');
    onComplete();
  };

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
      const response = await fetch('https://functions.poehali.dev/60a1cff5-ff31-4b02-9d6a-83f52d5254e2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_code',
          telegram_username: telegramUsername,
          user_id: user.user_id || user.id,
          phone: user.phone
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка отправки кода');
      }

      setCodeSent(true);
      setStep('verify');
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
      const response = await fetch('https://functions.poehali.dev/60a1cff5-ff31-4b02-9d6a-83f52d5254e2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_code',
          user_id: user.user_id || user.id,
          phone: user.phone,
          code
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Неверный код');
      }

      localStorage.setItem('telegram_verified', 'true');
      toast({
        title: 'Telegram подтверждён',
        description: 'Теперь вы будете получать уведомления в Telegram'
      });

      onComplete();
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

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#212e3a] rounded-2xl max-w-md w-full p-6 space-y-6 relative">
        <button
          onClick={skipSetup}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label="Закрыть"
        >
          <Icon name="X" size={24} />
        </button>

        {step === 'prompt' && (
          <>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
                <Icon name="MessageCircle" size={32} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Подключите Telegram
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Получайте мгновенные уведомления о новых заказах и сообщениях прямо в Telegram
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ваш Telegram username
                </label>
                <Input
                  value={telegramUsername}
                  onChange={(e) => setTelegramUsername(e.target.value)}
                  placeholder="@username"
                  className="text-base"
                />
              </div>

              <Button
                onClick={sendCode}
                disabled={loading || !telegramUsername.trim()}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Icon name="Loader2" size={18} className="animate-spin mr-2" />
                    Отправка...
                  </>
                ) : (
                  <>
                    <Icon name="Send" size={18} className="mr-2" />
                    Получить код подтверждения
                  </>
                )}
              </Button>

              <Button
                onClick={skipSetup}
                variant="ghost"
                className="w-full"
              >
                Пропустить
              </Button>
            </div>
          </>
        )}

        {step === 'verify' && (
          <>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                <Icon name="Lock" size={32} className="text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Введите код
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Код был отправлен в Telegram {telegramUsername}
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Код подтверждения
                </label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                  className="text-center text-2xl font-bold tracking-widest"
                />
              </div>

              <Button
                onClick={verifyCode}
                disabled={loading || code.length !== 6}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Icon name="Loader2" size={18} className="animate-spin mr-2" />
                    Проверка...
                  </>
                ) : (
                  <>
                    <Icon name="CheckCircle2" size={18} className="mr-2" />
                    Подтвердить
                  </>
                )}
              </Button>

              <button
                onClick={() => {
                  setStep('prompt');
                  setCodeSent(false);
                  setCode('');
                }}
                className="w-full text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Отправить код повторно
              </button>

              <Button
                onClick={skipSetup}
                variant="ghost"
                className="w-full"
              >
                Пропустить
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
