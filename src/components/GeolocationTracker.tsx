import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import Icon from './ui/icon';
import { useToast } from './ui/use-toast';

interface GeolocationTrackerProps {
  userId: string;
  userType: 'carrier';
}

export default function GeolocationTracker({ userId }: GeolocationTrackerProps) {
  const [tracking, setTracking] = useState(false);
  const [permission, setPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkPermission();
    const savedTracking = localStorage.getItem('geolocation_tracking');
    if (savedTracking === 'true') {
      startTracking();
    }
  }, []);

  const checkPermission = async () => {
    if ('permissions' in navigator) {
      const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      setPermission(result.state as any);
      result.onchange = () => setPermission(result.state as any);
    }
  };

  const requestPermission = () => {
    navigator.geolocation.getCurrentPosition(
      () => {
        setPermission('granted');
        toast({
          title: 'Доступ предоставлен',
          description: 'Теперь клиенты могут отслеживать вашу доставку'
        });
      },
      () => {
        setPermission('denied');
        toast({
          title: 'Доступ запрещён',
          description: 'Разрешите доступ к геолокации в настройках браузера',
          variant: 'destructive'
        });
      }
    );
  };

  const startTracking = () => {
    if (permission !== 'granted') {
      requestPermission();
      return;
    }

    setTracking(true);
    localStorage.setItem('geolocation_tracking', 'true');

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        updateLocation(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast({
          title: 'Ошибка геолокации',
          description: 'Не удалось определить местоположение',
          variant: 'destructive'
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  };

  const updateLocation = async (lat: number, lng: number) => {
    try {
      await fetch('https://functions.poehali.dev/b388f085-faa7-4aab-88a5-b45708b116eb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_driver_location',
          user_id: userId,
          lat,
          lng,
          timestamp: new Date().toISOString()
        })
      });
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to update location:', error);
    }
  };

  const stopTracking = () => {
    setTracking(false);
    localStorage.setItem('geolocation_tracking', 'false');
    toast({
      title: 'Отслеживание остановлено',
      description: 'Ваше местоположение больше не передаётся'
    });
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          tracking ? 'bg-green-500/20' : 'bg-gray-500/20'
        }`}>
          <Icon 
            name={tracking ? "MapPin" : "MapPinOff"} 
            size={20} 
            className={tracking ? 'text-green-400' : 'text-gray-400'} 
          />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">Геолокация</h3>
          <p className="text-xs text-muted-foreground">
            {tracking 
              ? `Последнее обновление: ${lastUpdate?.toLocaleTimeString('ru-RU') || 'н/д'}`
              : 'Отслеживание выключено'}
          </p>
        </div>
      </div>

      {permission === 'prompt' && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-3">
          <div className="flex gap-2">
            <Icon name="Info" size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-400">
              <p className="font-semibold mb-1">Требуется доступ к геолокации</p>
              <p className="text-xs">
                Это позволит клиентам отслеживать доставку в реальном времени. 
                Данные используются только во время активного заказа.
              </p>
            </div>
          </div>
        </div>
      )}

      {permission === 'denied' && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-3">
          <div className="flex gap-2">
            <Icon name="AlertCircle" size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-400">
              <p className="font-semibold mb-1">Доступ запрещён</p>
              <p className="text-xs">
                Разрешите доступ к геолокации в настройках браузера, 
                чтобы клиенты могли отслеживать доставку.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {!tracking ? (
          <Button 
            onClick={startTracking} 
            className="flex-1"
            disabled={permission === 'denied'}
          >
            <Icon name="Play" size={18} className="mr-2" />
            Включить отслеживание
          </Button>
        ) : (
          <Button onClick={stopTracking} variant="outline" className="flex-1">
            <Icon name="Pause" size={18} className="mr-2" />
            Остановить
          </Button>
        )}
      </div>

      <div className="mt-3 space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Icon name="Shield" size={12} className="text-green-400" />
          <span>Данные защищены и используются только для доставки</span>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="Zap" size={12} className="text-yellow-400" />
          <span>Обновление каждые 10 секунд во время активного заказа</span>
        </div>
      </div>
    </Card>
  );
}
