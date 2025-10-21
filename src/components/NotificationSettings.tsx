import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { usePWA } from '@/hooks/usePWA';

const NotificationSettings = () => {
  const { requestNotificationPermission } = usePWA();
  const [notificationStatus, setNotificationStatus] = useState<'default' | 'granted' | 'denied'>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationStatus(Notification.permission);
    }
  }, []);

  const handleEnableNotifications = async () => {
    const permission = await requestNotificationPermission();
    setNotificationStatus(permission);
    
    if (permission === 'granted') {
      new Notification('🚛 Груз Клик', {
        body: 'Уведомления успешно включены! Вы будете получать оповещения о новых заказах.',
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        vibrate: [200, 100, 200]
      });
    }
  };

  return (
    <Card className="border border-gray-200/50 dark:border-gray-700/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Bell" size={20} />
          Push-уведомления
        </CardTitle>
        <CardDescription>
          Получайте мгновенные уведомления о новых грузах и водителях рядом с вами
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {notificationStatus === 'granted' && (
          <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <Icon name="CheckCircle2" size={20} className="text-green-600 dark:text-green-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                Уведомления включены
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                Вы будете получать оповещения о новых возможностях
              </p>
            </div>
          </div>
        )}

        {notificationStatus === 'denied' && (
          <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <Icon name="XCircle" size={20} className="text-red-600 dark:text-red-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900 dark:text-red-100">
                Уведомления заблокированы
              </p>
              <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                Разрешите уведомления в настройках браузера
              </p>
            </div>
          </div>
        )}

        {notificationStatus === 'default' && (
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <Icon name="Info" size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Включите уведомления
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Не пропускайте новые заказы рядом с вами
                </p>
              </div>
            </div>
            <Button 
              onClick={handleEnableNotifications} 
              className="w-full animate-pulse"
            >
              <Icon name="Bell" size={18} className="mr-2" />
              Включить уведомления
            </Button>
          </div>
        )}

        <div className="space-y-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Вы будете получать уведомления о:
          </h4>
          <ul className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <Icon name="Check" size={14} className="text-green-600 dark:text-green-400 mt-0.5" />
              <span>Новых грузах в вашем радиусе (50 км)</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="Check" size={14} className="text-green-600 dark:text-green-400 mt-0.5" />
              <span>Водителях поблизости от вашего груза</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="Check" size={14} className="text-green-600 dark:text-green-400 mt-0.5" />
              <span>Сообщениях в чате с клиентами/водителями</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="Check" size={14} className="text-green-600 dark:text-green-400 mt-0.5" />
              <span>Изменении статуса доставки</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
