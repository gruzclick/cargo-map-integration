import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface TelegramLoginButtonProps {
  onSuccess: (userData: any, telegramData: any) => void;
  onPendingRegistration: (telegramData: any) => void;
}

const TelegramLoginButton = ({ onSuccess, onPendingRegistration }: TelegramLoginButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const { toast } = useToast();

  // Polling для проверки подтверждения
  useEffect(() => {
    if (!sessionToken || !polling) return;

    const checkSession = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/65fdf841-ac48-4f1e-aff3-1b6c810838cc', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_token: sessionToken })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setPolling(false);
          
          if (data.user_exists && data.user) {
            // Пользователь существует - входим
            toast({
              title: 'Вход выполнен!',
              description: `Добро пожаловать, ${data.user.full_name}!`
            });
            onSuccess(data.user, data.telegram_data);
          } else {
            // Новый пользователь - показываем форму регистрации
            toast({
              title: 'Почти готово!',
              description: 'Заполните дополнительную информацию для завершения регистрации'
            });
            onPendingRegistration(data.telegram_data);
          }
        } else if (response.status === 202) {
          // Ждём подтверждения
          console.log('[DEBUG] Waiting for user confirmation...');
        } else {
          // Ошибка или истёк срок
          setPolling(false);
          setLoading(false);
          toast({
            variant: 'destructive',
            title: 'Ошибка',
            description: data.error || 'Время ожидания истекло'
          });
        }
      } catch (error: any) {
        console.error('Polling error:', error);
      }
    };

    const interval = setInterval(checkSession, 2000); // Проверяем каждые 2 секунды

    return () => clearInterval(interval);
  }, [sessionToken, polling, onSuccess, onPendingRegistration, toast]);

  const handleTelegramLogin = async () => {
    setLoading(true);

    try {
      // Создаём сессию авторизации
      const response = await fetch('https://functions.poehali.dev/f6014b74-431e-4d03-9e6e-e27621c39bf5', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Не удалось создать сессию');
      }

      const data = await response.json();

      if (data.success && data.bot_link) {
        setSessionToken(data.session_token);
        setPolling(true);

        // Открываем бота в новой вкладке
        window.open(data.bot_link, '_blank');

        toast({
          title: 'Подтвердите вход в Telegram',
          description: 'Перейдите в Telegram и нажмите кнопку подтверждения',
          duration: 10000
        });
      } else {
        throw new Error('Некорректный ответ сервера');
      }
    } catch (error: any) {
      console.error('Telegram login error:', error);
      setLoading(false);
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error.message
      });
    }
  };

  const handleCancel = () => {
    setPolling(false);
    setLoading(false);
    setSessionToken(null);
    toast({
      title: 'Отменено',
      description: 'Вход через Telegram отменён'
    });
  };

  if (polling) {
    return (
      <div className="flex flex-col items-center gap-4 p-6 border-2 border-blue-500 rounded-xl bg-blue-50 dark:bg-blue-900/20">
        <div className="flex items-center gap-3">
          <div className="animate-spin">
            <Icon name="RefreshCw" size={24} className="text-blue-600" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-blue-900 dark:text-blue-100">
              Ожидание подтверждения...
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Подтвердите вход в Telegram боте
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          className="w-full"
        >
          Отменить
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleTelegramLogin}
      disabled={loading}
      className="w-full bg-[#0088cc] hover:bg-[#006699] text-white py-6 text-lg font-semibold"
      size="lg"
    >
      <Icon name="MessageCircle" size={24} className="mr-2" />
      {loading ? 'Загрузка...' : 'Войти через Telegram'}
    </Button>
  );
};

export default TelegramLoginButton;
