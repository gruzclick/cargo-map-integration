import { useEffect } from 'react';
import { useToast } from './ui/use-toast';

interface PushNotificationsProps {
  userId: string;
  userType: 'client' | 'carrier';
}

export default function PushNotifications({ userId, userType }: PushNotificationsProps) {
  const { toast } = useToast();

  useEffect(() => {
    requestNotificationPermission();
    subscribeToNotifications();
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      console.log('Browser does not support notifications');
      return;
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast({
          title: 'Уведомления включены',
          description: 'Вы будете получать важные обновления'
        });
      }
    }
  };

  const subscribeToNotifications = () => {
    const eventSource = new EventSource(
      `https://functions.poehali.dev/b388f085-faa7-4aab-88a5-b45708b116eb?user_id=${userId}&action=subscribe_notifications`
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (Notification.permission === 'granted') {
        new Notification(data.title, {
          body: data.message,
          icon: '/icon.png',
          badge: '/badge.png',
          tag: data.id,
          requireInteraction: true
        });
      }

      toast({
        title: data.title,
        description: data.message,
        duration: 8000
      });
    };

    eventSource.onerror = () => {
      eventSource.close();
      setTimeout(subscribeToNotifications, 5000);
    };

    return () => eventSource.close();
  };

  return null;
}
