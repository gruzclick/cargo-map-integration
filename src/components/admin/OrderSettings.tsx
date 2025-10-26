import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Switch } from '@/components/ui/switch';

interface OrderSettingsProps {
  orderSettings: {
    minOrderAmount: number;
    maxOrderAmount: number;
    cancelTimeout: number;
    autoAssign: boolean;
  };
  setOrderSettings: (settings: any) => void;
  onSave: () => void;
}

export const OrderSettings = ({ orderSettings, setOrderSettings, onSave }: OrderSettingsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Настройки заказов</CardTitle>
        <CardDescription>Управление параметрами создания и обработки заказов</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="min-order">Минимальная сумма заказа (₽)</Label>
          <div className="flex items-center gap-4">
            <Input
              id="min-order"
              type="number"
              value={orderSettings.minOrderAmount}
              onChange={(e) => setOrderSettings({ ...orderSettings, minOrderAmount: parseInt(e.target.value) })}
              className="w-32"
            />
            <span className="text-sm text-muted-foreground">
              Заказы дешевле {orderSettings.minOrderAmount} ₽ не будут приняты
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="max-order">Максимальная сумма заказа (₽)</Label>
          <div className="flex items-center gap-4">
            <Input
              id="max-order"
              type="number"
              value={orderSettings.maxOrderAmount}
              onChange={(e) => setOrderSettings({ ...orderSettings, maxOrderAmount: parseInt(e.target.value) })}
              className="w-32"
            />
            <span className="text-sm text-muted-foreground">
              Заказы дороже {orderSettings.maxOrderAmount} ₽ требуют подтверждения
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cancel-timeout">Таймаут отмены заказа (мин)</Label>
          <div className="flex items-center gap-4">
            <Input
              id="cancel-timeout"
              type="number"
              value={orderSettings.cancelTimeout}
              onChange={(e) => setOrderSettings({ ...orderSettings, cancelTimeout: parseInt(e.target.value) })}
              className="w-32"
            />
            <span className="text-sm text-muted-foreground">
              Клиент может отменить заказ бесплатно в течение {orderSettings.cancelTimeout} минут
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Автоматическое назначение водителя</Label>
            <p className="text-sm text-muted-foreground">
              Система автоматически назначит ближайшего свободного водителя
            </p>
          </div>
          <Switch
            checked={orderSettings.autoAssign}
            onCheckedChange={(checked) => setOrderSettings({ ...orderSettings, autoAssign: checked })}
          />
        </div>

        <Button onClick={onSave} className="w-full">
          <Icon name="Save" size={16} className="mr-2" />
          Сохранить настройки заказов
        </Button>
      </CardContent>
    </Card>
  );
};
