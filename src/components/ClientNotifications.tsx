import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import Icon from './ui/icon';
import { useToast } from './ui/use-toast';

interface Notification {
  id: string;
  driver_name: string;
  driver_phone: string;
  vehicle: string;
  warehouse: string;
  arrival_time: string;
  delivery_date: string;
  message: string;
  created_at: string;
}

export default function ClientNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();
  const userId = localStorage.getItem('userId') || '';

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`https://functions.poehali.dev/b388f085-faa7-4aab-88a5-b45708b116eb?user_id=${userId}&action=get_client_notifications`);
      const data = await response.json();
      
      if (data.notifications && data.notifications.length > notifications.length) {
        toast({
          title: 'Новое уведомление!',
          description: 'Водитель едет на ваш склад'
        });
      }
      
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('https://functions.poehali.dev/b388f085-faa7-4aab-88a5-b45708b116eb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mark_notification_read',
          user_id: userId,
          notification_id: notificationId
        })
      });
      
      setNotifications(notifications.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <Card key={notification.id} className="p-4 bg-blue-500/10 border-blue-500/30">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Icon name="Bell" size={20} className="text-blue-400" />
            </div>
            
            <div className="flex-1">
              <p className="font-semibold text-blue-400 mb-1">
                Водитель едет на ваш склад!
              </p>
              <p className="text-sm mb-2">{notification.message}</p>
              
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Icon name="User" size={14} />
                  <span>{notification.driver_name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon name="Phone" size={14} />
                  <span>{notification.driver_phone}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon name="Truck" size={14} />
                  <span>{notification.vehicle}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon name="Clock" size={14} />
                  <span>{notification.arrival_time}</span>
                </div>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => markAsRead(notification.id)}
              className="flex-shrink-0"
            >
              <Icon name="X" size={18} />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
