import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface NotificationData {
  type: 'order_request' | 'order_confirmed' | 'order_rejected' | 'driver_arrived' | 'delivery_completed';
  orderId: string;
  driverName?: string;
  clientName?: string;
  route?: string;
  timestamp: number;
  expiresAt?: number;
}

interface PushNotificationManagerProps {
  userId: string;
  userType: 'client' | 'carrier';
  onOrderConfirmation?: (orderId: string, action: 'confirm' | 'reject') => void;
}

const PushNotificationManager = ({ userId, userType, onOrderConfirmation }: PushNotificationManagerProps) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [activeOrderRequest, setActiveOrderRequest] = useState<NotificationData | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const eventSource = new EventSource(`https://functions.poehali.dev/notifications?userId=${userId}`);
    
    eventSource.onmessage = (event) => {
      const notification: NotificationData = JSON.parse(event.data);
      handleNotification(notification);
    };

    return () => {
      eventSource.close();
    };
  }, [userId]);

  useEffect(() => {
    if (activeOrderRequest && activeOrderRequest.expiresAt) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, Math.floor((activeOrderRequest.expiresAt! - Date.now()) / 1000));
        setTimeLeft(remaining);
        
        if (remaining === 0) {
          handleOrderResponse('reject');
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [activeOrderRequest]);

  const handleNotification = (notification: NotificationData) => {
    setNotifications(prev => [...prev, notification]);

    if (notification.type === 'order_request' && userType === 'client') {
      setActiveOrderRequest(notification);
      setTimeLeft(900);
      
      toast.custom(() => (
        <Card className="p-4 bg-white dark:bg-gray-800 border-2 border-primary shadow-xl">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Icon name="Truck" size={20} className="text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1">Новый запрос на перевозку</h4>
              <p className="text-xs text-muted-foreground mb-3">
                {notification.driverName} хочет взять ваш заказ: {notification.route}
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-400 mb-3">
                Время на ответ: 15 минут
              </p>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleOrderResponse('confirm')} className="flex-1">
                  Подтвердить
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleOrderResponse('reject')} className="flex-1">
                  В ожидании
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ), { duration: Infinity });
    }

    if (notification.type === 'order_confirmed' && userType === 'carrier') {
      toast.success(`Клиент подтвердил заказ: ${notification.route}`, {
        description: 'Можете начинать доставку',
        icon: <Icon name="Check" size={20} />,
      });
    }

    if (notification.type === 'order_rejected' && userType === 'carrier') {
      toast.info(`Клиент отклонил запрос: ${notification.route}`, {
        description: 'Заказ остаётся доступным для других перевозчиков',
        icon: <Icon name="Clock" size={20} />,
      });
    }

    if (notification.type === 'driver_arrived') {
      toast.info('Водитель прибыл на склад', {
        description: `${notification.driverName} прибыл для загрузки груза`,
        icon: <Icon name="MapPin" size={20} />,
      });
    }

    if (notification.type === 'delivery_completed') {
      toast.success('Доставка завершена', {
        description: 'Груз успешно доставлен и сдан на складе',
        icon: <Icon name="Package" size={20} />,
      });
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(getNotificationTitle(notification), {
        body: getNotificationBody(notification),
        icon: '/icon.png',
        tag: notification.orderId,
      });
    }
  };

  const handleOrderResponse = (action: 'confirm' | 'reject') => {
    if (!activeOrderRequest) return;

    onOrderConfirmation?.(activeOrderRequest.orderId, action);
    setActiveOrderRequest(null);
    setTimeLeft(0);
    toast.dismiss();
  };

  const getNotificationTitle = (notification: NotificationData): string => {
    switch (notification.type) {
      case 'order_request':
        return 'Новый запрос на перевозку';
      case 'order_confirmed':
        return 'Заказ подтверждён';
      case 'order_rejected':
        return 'Заказ отклонён';
      case 'driver_arrived':
        return 'Водитель прибыл';
      case 'delivery_completed':
        return 'Доставка завершена';
      default:
        return 'Уведомление';
    }
  };

  const getNotificationBody = (notification: NotificationData): string => {
    switch (notification.type) {
      case 'order_request':
        return `${notification.driverName} хочет взять заказ: ${notification.route}`;
      case 'order_confirmed':
        return `Клиент подтвердил заказ: ${notification.route}`;
      case 'order_rejected':
        return `Клиент отклонил запрос: ${notification.route}`;
      case 'driver_arrived':
        return `${notification.driverName} прибыл на склад`;
      case 'delivery_completed':
        return 'Груз успешно доставлен';
      default:
        return '';
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (activeOrderRequest && userType === 'client') {
    return (
      <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right">
        <Card className="p-4 bg-white dark:bg-gray-800 border-2 border-primary shadow-2xl w-80">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Icon name="Truck" size={24} className="text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1">Новый запрос на перевозку</h4>
              <p className="text-sm text-muted-foreground mb-2">
                {activeOrderRequest.driverName} хочет взять ваш заказ
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                {activeOrderRequest.route}
              </p>
              <div className="bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 text-xs font-medium px-2 py-1 rounded mb-3 text-center">
                Время на ответ: {formatTime(timeLeft)}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleOrderResponse('confirm')} className="flex-1">
                  Подтвердить
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleOrderResponse('reject')} className="flex-1">
                  В ожидании
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return null;
};

export default PushNotificationManager;
