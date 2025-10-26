import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

export const LimitsSettings = () => {
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
                  Максимум 10 активных заказов одновременно
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Check" size={16} className="text-green-600" />
                  До 3-х отмен заказов в день без штрафа
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Check" size={16} className="text-green-600" />
                  Кредитный лимит 50,000 ₽ для корпоративных клиентов
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
                  Максимум 12 часов работы в сутки
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Check" size={16} className="text-green-600" />
                  Обязательный перерыв после 4 часов вождения
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Check" size={16} className="text-green-600" />
                  До 5 активных заказов в очереди
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
                  100 запросов в минуту на IP адрес
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Check" size={16} className="text-green-600" />
                  1000 запросов в час на API ключ
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Check" size={16} className="text-green-600" />
                  Блокировка на 1 час при превышении лимитов
                </li>
              </ul>
            </div>
          </div>
        </div>

        <Button variant="outline" className="w-full">
          <Icon name="Settings" size={16} className="mr-2" />
          Настроить пользовательские лимиты
        </Button>
      </CardContent>
    </Card>
  );
};
