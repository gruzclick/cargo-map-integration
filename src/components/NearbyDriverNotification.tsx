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

interface Cargo {
  id: string;
  pickup_address: string;
  delivery_address: string;
  warehouse_address: string;
  distance: number;
  delivery_date: string;
  cargo_quantity: number;
  cargo_unit: string;
  weight: number;
}

interface NearbyDriverNotificationProps {
  driverRoute: Array<{ warehouse: string; time: string }>;
  enabled: boolean;
  userType: 'driver' | 'client';
}

const NearbyDriverNotification = ({ driverRoute, enabled, userType }: NearbyDriverNotificationProps) => {
  const [nearbyDrivers, setNearbyDrivers] = useState<Driver[]>([]);
  const [nearbyCargos, setNearbyCargos] = useState<Cargo[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const userId = localStorage.getItem('userId') || '';

  useEffect(() => {
    if (!enabled) return;

    const checkNearby = async () => {
      try {
        if (userType === 'driver') {
          const today = new Date().toISOString().split('T')[0];
          const warehouses = driverRoute
            .filter(r => r.time.startsWith(today))
            .map(r => r.warehouse);

          if (warehouses.length === 0) return;

          const response = await fetch('https://functions.poehali.dev/b388f085-faa7-4aab-88a5-b45708b116eb', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'get_nearby_cargos',
              user_id: userId,
              warehouses: warehouses
            })
          });

          const data = await response.json();
          const cargos = data.cargos?.filter((c: Cargo) => !dismissed.has(c.id)) || [];

          if (cargos.length > 0) {
            setNearbyCargos(cargos.slice(0, 3));
            
            if (cargos.length > nearbyCargos.length) {
              toast({
                title: '📦 Новые грузы на маршруте!',
                description: `${cargos.length} грузов требуют доставки на ваши склады`,
                duration: 8000
              });
            }
          }
        }
      } catch (error) {
        console.error('Error checking nearby:', error);
      }
    };

    checkNearby();
    const interval = setInterval(checkNearby, 30000);

    return () => clearInterval(interval);
  }, [driverRoute, enabled, dismissed, userType]);

  const handleDismissCargo = (cargoId: string) => {
    setDismissed(prev => new Set([...prev, cargoId]));
    setNearbyCargos(prev => prev.filter(c => c.id !== cargoId));
  };

  const getCargoIcon = (unit: string) => {
    return unit === 'pallets' ? 'Package' : 'Box';
  };

  const handleDismiss = (driverId: string) => {
    setDismissed(prev => new Set([...prev, driverId]));
    setNearbyDrivers(prev => prev.filter(d => d.id !== driverId));
  };

  if (userType === 'driver' && nearbyCargos.length === 0) return null;
  if (userType !== 'driver') return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-3 max-w-sm">
      {nearbyCargos.map((cargo) => (
        <Card key={cargo.id} className="border-0 shadow-2xl rounded-2xl p-4 bg-card/95 backdrop-blur-xl animate-in slide-in-from-right">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon name={getCargoIcon(cargo.cargo_unit)} size={24} className="text-blue-500" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-semibold text-sm">Новый груз</h4>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 flex-shrink-0"
                  onClick={() => handleDismissCargo(cargo.id)}
                >
                  <Icon name="X" size={14} />
                </Button>
              </div>
              
              <div className="space-y-1 text-xs text-muted-foreground mb-2">
                <div className="flex items-center gap-1">
                  <Icon name="MapPin" size={12} className="text-green-500" />
                  <span className="truncate">{cargo.warehouse_address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Icon name="Package" size={12} />
                    <span>{cargo.cargo_quantity} {cargo.cargo_unit === 'pallets' ? 'паллет' : 'коробок'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon name="Weight" size={12} />
                    <span>{cargo.weight} кг</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Icon name="Calendar" size={12} className="text-blue-500" />
                  <span>{cargo.delivery_date}</span>
                </div>
              </div>
              
              <Button size="sm" className="w-full h-8 text-xs rounded-lg">
                <Icon name="CheckCircle" size={14} className="mr-1" />
                Взять заявку
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default NearbyDriverNotification;