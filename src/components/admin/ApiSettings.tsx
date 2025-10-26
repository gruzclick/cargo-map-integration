import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface ApiSettingsProps {
  apiKeys: {
    yandexMaps: string;
    payment: string;
    sms: string;
  };
  setApiKeys: (keys: any) => void;
  showApiKeys: {
    yandexMaps: boolean;
    payment: boolean;
    sms: boolean;
  };
  setShowApiKeys: (show: any) => void;
  onSave: () => void;
}

export const ApiSettings = ({ 
  apiKeys, 
  setApiKeys, 
  showApiKeys, 
  setShowApiKeys, 
  onSave 
}: ApiSettingsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API интеграции</CardTitle>
        <CardDescription>Настройка внешних сервисов и API ключей</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="yandex-key">API ключ Яндекс Карты</Label>
          <div className="flex gap-2">
            <Input
              id="yandex-key"
              type={showApiKeys.yandexMaps ? 'text' : 'password'}
              value={apiKeys.yandexMaps}
              onChange={(e) => setApiKeys({ ...apiKeys, yandexMaps: e.target.value })}
              placeholder="Введите ключ API"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowApiKeys({ ...showApiKeys, yandexMaps: !showApiKeys.yandexMaps })}
            >
              <Icon name={showApiKeys.yandexMaps ? 'EyeOff' : 'Eye'} size={16} />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment-key">API ключ платежной системы</Label>
          <div className="flex gap-2">
            <Input
              id="payment-key"
              type={showApiKeys.payment ? 'text' : 'password'}
              value={apiKeys.payment}
              onChange={(e) => setApiKeys({ ...apiKeys, payment: e.target.value })}
              placeholder="Введите ключ API"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowApiKeys({ ...showApiKeys, payment: !showApiKeys.payment })}
            >
              <Icon name={showApiKeys.payment ? 'EyeOff' : 'Eye'} size={16} />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sms-key">API ключ SMS-сервиса</Label>
          <div className="flex gap-2">
            <Input
              id="sms-key"
              type={showApiKeys.sms ? 'text' : 'password'}
              value={apiKeys.sms}
              onChange={(e) => setApiKeys({ ...apiKeys, sms: e.target.value })}
              placeholder="Введите ключ API"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowApiKeys({ ...showApiKeys, sms: !showApiKeys.sms })}
            >
              <Icon name={showApiKeys.sms ? 'EyeOff' : 'Eye'} size={16} />
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950 p-4">
          <div className="flex gap-3">
            <Icon name="ShieldAlert" size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                Внимание!
              </p>
              <p className="text-amber-700 dark:text-amber-300">
                API ключи хранятся в зашифрованном виде. Никогда не делитесь ими с третьими лицами.
              </p>
            </div>
          </div>
        </div>

        <Button onClick={onSave} className="w-full">
          <Icon name="Save" size={16} className="mr-2" />
          Сохранить API ключи
        </Button>
      </CardContent>
    </Card>
  );
};
