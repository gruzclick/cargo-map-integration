import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';


interface LimitsData {
  clientMaxOrders: number;
  clientMaxCancels: number;
  clientCreditLimit: number;
  driverMaxHours: number;
  driverBreakAfter: number;
  driverMaxQueue: number;
  minRating: number;
  apiRequestsPerMinute: number;
  apiRequestsPerHour: number;
  apiBlockDuration: number;
}

export const LimitsSettings = () => {
  const { toast } = useToast();

  const [limits, setLimits] = useState<LimitsData>({
    clientMaxOrders: 10,
    clientMaxCancels: 3,
    clientCreditLimit: 50000,
    driverMaxHours: 12,
    driverBreakAfter: 4,
    driverMaxQueue: 5,
    minRating: 3.0,
    apiRequestsPerMinute: 100,
    apiRequestsPerHour: 1000,
    apiBlockDuration: 1
  });

  useEffect(() => {
    loadLimits();
  }, []);

  const loadLimits = () => {
    try {
      const saved = localStorage.getItem('system_limits');
      if (saved) {
        setLimits(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Ошибка загрузки лимитов:', error);
    }
  };

  const saveLimits = () => {
    try {
      localStorage.setItem('system_limits', JSON.stringify(limits));
      toast({
        title: 'Сохранено',
        description: 'Лимиты успешно обновлены'
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить изменения',
        variant: 'destructive'
      });
    }
  };
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Системные лимиты</CardTitle>
            <CardDescription>Ограничения для пользователей и операций</CardDescription>
          </div>
          <Button onClick={saveLimits} variant="default">
            <Icon name="Save" size={16} className="mr-2" />
            Сохранить все
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Icon name="Users" size={24} className="text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-3">Лимиты для клиентов</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Label className="w-48 text-sm">Максимум активных заказов:</Label>
                  <Input
                    type="number"
                    value={limits.clientMaxOrders}
                    onChange={(e) => setLimits({...limits, clientMaxOrders: parseInt(e.target.value) || 0})}
                    className="w-24"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Label className="w-48 text-sm">Максимум отмен в день:</Label>
                  <Input
                    type="number"
                    value={limits.clientMaxCancels}
                    onChange={(e) => setLimits({...limits, clientMaxCancels: parseInt(e.target.value) || 0})}
                    className="w-24"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Label className="w-48 text-sm">Кредитный лимит (₽):</Label>
                  <Input
                    type="number"
                    value={limits.clientCreditLimit}
                    onChange={(e) => setLimits({...limits, clientCreditLimit: parseInt(e.target.value) || 0})}
                    className="w-32"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-blue-500/10 p-3">
              <Icon name="Truck" size={24} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-3">Лимиты для водителей</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Label className="w-48 text-sm">Максимум часов в сутки:</Label>
                  <Input
                    type="number"
                    value={limits.driverMaxHours}
                    onChange={(e) => setLimits({...limits, driverMaxHours: parseInt(e.target.value) || 0})}
                    className="w-24"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Label className="w-48 text-sm">Перерыв после (часов):</Label>
                  <Input
                    type="number"
                    value={limits.driverBreakAfter}
                    onChange={(e) => setLimits({...limits, driverBreakAfter: parseInt(e.target.value) || 0})}
                    className="w-24"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Label className="w-48 text-sm">Заказов в очереди:</Label>
                  <Input
                    type="number"
                    value={limits.driverMaxQueue}
                    onChange={(e) => setLimits({...limits, driverMaxQueue: parseInt(e.target.value) || 0})}
                    className="w-24"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Label className="w-48 text-sm">Минимальный рейтинг:</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={limits.minRating}
                    onChange={(e) => setLimits({...limits, minRating: parseFloat(e.target.value) || 0})}
                    className="w-24"
                  />
                  <span className="text-xs text-muted-foreground">
                    (от 0 до 5)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-orange-500/10 p-3">
              <Icon name="ShieldAlert" size={24} className="text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-3">Безопасность API</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Label className="w-48 text-sm">Запросов в минуту:</Label>
                  <Input
                    type="number"
                    value={limits.apiRequestsPerMinute}
                    onChange={(e) => setLimits({...limits, apiRequestsPerMinute: parseInt(e.target.value) || 0})}
                    className="w-24"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Label className="w-48 text-sm">Запросов в час:</Label>
                  <Input
                    type="number"
                    value={limits.apiRequestsPerHour}
                    onChange={(e) => setLimits({...limits, apiRequestsPerHour: parseInt(e.target.value) || 0})}
                    className="w-24"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Label className="w-48 text-sm">Блокировка (часов):</Label>
                  <Input
                    type="number"
                    value={limits.apiBlockDuration}
                    onChange={(e) => setLimits({...limits, apiBlockDuration: parseInt(e.target.value) || 0})}
                    className="w-24"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>


      </CardContent>
    </Card>
  );
};