import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import Icon from './ui/icon';

interface TrackingData {
  delivery_id: string;
  status: 'pending' | 'picked_up' | 'in_transit' | 'delivered';
  driver_name: string;
  driver_phone: string;
  vehicle: string;
  vehicle_photo: string;
  current_location: { lat: number; lng: number };
  pickup_address: string;
  delivery_address: string;
  estimated_arrival: string;
  cargo_photo?: string;
  delivery_photo?: string;
}

interface DeliveryTrackingProps {
  deliveryId: string;
  onClose: () => void;
}

export default function DeliveryTracking({ deliveryId, onClose }: DeliveryTrackingProps) {
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    fetchTracking();
    const interval = setInterval(fetchTracking, 5000);
    return () => clearInterval(interval);
  }, [deliveryId]);

  const fetchTracking = async () => {
    try {
      const response = await fetch(`https://functions.poehali.dev/b388f085-faa7-4aab-88a5-b45708b116eb?delivery_id=${deliveryId}&action=track_delivery`);
      const data = await response.json();
      setTracking(data);
      setMapKey(prev => prev + 1);
    } catch (error) {
      console.error('Error fetching tracking:', error);
    }
  };

  if (!tracking) {
    return (
      <Card className="p-6 text-center">
        <Icon name="Loader" size={40} className="animate-spin mx-auto mb-4 text-primary" />
        <p>Загрузка данных...</p>
      </Card>
    );
  }

  const statusConfig = {
    pending: { label: 'Ожидание', icon: 'Clock', color: 'text-yellow-400' },
    picked_up: { label: 'Груз забран', icon: 'Package', color: 'text-blue-400' },
    in_transit: { label: 'В пути', icon: 'Truck', color: 'text-green-400' },
    delivered: { label: 'Доставлено', icon: 'CheckCircle', color: 'text-emerald-400' }
  };

  const currentStatus = statusConfig[tracking.status];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Отслеживание доставки</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <Icon name="X" size={24} />
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-full ${currentStatus.color.replace('text', 'bg')}/20 flex items-center justify-center`}>
            <Icon name={currentStatus.icon as any} size={24} className={currentStatus.color} />
          </div>
          <div>
            <h3 className="text-xl font-bold">{currentStatus.label}</h3>
            <p className="text-sm text-muted-foreground">Прибытие: {tracking.estimated_arrival}</p>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-start gap-2">
            <Icon name="MapPin" size={18} className="text-green-400 mt-1" />
            <div>
              <p className="text-sm font-semibold">Забор</p>
              <p className="text-sm text-muted-foreground">{tracking.pickup_address}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Icon name="Flag" size={18} className="text-red-400 mt-1" />
            <div>
              <p className="text-sm font-semibold">Доставка</p>
              <p className="text-sm text-muted-foreground">{tracking.delivery_address}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-4 space-y-3">
          <div className="flex items-center gap-3">
            <img src={tracking.vehicle_photo} alt={tracking.vehicle} className="w-20 h-16 object-cover rounded-lg" />
            <div className="flex-1">
              <p className="font-semibold">{tracking.driver_name}</p>
              <p className="text-sm text-muted-foreground">{tracking.vehicle}</p>
              <a href={`tel:${tracking.driver_phone}`} className="text-sm text-primary hover:underline">
                {tracking.driver_phone}
              </a>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden h-80">
        <iframe
          key={mapKey}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          src={`https://www.google.com/maps?q=${tracking.current_location.lat},${tracking.current_location.lng}&output=embed`}
        />
      </Card>

      {tracking.cargo_photo && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Icon name="Package" size={20} />
            Фото груза
          </h3>
          <img src={tracking.cargo_photo} alt="Груз" className="w-full h-48 object-cover rounded-lg" />
        </Card>
      )}

      {tracking.delivery_photo && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Icon name="CheckCircle" size={20} className="text-green-400" />
            Фото после доставки
          </h3>
          <img src={tracking.delivery_photo} alt="Доставка" className="w-full h-48 object-cover rounded-lg" />
        </Card>
      )}
    </div>
  );
}
