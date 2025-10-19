import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { MapMarker } from './MapTypes';

interface NearbyCargoNotificationProps {
  markers: MapMarker[];
  userLocation: { lat: number; lng: number } | null;
  radiusKm?: number;
}

interface CargoNotification {
  id: string;
  cargo: MapMarker;
  distance: number;
}

const NearbyCargoNotification = ({ 
  markers, 
  userLocation, 
  radiusKm = 50 
}: NearbyCargoNotificationProps) => {
  const [notifications, setNotifications] = useState<CargoNotification[]>([]);
  const [previousCargoIds, setPreviousCargoIds] = useState<Set<string>>(new Set());
  const [visibleNotifications, setVisibleNotifications] = useState<Set<string>>(new Set());

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  useEffect(() => {
    if (!userLocation) return;

    const cargos = markers.filter(m => m.type === 'cargo');
    const currentCargoIds = new Set(cargos.map(c => c.id));
    
    const newCargos = cargos.filter(cargo => !previousCargoIds.has(cargo.id));
    
    if (newCargos.length > 0) {
      const nearbyCargos: CargoNotification[] = newCargos
        .map(cargo => ({
          id: cargo.id,
          cargo,
          distance: calculateDistance(
            userLocation.lat,
            userLocation.lng,
            cargo.lat,
            cargo.lng
          )
        }))
        .filter(n => n.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3);

      if (nearbyCargos.length > 0) {
        setNotifications(prev => [...nearbyCargos, ...prev].slice(0, 5));
        nearbyCargos.forEach(n => {
          setVisibleNotifications(prev => new Set(prev).add(n.id));
          setTimeout(() => {
            setVisibleNotifications(prev => {
              const newSet = new Set(prev);
              newSet.delete(n.id);
              return newSet;
            });
          }, 5000);
        });
      }
    }
    
    setPreviousCargoIds(currentCargoIds);
  }, [markers, userLocation, radiusKm, previousCargoIds]);

  const activeNotifications = notifications.filter(n => visibleNotifications.has(n.id));

  if (activeNotifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm pointer-events-none">
      {activeNotifications.map((notification) => (
        <Card 
          key={notification.id}
          className="border border-sky-200/50 dark:border-sky-700/50 shadow-2xl bg-gradient-to-br from-sky-50 to-white dark:from-sky-900/80 dark:to-gray-900/80 backdrop-blur-xl animate-slide-in-right pointer-events-auto"
        >
          <CardContent className="p-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-sky-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                <Icon name="MapPin" size={20} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Новый груз рядом!
                  </p>
                  <button
                    onClick={() => setVisibleNotifications(prev => {
                      const newSet = new Set(prev);
                      newSet.delete(notification.id);
                      return newSet;
                    })}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <Icon name="X" size={14} />
                  </button>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  {notification.cargo.details || 'Детали не указаны'}
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Icon name="Navigation" size={12} className="text-sky-500" />
                    <span className="text-xs font-medium text-sky-600 dark:text-sky-400">
                      {notification.distance.toFixed(1)} км
                    </span>
                  </div>
                  {notification.cargo.cargoType && (
                    <div className="flex items-center gap-1">
                      <Icon name="Package" size={12} className="text-gray-500" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {notification.cargo.cargoType === 'box' ? 'Коробки' : 
                         notification.cargo.cargoType === 'pallet' ? 'Паллеты' : 'Негабарит'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default NearbyCargoNotification;
