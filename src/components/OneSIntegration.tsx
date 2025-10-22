import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const OneSIntegration = () => {
  const { toast } = useToast();
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [autoSync, setAutoSync] = useState(true);
  const [syncInterval, setSyncInterval] = useState('5');

  const handleConnect = async () => {
    if (!apiKey || !apiUrl) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля для подключения',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setConnected(true);
      setLoading(false);
      toast({
        title: 'Подключение установлено',
        description: 'Интеграция с 1С успешно настроена'
      });
    }, 1500);
  };

  const handleDisconnect = () => {
    setConnected(false);
    setApiKey('');
    setApiUrl('');
    toast({
      title: 'Отключено',
      description: 'Интеграция с 1С отключена'
    });
  };

  const handleExport = (type: string) => {
    toast({
      title: 'Экспорт запущен',
      description: `Данные (${type}) экспортируются в 1С`
    });
  };

  const handleImport = (type: string) => {
    toast({
      title: 'Импорт запущен',
      description: `Данные (${type}) импортируются из 1С`
    });
  };

  return (
    <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-white/30 dark:border-gray-700/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Box" size={20} />
          Интеграция с 1С
        </CardTitle>
        <CardDescription>
          Синхронизация заказов, грузов и документов с системой 1С
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!connected ? (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-3">
                <Icon name="Info" size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Подключите вашу систему 1С
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    После подключения вы сможете автоматически обмениваться данными между ГрузКлик и 1С
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="api-url">Адрес API 1С</Label>
                <Input
                  id="api-url"
                  type="text"
                  placeholder="https://your-1c-server.com/api"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="api-key">API ключ</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Введите ваш API ключ"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="mt-1.5"
                />
              </div>

              <Button 
                onClick={handleConnect} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                    Подключение...
                  </>
                ) : (
                  <>
                    <Icon name="Link" size={18} className="mr-2" />
                    Подключить 1С
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="export" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="export">Экспорт</TabsTrigger>
              <TabsTrigger value="import">Импорт</TabsTrigger>
              <TabsTrigger value="settings">Настройки</TabsTrigger>
            </TabsList>

            <TabsContent value="export" className="space-y-3 mt-4">
              <p className="text-sm text-muted-foreground mb-3">
                Выберите данные для экспорта в 1С:
              </p>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleExport('Заказы')}
              >
                <Icon name="Package" size={18} className="mr-2" />
                Экспортировать заказы на перевозку
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleExport('Грузы')}
              >
                <Icon name="Box" size={18} className="mr-2" />
                Экспортировать грузы
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleExport('Документы')}
              >
                <Icon name="FileText" size={18} className="mr-2" />
                Экспортировать документы
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleExport('Контрагенты')}
              >
                <Icon name="Users" size={18} className="mr-2" />
                Экспортировать контрагентов
              </Button>
            </TabsContent>

            <TabsContent value="import" className="space-y-3 mt-4">
              <p className="text-sm text-muted-foreground mb-3">
                Импортируйте данные из 1С:
              </p>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleImport('Заявки')}
              >
                <Icon name="Download" size={18} className="mr-2" />
                Импортировать заявки
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleImport('Счета')}
              >
                <Icon name="Receipt" size={18} className="mr-2" />
                Импортировать счета
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleImport('Акты')}
              >
                <Icon name="FileCheck" size={18} className="mr-2" />
                Импортировать акты выполненных работ
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleImport('Клиенты')}
              >
                <Icon name="Building" size={18} className="mr-2" />
                Импортировать базу клиентов
              </Button>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4 mt-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="flex-1">
                  <Label htmlFor="auto-sync" className="text-sm font-medium cursor-pointer">
                    Автоматическая синхронизация
                  </Label>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    Данные будут синхронизироваться автоматически
                  </p>
                </div>
                <Switch
                  id="auto-sync"
                  checked={autoSync}
                  onCheckedChange={setAutoSync}
                />
              </div>

              {autoSync && (
                <div>
                  <Label htmlFor="sync-interval">Интервал синхронизации (минуты)</Label>
                  <Input
                    id="sync-interval"
                    type="number"
                    value={syncInterval}
                    onChange={(e) => setSyncInterval(e.target.value)}
                    className="mt-1.5"
                    min="1"
                    max="60"
                  />
                </div>
              )}

              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Информация о подключении
                </p>
                <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <p>API URL: {apiUrl}</p>
                  <p>Статус: <span className="text-green-600 dark:text-green-400">Подключено</span></p>
                </div>
              </div>

              <Button
                variant="destructive"
                onClick={handleDisconnect}
                className="w-full"
              >
                <Icon name="Unlink" size={18} className="mr-2" />
                Отключить 1С
              </Button>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default OneSIntegration;
