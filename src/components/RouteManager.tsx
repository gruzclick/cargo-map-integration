import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface RouteStop {
  id: string;
  warehouse: string;
  time: string;
  completed: boolean;
}

interface RouteManagerProps {
  userId: string;
}

const RouteManager = ({ userId }: RouteManagerProps) => {
  const [route, setRoute] = useState<RouteStop[]>([]);
  const [warehouse, setWarehouse] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRoute();
  }, [userId]);

  const fetchRoute = async () => {
    try {
      const response = await fetch(`https://functions.poehali.dev/b388f085-faa7-4aab-88a5-b45708b116eb?user_id=${userId}`);
      const data = await response.json();
      setRoute(data.route || []);
    } catch (error) {
      console.error('Error fetching route:', error);
    }
  };

  const addStop = async () => {
    if (!warehouse || !time) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/b388f085-faa7-4aab-88a5-b45708b116eb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_stop',
          user_id: userId,
          warehouse,
          time
        })
      });

      if (response.ok) {
        toast({
          title: 'Остановка добавлена!',
          description: `${warehouse} в ${time}`
        });
        setWarehouse('');
        setTime('');
        fetchRoute();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить остановку',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const removeStop = async (stopId: string) => {
    try {
      await fetch('https://functions.poehali.dev/c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'remove_stop',
          stop_id: stopId
        })
      });
      fetchRoute();
    } catch (error) {
      console.error('Error removing stop:', error);
    }
  };

  const markCompleted = async (stopId: string) => {
    try {
      await fetch('https://functions.poehali.dev/c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mark_completed',
          stop_id: stopId
        })
      });
      toast({
        title: 'Остановка завершена!',
        description: 'Отметка сохранена'
      });
      fetchRoute();
    } catch (error) {
      console.error('Error marking completed:', error);
    }
  };

  return (
    <Card className="border-0 shadow-xl rounded-3xl">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center">
            <Icon name="Route" size={32} className="text-accent" />
          </div>
          <div>
            <CardTitle className="text-2xl">Маршрут следования</CardTitle>
            <CardDescription>Укажите склады на вашем маршруте</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="bg-accent/5 rounded-xl p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="warehouse">Склад</Label>
            <Input
              id="warehouse"
              placeholder="Название склада или адрес"
              value={warehouse}
              onChange={(e) => setWarehouse(e.target.value)}
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Планируемое время прибытия</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="rounded-lg"
            />
          </div>

          <Button 
            onClick={addStop} 
            disabled={loading}
            className="w-full rounded-xl h-11"
          >
            {loading ? (
              <>
                <Icon name="Loader2" size={18} className="animate-spin mr-2" />
                Добавление...
              </>
            ) : (
              <>
                <Icon name="Plus" size={18} className="mr-2" />
                Добавить остановку
              </>
            )}
          </Button>
        </div>

        {route.length > 0 ? (
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Icon name="MapPin" size={18} />
              Остановки на сегодня
            </h4>
            {route.map((stop, index) => (
              <div
                key={stop.id}
                className={`flex items-center gap-3 p-4 rounded-xl border ${
                  stop.completed ? 'bg-green-500/5 border-green-500/20' : 'bg-card'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  stop.completed ? 'bg-green-500 text-white' : 'bg-accent/10 text-accent'
                }`}>
                  {stop.completed ? (
                    <Icon name="Check" size={18} />
                  ) : (
                    <span className="font-semibold text-sm">{index + 1}</span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${stop.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {stop.warehouse}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Icon name="Clock" size={14} />
                    {stop.time}
                  </p>
                </div>

                <div className="flex gap-2">
                  {!stop.completed && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markCompleted(stop.id)}
                      className="rounded-lg"
                    >
                      <Icon name="Check" size={16} />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeStop(stop.id)}
                    className="rounded-lg"
                  >
                    <Icon name="X" size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="Map" size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">Добавьте остановки в ваш маршрут</p>
          </div>
        )}

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <Icon name="Info" size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              Вы будете получать уведомления о грузах, которые находятся на вашем маршруте 
              и требуют доставки на указанные склады
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RouteManager;