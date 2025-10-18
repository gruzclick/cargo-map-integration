import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { TruckIcon, MapPin, Bell } from 'lucide-react';

interface AvailableDriver {
  driver_id: string;
  driver_name: string;
  vehicle_type: string;
  route_start: string;
  route_end: string;
  available_from: string;
  distance: number;
}

interface AvailableDriverNotifierProps {
  clientId: string;
  clientLocation?: { lat: number; lng: number };
  requiredRoute?: { from: string; to: string };
}

export function AvailableDriverNotifier({ clientId, clientLocation, requiredRoute }: AvailableDriverNotifierProps) {
  const { t } = useTranslation();
  const [availableDrivers, setAvailableDrivers] = useState<AvailableDriver[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const subscription = localStorage.getItem(`driver_notify_${clientId}`);
    setIsSubscribed(subscription === 'true');
  }, [clientId]);

  useEffect(() => {
    if (isSubscribed) {
      checkAvailableDrivers();
      const interval = setInterval(checkAvailableDrivers, 30000);
      return () => clearInterval(interval);
    }
  }, [isSubscribed, clientLocation, requiredRoute]);

  const checkAvailableDrivers = async () => {
    try {
      const response = await fetch('/api/drivers/available', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          location: clientLocation,
          route: requiredRoute,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        const newDrivers = data.drivers.filter(
          (driver: AvailableDriver) =>
            !availableDrivers.some((d) => d.driver_id === driver.driver_id)
        );

        if (newDrivers.length > 0) {
          setAvailableDrivers([...availableDrivers, ...newDrivers]);
          
          if ('Notification' in window && Notification.permission === 'granted') {
            newDrivers.forEach((driver: AvailableDriver) => {
              new Notification(t('availableDriver.title'), {
                body: t('availableDriver.body', {
                  name: driver.driver_name,
                  route: `${driver.route_start} → ${driver.route_end}`,
                }),
                icon: '/icon-192.png',
              });
            });
          }
        }
      }
    } catch (error) {
      console.error('Failed to check available drivers:', error);
    }
  };

  const toggleSubscription = () => {
    const newState = !isSubscribed;
    setIsSubscribed(newState);
    localStorage.setItem(`driver_notify_${clientId}`, newState.toString());

    if (newState && 'Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <div>
              <h3 className="font-semibold text-sm">{t('availableDriver.subscribe')}</h3>
              <p className="text-xs text-muted-foreground">
                {t('availableDriver.subscribeDesc')}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant={isSubscribed ? 'default' : 'outline'}
            onClick={toggleSubscription}
          >
            {isSubscribed ? t('availableDriver.subscribed') : t('availableDriver.subscribe')}
          </Button>
        </div>
      </Card>

      {availableDrivers.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold">{t('availableDriver.recentTitle')}</h3>
          {availableDrivers.map((driver) => (
            <Card key={driver.driver_id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <TruckIcon className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{driver.driver_name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t(`vehicleTypes.${driver.vehicle_type}`)}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {driver.route_start} → {driver.route_end}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('availableDriver.availableFrom', {
                      date: new Date(driver.available_from).toLocaleDateString('ru-RU'),
                    })}
                  </p>
                  {driver.distance && (
                    <p className="text-xs text-muted-foreground">
                      {t('availableDriver.distance', { distance: driver.distance.toFixed(1) })}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
