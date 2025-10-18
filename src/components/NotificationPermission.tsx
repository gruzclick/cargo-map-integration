import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

export default function NotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      const hasAsked = localStorage.getItem('notification_asked');
      if (Notification.permission === 'default' && !hasAsked) {
        setShowPrompt(true);
      }
    }
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      try {
        const result = await Notification.requestPermission();
        setPermission(result);
        localStorage.setItem('notification_asked', 'true');
        
        if (result === 'granted') {
          toast.success('Уведомления включены!');
          setShowPrompt(false);
          
          new Notification('Груз Клик', {
            body: 'Вы будете получать уведомления о новых заказах',
            icon: '/logo.png',
          });
        } else {
          toast.error('Уведомления отклонены');
          setShowPrompt(false);
        }
      } catch (error) {
        console.error('Ошибка запроса уведомлений:', error);
        toast.error('Не удалось запросить разрешение');
      }
    }
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    localStorage.setItem('notification_asked', 'true');
  };

  if (!showPrompt || permission !== 'default') {
    return null;
  }

  return (
    <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
            <Icon name="Bell" size={24} className="text-accent" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">Включить уведомления?</CardTitle>
            <CardDescription>
              Получайте мгновенные уведомления о новых заказах и обновлениях доставки
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex gap-2">
        <Button onClick={requestPermission} className="flex-1">
          <Icon name="Check" size={18} className="mr-2" />
          Разрешить
        </Button>
        <Button onClick={dismissPrompt} variant="outline" className="flex-1">
          <Icon name="X" size={18} className="mr-2" />
          Не сейчас
        </Button>
      </CardContent>
    </Card>
  );
}
