import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { usePWA } from '@/hooks/usePWA';
import { useToast } from '@/hooks/use-toast';

const NotificationSettings = () => {
  const { requestNotificationPermission } = usePWA();
  const { toast } = useToast();
  const [notificationStatus, setNotificationStatus] = useState<'default' | 'granted' | 'denied'>('default');
  const [isExpanded, setIsExpanded] = useState(false);
  const [notifications, setNotifications] = useState({
    nearbyOrders: true,
    nearbyDrivers: true,
    chatMessages: true,
    statusUpdates: true,
    newReviews: true,
    priceChanges: true,
  });

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationStatus(Notification.permission);
    }
    
    // Load saved notification preferences or use defaults (all true)
    const saved = localStorage.getItem('notification_preferences');
    if (saved) {
      setNotifications(JSON.parse(saved));
    }
  }, []);

  const handleToggleNotification = (key: keyof typeof notifications) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    localStorage.setItem('notification_preferences', JSON.stringify(updated));
    toast({
      title: 'Настройки сохранены',
      description: `Уведомления ${!notifications[key] ? 'включены' : 'отключены'}`,
    });
  };

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
    <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-white/30 dark:border-gray-700/30">
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

        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Настройте типы уведомлений
            </h4>
            <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          
          {isExpanded && (
            <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <div className="flex-1">
                <Label htmlFor="nearby-orders" className="text-sm font-medium cursor-pointer">
                  Новые грузы в радиусе (50 км)
                </Label>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  Получайте уведомления о заказах поблизости
                </p>
              </div>
              <Switch
                id="nearby-orders"
                checked={notifications.nearbyOrders}
                onCheckedChange={() => handleToggleNotification('nearbyOrders')}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <div className="flex-1">
                <Label htmlFor="nearby-drivers" className="text-sm font-medium cursor-pointer">
                  Водители поблизости
                </Label>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  Уведомления о свободных водителях рядом с грузом
                </p>
              </div>
              <Switch
                id="nearby-drivers"
                checked={notifications.nearbyDrivers}
                onCheckedChange={() => handleToggleNotification('nearbyDrivers')}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <div className="flex-1">
                <Label htmlFor="chat-messages" className="text-sm font-medium cursor-pointer">
                  Сообщения в чате
                </Label>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  Новые сообщения от клиентов и водителей
                </p>
              </div>
              <Switch
                id="chat-messages"
                checked={notifications.chatMessages}
                onCheckedChange={() => handleToggleNotification('chatMessages')}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <div className="flex-1">
                <Label htmlFor="status-updates" className="text-sm font-medium cursor-pointer">
                  Изменение статуса доставки
                </Label>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  Обновления по текущим заказам
                </p>
              </div>
              <Switch
                id="status-updates"
                checked={notifications.statusUpdates}
                onCheckedChange={() => handleToggleNotification('statusUpdates')}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <div className="flex-1">
                <Label htmlFor="new-reviews" className="text-sm font-medium cursor-pointer">
                  Новые отзывы
                </Label>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  Когда кто-то оставил вам отзыв или оценку
                </p>
              </div>
              <Switch
                id="new-reviews"
                checked={notifications.newReviews}
                onCheckedChange={() => handleToggleNotification('newReviews')}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <div className="flex-1">
                <Label htmlFor="price-changes" className="text-sm font-medium cursor-pointer">
                  Изменения цен
                </Label>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  Уведомления о конкурентных предложениях
                </p>
              </div>
              <Switch
                id="price-changes"
                checked={notifications.priceChanges}
                onCheckedChange={() => handleToggleNotification('priceChanges')}
              />
            </div>
          </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;