import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';

export default function AdminSettings() {
  const { toast } = useToast();
  const [mapSettings, setMapSettings] = useState({
    searchRadius: 50,
    maxWaitTime: 15,
    autoRefresh: true,
    refreshInterval: 30
  });
  const [orderSettings, setOrderSettings] = useState({
    minOrderAmount: 500,
    maxOrderAmount: 100000,
    cancelTimeout: 5,
    autoAssign: true
  });
  const [apiKeys, setApiKeys] = useState({
    yandexMaps: '••••••••••••',
    payment: '••••••••••••',
    sms: '••••••••••••'
  });
  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupInterval: 24,
    lastBackup: '2025-01-25 03:00'
  });

  const handleSaveMapSettings = () => {
    toast({
      title: 'Настройки карты сохранены',
      description: 'Изменения вступят в силу немедленно'
    });
  };

  const handleSaveOrderSettings = () => {
    toast({
      title: 'Настройки заказов сохранены',
      description: 'Новые параметры применены'
    });
  };

  const handleBackupNow = () => {
    toast({
      title: 'Резервное копирование запущено',
      description: 'Процесс займет несколько минут'
    });
    setTimeout(() => {
      setBackupSettings({ ...backupSettings, lastBackup: new Date().toLocaleString('ru-RU') });
      toast({
        title: 'Резервная копия создана',
        description: 'Все данные успешно сохранены'
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => window.history.back()}>
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Icon name="Settings" size={32} />
              Настройки системы
            </h1>
            <p className="text-muted-foreground">Конфигурация платформы и интеграции</p>
          </div>
        </div>

        <Tabs defaultValue="map" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="map">Карта</TabsTrigger>
            <TabsTrigger value="orders">Заказы</TabsTrigger>
            <TabsTrigger value="limits">Лимиты</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
            <TabsTrigger value="backup">Backup</TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-4">
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
                    onCheckedChange={(val) => setMapSettings({ ...mapSettings, autoRefresh: val })}
                  />
                </div>

                {mapSettings.autoRefresh && (
                  <div className="space-y-2">
                    <Label htmlFor="refresh-interval">Интервал обновления (сек)</Label>
                    <Input
                      id="refresh-interval"
                      type="number"
                      value={mapSettings.refreshInterval}
                      onChange={(e) => setMapSettings({ ...mapSettings, refreshInterval: parseInt(e.target.value) })}
                      className="w-32"
                    />
                  </div>
                )}

                <Button onClick={handleSaveMapSettings}>
                  <Icon name="Save" size={16} className="mr-2" />
                  Сохранить настройки карты
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Параметры заказов</CardTitle>
                <CardDescription>Настройки создания и обработки заказов</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="min-amount">Минимальная сумма заказа (₽)</Label>
                  <Input
                    id="min-amount"
                    type="number"
                    value={orderSettings.minOrderAmount}
                    onChange={(e) => setOrderSettings({ ...orderSettings, minOrderAmount: parseInt(e.target.value) })}
                    className="w-48"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-amount">Максимальная сумма заказа (₽)</Label>
                  <Input
                    id="max-amount"
                    type="number"
                    value={orderSettings.maxOrderAmount}
                    onChange={(e) => setOrderSettings({ ...orderSettings, maxOrderAmount: parseInt(e.target.value) })}
                    className="w-48"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cancel-timeout">Таймаут отмены без штрафа (мин)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="cancel-timeout"
                      type="number"
                      value={orderSettings.cancelTimeout}
                      onChange={(e) => setOrderSettings({ ...orderSettings, cancelTimeout: parseInt(e.target.value) })}
                      className="w-32"
                    />
                    <span className="text-sm text-muted-foreground">
                      Клиент может отменить заказ без штрафа в первые {orderSettings.cancelTimeout} минут
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Автоматическое назначение водителя</Label>
                    <p className="text-sm text-muted-foreground">Система сама найдет ближайшего водителя</p>
                  </div>
                  <Switch
                    checked={orderSettings.autoAssign}
                    onCheckedChange={(val) => setOrderSettings({ ...orderSettings, autoAssign: val })}
                  />
                </div>

                <Button onClick={handleSaveOrderSettings}>
                  <Icon name="Save" size={16} className="mr-2" />
                  Сохранить настройки заказов
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="limits" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Лимиты пользователей</CardTitle>
                <CardDescription>Ограничения на действия пользователей</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Максимум активных заказов на одного клиента</Label>
                  <Input type="number" defaultValue="3" className="w-32" />
                </div>

                <div className="space-y-2">
                  <Label>Максимум одновременных рейсов на водителя</Label>
                  <Input type="number" defaultValue="1" className="w-32" />
                </div>

                <div className="space-y-2">
                  <Label>Максимум попыток создания заказа в час</Label>
                  <Input type="number" defaultValue="10" className="w-32" />
                </div>

                <div className="space-y-2">
                  <Label>Минимальный рейтинг водителя для работы</Label>
                  <Input type="number" step="0.1" defaultValue="3.5" className="w-32" />
                </div>

                <Button>
                  <Icon name="Save" size={16} className="mr-2" />
                  Сохранить лимиты
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API ключи и интеграции</CardTitle>
                <CardDescription>Подключенные внешние сервисы</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="yandex-api">Яндекс.Карты API ключ</Label>
                  <div className="flex gap-2">
                    <Input
                      id="yandex-api"
                      type="password"
                      value={apiKeys.yandexMaps}
                      onChange={(e) => setApiKeys({ ...apiKeys, yandexMaps: e.target.value })}
                    />
                    <Button variant="outline">
                      <Icon name="Eye" size={16} />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-api">Платежная система API</Label>
                  <div className="flex gap-2">
                    <Input
                      id="payment-api"
                      type="password"
                      value={apiKeys.payment}
                      onChange={(e) => setApiKeys({ ...apiKeys, payment: e.target.value })}
                    />
                    <Button variant="outline">
                      <Icon name="Eye" size={16} />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sms-api">SMS-сервис API</Label>
                  <div className="flex gap-2">
                    <Input
                      id="sms-api"
                      type="password"
                      value={apiKeys.sms}
                      onChange={(e) => setApiKeys({ ...apiKeys, sms: e.target.value })}
                    />
                    <Button variant="outline">
                      <Icon name="Eye" size={16} />
                    </Button>
                  </div>
                </div>

                <Button>
                  <Icon name="Save" size={16} className="mr-2" />
                  Сохранить API ключи
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Резервное копирование</CardTitle>
                <CardDescription>Автоматическое сохранение данных</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Автоматический backup</Label>
                    <p className="text-sm text-muted-foreground">Создавать резервные копии по расписанию</p>
                  </div>
                  <Switch
                    checked={backupSettings.autoBackup}
                    onCheckedChange={(val) => setBackupSettings({ ...backupSettings, autoBackup: val })}
                  />
                </div>

                {backupSettings.autoBackup && (
                  <div className="space-y-2">
                    <Label>Интервал резервного копирования (часы)</Label>
                    <Input
                      type="number"
                      value={backupSettings.backupInterval}
                      onChange={(e) => setBackupSettings({ ...backupSettings, backupInterval: parseInt(e.target.value) })}
                      className="w-32"
                    />
                  </div>
                )}

                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Последняя резервная копия</p>
                      <p className="text-sm text-muted-foreground">{backupSettings.lastBackup}</p>
                    </div>
                    <Icon name="CheckCircle" size={24} className="text-green-500" />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleBackupNow}>
                    <Icon name="Database" size={16} className="mr-2" />
                    Создать резервную копию сейчас
                  </Button>
                  <Button variant="outline" onClick={() => toast({ title: 'Скачивание начато', description: 'Файл резервной копии загружается' })}>
                    <Icon name="Download" size={16} className="mr-2" />
                    Скачать последний backup
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>История резервных копий</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['2025-01-25 03:00', '2025-01-24 03:00', '2025-01-23 03:00'].map((date, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon name="Archive" size={20} className="text-muted-foreground" />
                        <div>
                          <p className="font-medium">backup_{date.replace(/[:\s]/g, '_')}.sql</p>
                          <p className="text-sm text-muted-foreground">{date}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => toast({ title: 'Скачивание...', description: `Загрузка backup от ${date}` })}>
                          <Icon name="Download" size={16} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => window.confirm('Восстановить данные из этой копии?') && toast({ title: 'Восстановление...', description: 'База данных восстанавливается' })}>
                          <Icon name="RotateCcw" size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}