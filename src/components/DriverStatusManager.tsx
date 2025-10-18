import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';
import { TruckIcon, MapPin, Calendar } from 'lucide-react';

interface DriverStatusManagerProps {
  driverId: string;
  onStatusUpdate?: () => void;
}

export function DriverStatusManager({ driverId, onStatusUpdate }: DriverStatusManagerProps) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<'free' | 'has_space' | 'no_space'>('free');
  const [routeStart, setRouteStart] = useState('');
  const [routeEnd, setRouteEnd] = useState('');
  const [availableFrom, setAvailableFrom] = useState(new Date().toISOString().split('T')[0]);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadCurrentStatus();
  }, [driverId]);

  const loadCurrentStatus = async () => {
    try {
      const response = await fetch(`/api/driver/status/${driverId}`);
      if (response.ok) {
        const data = await response.json();
        setStatus(data.status);
        setRouteStart(data.route_start || '');
        setRouteEnd(data.route_end || '');
        setAvailableFrom(data.available_from || new Date().toISOString().split('T')[0]);
      }
    } catch (error) {
      console.error('Failed to load driver status:', error);
    }
  };

  const updateStatus = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/driver/status/${driverId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          route_start: routeStart.trim(),
          route_end: routeEnd.trim(),
          available_from: availableFrom,
        }),
      });

      if (response.ok) {
        onStatusUpdate?.();

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(t('driverStatus.updated'), {
            body: t(`driverStatus.statuses.${status}`),
            icon: '/icon-192.png',
          });
        }
      }
    } catch (error) {
      console.error('Failed to update driver status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <TruckIcon className="h-5 w-5" />
        <h3 className="font-semibold text-lg">{t('driverStatus.title')}</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            {t('driverStatus.currentStatus')}
          </label>
          <div className="grid grid-cols-1 gap-2">
            <Button
              variant={status === 'free' ? 'default' : 'outline'}
              onClick={() => setStatus('free')}
              className="justify-start"
            >
              {t('driverStatus.statuses.free')}
            </Button>
            <Button
              variant={status === 'has_space' ? 'default' : 'outline'}
              onClick={() => setStatus('has_space')}
              className="justify-start"
            >
              {t('driverStatus.statuses.has_space')}
            </Button>
            <Button
              variant={status === 'no_space' ? 'default' : 'outline'}
              onClick={() => setStatus('no_space')}
              className="justify-start"
            >
              {t('driverStatus.statuses.no_space')}
            </Button>
          </div>
        </div>

        {(status === 'has_space' || status === 'no_space') && (
          <>
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {t('driverStatus.routeStart')}
              </label>
              <Input
                value={routeStart}
                onChange={(e) => setRouteStart(e.target.value)}
                placeholder={t('driverStatus.routeStartPlaceholder')}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {t('driverStatus.routeEnd')}
              </label>
              <Input
                value={routeEnd}
                onChange={(e) => setRouteEnd(e.target.value)}
                placeholder={t('driverStatus.routeEndPlaceholder')}
              />
            </div>
          </>
        )}

        <div>
          <label className="text-sm font-medium mb-2 block flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {t('driverStatus.availableFrom')}
          </label>
          <Input
            type="date"
            value={availableFrom}
            onChange={(e) => setAvailableFrom(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <Button onClick={updateStatus} disabled={isUpdating} className="w-full">
          {t('driverStatus.update')}
        </Button>
      </div>
    </Card>
  );
}
