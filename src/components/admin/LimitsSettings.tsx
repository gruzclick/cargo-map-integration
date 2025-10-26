import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface LimitsData {
  clientMaxOrders: number;
  clientMaxCancels: number;
  clientCreditLimit: number;
  driverMaxHours: number;
  driverBreakAfter: number;
  driverMaxQueue: number;
  apiRequestsPerMinute: number;
  apiRequestsPerHour: number;
  apiBlockDuration: number;
}

export const LimitsSettings = () => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [limits, setLimits] = useState<LimitsData>({
    clientMaxOrders: 10,
    clientMaxCancels: 3,
    clientCreditLimit: 50000,
    driverMaxHours: 12,
    driverBreakAfter: 4,
    driverMaxQueue: 5,
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
        <CardTitle>Системные лимиты</CardTitle>
        <CardDescription>Ограничения для пользователей и операций</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Icon name="Users" size={24} className="text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Лимиты для клиентов</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Icon name="Check" size={16} className="text-green-600" />
                  Максимум {limits.clientMaxOrders} активных заказов одновременно
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Check" size={16} className="text-green-600" />
                  До {limits.clientMaxCancels}-х отмен заказов в день без штрафа
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Check" size={16} className="text-green-600" />
                  Кредитный лимит {limits.clientCreditLimit.toLocaleString()} ₽ для корпоративных клиентов
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-blue-500/10 p-3">
              <Icon name="Truck" size={24} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Лимиты для водителей</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Icon name="Check" size={16} className="text-green-600" />
                  Максимум {limits.driverMaxHours} часов работы в сутки
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Check" size={16} className="text-green-600" />
                  Обязательный перерыв после {limits.driverBreakAfter} часов вождения
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Check" size={16} className="text-green-600" />
                  До {limits.driverMaxQueue} активных заказов в очереди
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-orange-500/10 p-3">
              <Icon name="ShieldAlert" size={24} className="text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Безопасность API</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Icon name="Check" size={16} className="text-green-600" />
                  {limits.apiRequestsPerMinute} запросов в минуту на IP адрес
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Check" size={16} className="text-green-600" />
                  {limits.apiRequestsPerHour} запросов в час на API ключ
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Check" size={16} className="text-green-600" />
                  Блокировка на {limits.apiBlockDuration} час при превышении лимитов
                </li>
              </ul>
            </div>
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Icon name="Settings" size={16} className="mr-2" />
              Настроить пользовательские лимиты
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Настройка лимитов</DialogTitle>
              <DialogDescription>
                Измените лимиты для пользователей и системы
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <h3 className="font-semibold">Лимиты клиентов</h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>Максимум активных заказов</Label>
                    <Input
                      type="number"
                      value={limits.clientMaxOrders}
                      onChange={(e) => setLimits({...limits, clientMaxOrders: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Максимум отмен в день</Label>
                    <Input
                      type="number"
                      value={limits.clientMaxCancels}
                      onChange={(e) => setLimits({...limits, clientMaxCancels: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Кредитный лимит (₽)</Label>
                    <Input
                      type="number"
                      value={limits.clientCreditLimit}
                      onChange={(e) => setLimits({...limits, clientCreditLimit: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Лимиты водителей</h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>Максимум часов в сутки</Label>
                    <Input
                      type="number"
                      value={limits.driverMaxHours}
                      onChange={(e) => setLimits({...limits, driverMaxHours: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Перерыв после (часов)</Label>
                    <Input
                      type="number"
                      value={limits.driverBreakAfter}
                      onChange={(e) => setLimits({...limits, driverBreakAfter: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Максимум заказов в очереди</Label>
                    <Input
                      type="number"
                      value={limits.driverMaxQueue}
                      onChange={(e) => setLimits({...limits, driverMaxQueue: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Безопасность API</h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>Запросов в минуту</Label>
                    <Input
                      type="number"
                      value={limits.apiRequestsPerMinute}
                      onChange={(e) => setLimits({...limits, apiRequestsPerMinute: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Запросов в час</Label>
                    <Input
                      type="number"
                      value={limits.apiRequestsPerHour}
                      onChange={(e) => setLimits({...limits, apiRequestsPerHour: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Блокировка (часов)</Label>
                    <Input
                      type="number"
                      value={limits.apiBlockDuration}
                      onChange={(e) => setLimits({...limits, apiBlockDuration: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Отмена
              </Button>
              <Button onClick={saveLimits}>
                <Icon name="Save" size={16} className="mr-2" />
                Сохранить
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};