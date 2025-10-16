import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Driver {
  id: string;
  name: string;
  distance: number;
  vehicleType: string;
  rating: number;
}

interface NearbyDriverNotificationProps {
  cargoLocation: { lat: number; lng: number };
  enabled: boolean;
}

const NearbyDriverNotification = ({ cargoLocation, enabled }: NearbyDriverNotificationProps) => {
  const [nearbyDrivers, setNearbyDrivers] = useState<Driver[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    if (!enabled) return;

    const checkNearbyDrivers = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/e0c57b5b-aa36-4b28-8b31-c70ece513cae');
        const data = await response.json();
        
        const drivers = data.markers
          ?.filter((m: any) => m.type === 'driver' && m.vehicleStatus === 'free')
          .map((driver: any) => {
            const distance = calculateDistance(
              cargoLocation.lat,
              cargoLocation.lng,
              driver.lat,
              driver.lng
            );
            return {
              id: driver.id,
              name: driver.name,
              distance,
              vehicleType: driver.vehicleCategory || 'car',
              rating: driver.rating || 5.0
            };
          })
          .filter((d: Driver) => d.distance <= 5 && !dismissed.has(d.id))
          .sort((a: Driver, b: Driver) => a.distance - b.distance);

        if (drivers && drivers.length > 0) {
          setNearbyDrivers(drivers.slice(0, 3));
          
          drivers.slice(0, 1).forEach((driver: Driver) => {
            toast({
              title: '🚚 Свободный водитель рядом!',
              description: `${driver.name} находится в ${driver.distance.toFixed(1)} км от вашего груза`,
              duration: 8000
            });
          });
        }
      } catch (error) {
        console.error('Error checking nearby drivers:', error);
      }
    };

    checkNearbyDrivers();
    const interval = setInterval(checkNearbyDrivers, 30000);

    return () => clearInterval(interval);
  }, [cargoLocation, enabled, dismissed]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'truck': return 'Truck';
      case 'semi': return 'Container';
      default: return 'Car';
    }
  };

  const handleDismiss = (driverId: string) => {
    setDismissed(prev => new Set([...prev, driverId]));
    setNearbyDrivers(prev => prev.filter(d => d.id !== driverId));
  };

  if (nearbyDrivers.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-3 max-w-sm">
      {nearbyDrivers.map((driver) => (
        <Card key={driver.id} className="border-0 shadow-2xl rounded-2xl p-4 bg-card/95 backdrop-blur-xl animate-in slide-in-from-right">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon name={getVehicleIcon(driver.vehicleType)} size={24} className="text-green-500" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-semibold text-sm truncate">{driver.name}</h4>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 flex-shrink-0"
                  onClick={() => handleDismiss(driver.id)}
                >
                  <Icon name="X" size={14} />
                </Button>
              </div>
              
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                <div className="flex items-center gap-1">
                  <Icon name="MapPin" size={12} className="text-green-500" />
                  <span>{driver.distance.toFixed(1)} км</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon name="Star" size={12} className="text-yellow-500" />
                  <span>{driver.rating.toFixed(1)}</span>
                </div>
              </div>
              
              <Button size="sm" className="w-full h-8 text-xs rounded-lg">
                <Icon name="Phone" size={14} className="mr-1" />
                Связаться
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default NearbyDriverNotification;
