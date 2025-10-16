import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import Icon from './ui/icon';
import { useToast } from './ui/use-toast';

interface DeliveryPoint {
  id: string;
  address: string;
  warehouse_address: string;
  cargo_quantity: number;
  cargo_unit: string;
  weight: number;
  delivery_date: string;
  cargo_photo: string;
  client_name: string;
  client_phone: string;
  lat: number;
  lng: number;
}

interface OptimizedRoute {
  total_distance: number;
  total_time: number;
  points: DeliveryPoint[];
  map_url: string;
}

export default function RouteOptimizer() {
  const [selectedDeliveries, setSelectedDeliveries] = useState<string[]>([]);
  const [availableDeliveries, setAvailableDeliveries] = useState<DeliveryPoint[]>([]);
  const [optimizedRoute, setOptimizedRoute] = useState<OptimizedRoute | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const { toast } = useToast();

  const userId = localStorage.getItem('userId') || '';

  useEffect(() => {
    fetchAvailableDeliveries();
  }, []);

  const fetchAvailableDeliveries = async () => {
    try {
      const response = await fetch(`https://functions.poehali.dev/b388f085-faa7-4aab-88a5-b45708b116eb?user_id=${userId}&action=get_available_deliveries`);
      const data = await response.json();
      setAvailableDeliveries(data.deliveries || []);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
    }
  };

  const toggleDeliverySelection = (deliveryId: string) => {
    setSelectedDeliveries(prev => 
      prev.includes(deliveryId) 
        ? prev.filter(id => id !== deliveryId)
        : [...prev, deliveryId]
    );
  };

  const optimizeRoute = async () => {
    if (selectedDeliveries.length < 2) {
      toast({
        title: 'Ошибка',
        description: 'Выберите минимум 2 точки доставки',
        variant: 'destructive'
      });
      return;
    }

    setOptimizing(true);
    try {
      const response = await fetch('https://functions.poehali.dev/b388f085-faa7-4aab-88a5-b45708b116eb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'optimize_route',
          user_id: userId,
          delivery_ids: selectedDeliveries
        })
      });

      const data = await response.json();
      setOptimizedRoute(data);

      toast({
        title: 'Маршрут построен!',
        description: `Оптимальный маршрут через ${data.points.length} точек`
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось построить маршрут',
        variant: 'destructive'
      });
    } finally {
      setOptimizing(false);
    }
  };

  const acceptRoute = async () => {
    if (!optimizedRoute) return;

    try {
      await fetch('https://functions.poehali.dev/b388f085-faa7-4aab-88a5-b45708b116eb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'accept_route',
          user_id: userId,
          delivery_ids: optimizedRoute.points.map(p => p.id)
        })
      });

      toast({
        title: 'Маршрут принят!',
        description: 'Начинайте движение по точкам'
      });

      setOptimizedRoute(null);
      setSelectedDeliveries([]);
      fetchAvailableDeliveries();
    } catch (error) {
      console.error('Error accepting route:', error);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Icon name="Route" size={24} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Оптимизация маршрута</h2>
            <p className="text-sm text-muted-foreground">Выберите точки для построения оптимального маршрута</p>
          </div>
        </div>

        {availableDeliveries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="Package" size={48} className="mx-auto mb-3 opacity-20" />
            <p>Нет доступных заявок для доставки</p>
          </div>
        ) : (
          <div className="space-y-3">
            {availableDeliveries.map((delivery) => (
              <Card
                key={delivery.id}
                className={`p-4 cursor-pointer transition-all ${
                  selectedDeliveries.includes(delivery.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => toggleDeliverySelection(delivery.id)}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    {selectedDeliveries.includes(delivery.id) ? (
                      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                        <Icon name="Check" size={20} className="text-white" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 border-2 border-border rounded-lg" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">{delivery.client_name}</p>
                        <p className="text-sm text-muted-foreground">{delivery.client_phone}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{delivery.cargo_quantity} {delivery.cargo_unit === 'pallets' ? 'паллет' : 'коробок'}</div>
                        <div className="text-xs text-muted-foreground">{delivery.weight} кг</div>
                      </div>
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex items-start gap-2">
                        <Icon name="MapPin" size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{delivery.warehouse_address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="Calendar" size={16} className="text-blue-400" />
                        <span className="text-muted-foreground">{delivery.delivery_date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {selectedDeliveries.length > 0 && (
          <div className="mt-4 flex gap-2">
            <Button onClick={optimizeRoute} disabled={optimizing} className="flex-1">
              {optimizing ? (
                <>
                  <Icon name="Loader" size={20} className="mr-2 animate-spin" />
                  Построение маршрута...
                </>
              ) : (
                <>
                  <Icon name="Navigation" size={20} className="mr-2" />
                  Построить маршрут ({selectedDeliveries.length} точек)
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => setSelectedDeliveries([])}>
              Сбросить
            </Button>
          </div>
        )}
      </Card>

      {optimizedRoute && (
        <Card className="p-6 space-y-4 border-primary bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <Icon name="CheckCircle" size={24} className="text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Оптимальный маршрут построен!</h3>
              <p className="text-sm text-muted-foreground">
                Расстояние: {optimizedRoute.total_distance.toFixed(1)} км • 
                Время: ~{Math.round(optimizedRoute.total_time / 60)} мин
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {optimizedRoute.points.map((point, index) => (
              <div key={point.id} className="flex items-start gap-3 p-3 bg-background rounded-lg">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{point.client_name}</p>
                  <p className="text-sm text-muted-foreground">{point.warehouse_address}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {point.cargo_quantity} {point.cargo_unit === 'pallets' ? 'паллет' : 'коробок'} • {point.weight} кг
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="h-64 rounded-lg overflow-hidden">
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              src={optimizedRoute.map_url}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={acceptRoute} className="flex-1" size="lg">
              <Icon name="Play" size={20} className="mr-2" />
              Начать маршрут
            </Button>
            <Button variant="outline" onClick={() => setOptimizedRoute(null)} size="lg">
              Отменить
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
