import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Notification } from '@/types/order';
import { getNotifications, markNotificationRead, saveOrder, getOrders } from '@/utils/orderStorage';

interface NotificationsPanelProps {
  userId: string;
  userName: string;
}

export const NotificationsPanel = ({ userId, userName }: NotificationsPanelProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const loadNotifications = () => {
    const userNotifs = getNotifications(userId);
    const active = userNotifs.filter(n => {
      if (n.expiresAt && new Date(n.expiresAt) < new Date()) {
        return false;
      }
      return true;
    });
    
    setNotifications(active);
    setUnreadCount(active.filter(n => !n.read).length);
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 3000);
    return () => clearInterval(interval);
  }, [userId]);

  const handleConfirmCarrier = (notif: Notification, acceptedUserId: string) => {
    const orders = getOrders();
    const order = orders.find(o => o.id === notif.orderId);
    
    if (!order) return;

    const updatedOrder = {
      ...order,
      status: 'in-progress' as const,
      confirmedCarrier: {
        userId: acceptedUserId,
        userName: userName,
        confirmedAt: new Date().toISOString()
      },
      updatedAt: new Date().toISOString()
    };

    saveOrder(updatedOrder);
    markNotificationRead(notif.id);
    loadNotifications();
  };

  const handleRejectCarrier = (notif: Notification) => {
    markNotificationRead(notif.id);
    loadNotifications();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-20 right-4 z-30 bg-white dark:bg-gray-800 shadow-lg rounded-full p-3 hover:shadow-xl transition-all"
      >
        <Icon name="Bell" size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed top-32 right-4 z-40 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border max-h-[70vh] overflow-hidden flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-bold text-lg">Уведомления</h3>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <Icon name="X" size={20} />
            </Button>
          </div>

          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Icon name="Inbox" size={48} className="mx-auto mb-3 opacity-50" />
                <p>Нет уведомлений</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`p-4 ${notif.read ? 'bg-gray-50 dark:bg-gray-800' : 'bg-blue-50 dark:bg-blue-900/20'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        notif.type === 'order-accepted' ? 'bg-green-100 text-green-600' :
                        notif.type === 'order-confirmed' ? 'bg-blue-100 text-blue-600' :
                        notif.type === 'order-completed' ? 'bg-purple-100 text-purple-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        <Icon name="Bell" size={16} />
                      </div>
                      
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-1">{notif.message}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(notif.createdAt).toLocaleString('ru-RU')}
                        </p>

                        {notif.type === 'order-accepted' && !notif.read && notif.expiresAt && (
                          <div className="mt-3 space-y-2">
                            <p className="text-xs text-gray-600">
                              Истекает через: {Math.round((new Date(notif.expiresAt).getTime() - Date.now()) / 60000)} мин
                            </p>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                className="flex-1"
                                onClick={() => handleConfirmCarrier(notif, 'acceptedUserId')}
                              >
                                Подтвердить
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectCarrier(notif)}
                              >
                                Отклонить
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
