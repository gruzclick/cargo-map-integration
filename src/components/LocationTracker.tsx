import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface LocationTrackerProps {
  userId: string;
  userType: 'client' | 'carrier';
  enabled: boolean;
}

const LocationTracker = ({ userId, userType, enabled }: LocationTrackerProps) => {
  const [tracking, setTracking] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!enabled || userType !== 'carrier') return;

    const storedTracking = localStorage.getItem(`tracking_${userId}`);
    if (storedTracking === 'true') {
      startTracking();
    }
  }, [enabled, userType, userId]);

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Геолокация не поддерживается вашим браузером');
      toast({
        title: 'Ошибка',
        description: 'Геолокация не поддерживается',
        variant: 'destructive'
      });
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setLocation(newLocation);
        setError(null);

        try {
          await fetch('https://functions.poehali.dev/e0c57b5b-aa36-4b28-8b31-c70ece513cae', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'update_location',
              user_id: userId,
              lat: newLocation.lat,
              lng: newLocation.lng
            })
          });
        } catch (error) {
          console.error('Error updating location:', error);
        }
      },
      (error) => {
        setError(error.message);
        toast({
          title: 'Ошибка геолокации',
          description: error.message,
          variant: 'destructive'
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    setTracking(true);
    localStorage.setItem(`tracking_${userId}`, 'true');
    toast({
      title: 'Отслеживание включено',
      description: 'Ваше местоположение обновляется на карте'
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  };

  const stopTracking = () => {
    setTracking(false);
    localStorage.removeItem(`tracking_${userId}`);
    toast({
      title: 'Отслеживание остановлено',
      description: 'Ваше местоположение больше не отображается на карте'
    });
  };

  const toggleTracking = () => {
    if (tracking) {
      stopTracking();
    } else {
      startTracking();
    }
  };

  if (userType !== 'carrier') return null;

  return (
    <Card className="border-0 shadow-md rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 ${tracking ? 'bg-green-500/10' : 'bg-muted'} rounded-xl flex items-center justify-center`}>
              <Icon name="MapPin" size={24} className={tracking ? 'text-green-500' : 'text-muted-foreground'} />
            </div>
            <div>
              <CardTitle className="text-xl">Геолокация</CardTitle>
              <CardDescription>
                {tracking ? 'Активна' : 'Неактивна'}
              </CardDescription>
            </div>
          </div>
          <Badge variant={tracking ? 'default' : 'secondary'} className="gap-1">
            <div className={`w-2 h-2 rounded-full ${tracking ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
            {tracking ? 'Онлайн' : 'Офлайн'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {location && (
          <div className="bg-accent/10 rounded-xl p-4 space-y-2">
            <p className="text-sm font-medium">Текущие координаты:</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>
                <span className="font-semibold">Широта:</span> {location.lat.toFixed(6)}
              </div>
              <div>
                <span className="font-semibold">Долгота:</span> {location.lng.toFixed(6)}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <Icon name="AlertCircle" size={18} className="text-destructive mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-destructive">Ошибка</p>
                <p className="text-xs text-destructive/80">{error}</p>
              </div>
            </div>
          </div>
        )}

        <Button 
          onClick={toggleTracking} 
          className="w-full h-11 rounded-xl"
          variant={tracking ? 'destructive' : 'default'}
        >
          <Icon name={tracking ? 'MapPinOff' : 'MapPin'} size={18} className="mr-2" />
          {tracking ? 'Остановить отслеживание' : 'Начать отслеживание'}
        </Button>

        <div className="bg-muted/50 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <Icon name="Info" size={16} className="text-muted-foreground mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Включите отслеживание, чтобы клиенты видели ваше текущее местоположение на карте. 
              Ваши координаты обновляются автоматически каждые несколько секунд.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationTracker;
