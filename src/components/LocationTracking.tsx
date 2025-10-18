import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface LocationTrackingProps {
  orderId: string;
  isCarrier: boolean;
  onLocationUpdate?: (coords: { latitude: number; longitude: number }) => void;
}

export default function LocationTracking({ orderId, isCarrier, onLocationUpdate }: LocationTrackingProps) {
  const [tracking, setTracking] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [permission, setPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');

  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermission(result.state as 'prompt' | 'granted' | 'denied');
      });
    }
  }, []);

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  const startTracking = () => {
    if (!navigator.geolocation) {
      toast.error('Геолокация не поддерживается вашим браузером');
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCurrentLocation(coords);
        setTracking(true);
        
        if (onLocationUpdate) {
          onLocationUpdate(coords);
        }

        toast.success('Местоположение обновлено');
      },
      (error) => {
        console.error('Ошибка геолокации:', error);
        toast.error('Не удалось получить местоположение');
        setTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    setWatchId(id);
  };

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setTracking(false);
      setCurrentLocation(null);
      toast.info('Отслеживание остановлено');
    }
  };

  if (!isCarrier) {
    return (
      <Card className="border-accent/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
              <Icon name="MapPin" size={24} className="text-accent" />
            </div>
            <div>
              <CardTitle>Отслеживание доставки</CardTitle>
              <CardDescription>
                Перевозчик предоставляет доступ к своему местоположению во время доставки
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-lg p-4 flex items-center gap-3">
            <Icon name="Info" size={20} className="text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Вы сможете видеть текущее местоположение груза в режиме реального времени
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-accent/20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
            <Icon name="MapPin" size={24} className="text-accent" />
          </div>
          <div className="flex-1">
            <CardTitle>Отслеживание доставки</CardTitle>
            <CardDescription>
              Включите геолокацию для отслеживания маршрута
            </CardDescription>
          </div>
          {tracking && (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Активно
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {permission === 'denied' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <Icon name="AlertCircle" size={20} className="text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">Доступ к геолокации запрещён</p>
              <p className="text-sm text-red-700 mt-1">
                Разрешите доступ к геолокации в настройках браузера для отслеживания доставки
              </p>
            </div>
          </div>
        )}

        {currentLocation && (
          <div className="bg-accent/5 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">Текущие координаты:</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Широта:</span>
                <p className="font-mono">{currentLocation.latitude.toFixed(6)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Долгота:</span>
                <p className="font-mono">{currentLocation.longitude.toFixed(6)}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <Icon name="Info" size={20} className="text-amber-600 mt-0.5" />
          <div className="flex-1 text-sm text-amber-900">
            <p className="font-medium mb-1">Важно:</p>
            <ul className="list-disc list-inside space-y-1 text-amber-800">
              <li>Отслеживание работает только во время активной доставки</li>
              <li>Клиент видит ваше местоположение в реальном времени</li>
              <li>Отслеживание автоматически прекратится после подтверждения доставки</li>
            </ul>
          </div>
        </div>

        {!tracking ? (
          <Button onClick={startTracking} className="w-full" size="lg" disabled={permission === 'denied'}>
            <Icon name="Navigation" size={20} className="mr-2" />
            Начать отслеживание
          </Button>
        ) : (
          <Button onClick={stopTracking} variant="destructive" className="w-full" size="lg">
            <Icon name="NavigationOff" size={20} className="mr-2" />
            Остановить отслеживание
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
