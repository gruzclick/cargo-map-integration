import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Switch } from '@/components/ui/switch';

interface MapSettingsProps {
  mapSettings: {
    searchRadius: number;
    maxWaitTime: number;
    autoRefresh: boolean;
    refreshInterval: number;
  };
  setMapSettings: (settings: any) => void;
  onSave: () => void;
}

export const MapSettings = ({ mapSettings, setMapSettings, onSave }: MapSettingsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Параметры карты</CardTitle>
        <CardDescription>Настройки отображения и поиска на карте</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="search-radius">Радиус поиска водителей (км)</Label>
          <div className="flex items-center gap-4">
            <Input
              id="search-radius"
              type="number"
              value={mapSettings.searchRadius}
              onChange={(e) => setMapSettings({ ...mapSettings, searchRadius: parseInt(e.target.value) })}
              className="w-32"
            />
            <span className="text-sm text-muted-foreground">
              Водители в радиусе {mapSettings.searchRadius} км увидят новые заказы
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="wait-time">Максимальное время ожидания водителя (мин)</Label>
          <div className="flex items-center gap-4">
            <Input
              id="wait-time"
              type="number"
              value={mapSettings.maxWaitTime}
              onChange={(e) => setMapSettings({ ...mapSettings, maxWaitTime: parseInt(e.target.value) })}
              className="w-32"
            />
            <span className="text-sm text-muted-foreground">
              Заказ отменится если водитель не примет за {mapSettings.maxWaitTime} минут
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Автообновление позиций</Label>
            <p className="text-sm text-muted-foreground">Обновлять координаты водителей в реальном времени</p>
          </div>
          <Switch
            checked={mapSettings.autoRefresh}
            onCheckedChange={(checked) => setMapSettings({ ...mapSettings, autoRefresh: checked })}
          />
        </div>

        {mapSettings.autoRefresh && (
          <div className="space-y-2">
            <Label htmlFor="refresh-interval">Интервал обновления (сек)</Label>
            <div className="flex items-center gap-4">
              <Input
                id="refresh-interval"
                type="number"
                value={mapSettings.refreshInterval}
                onChange={(e) => setMapSettings({ ...mapSettings, refreshInterval: parseInt(e.target.value) })}
                className="w-32"
              />
              <span className="text-sm text-muted-foreground">
                Карта обновляется каждые {mapSettings.refreshInterval} секунд
              </span>
            </div>
          </div>
        )}

        <Button onClick={onSave} className="w-full">
          <Icon name="Save" size={16} className="mr-2" />
          Сохранить настройки карты
        </Button>
      </CardContent>
    </Card>
  );
};
