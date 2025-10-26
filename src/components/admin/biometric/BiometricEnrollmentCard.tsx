import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';

interface BiometricEnrollmentCardProps {
  enabled: boolean;
  method: 'fingerprint' | 'face' | 'iris' | 'voice';
  isBiometricAvailable: boolean;
  enrolling: boolean;
  onMethodChange: (method: 'fingerprint' | 'face' | 'iris' | 'voice') => void;
  onEnroll: () => void;
  onRemove: () => void;
}

export const BiometricEnrollmentCard = ({
  enabled,
  method,
  isBiometricAvailable,
  enrolling,
  onMethodChange,
  onEnroll,
  onRemove
}: BiometricEnrollmentCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="ShieldCheck" size={24} className="text-blue-600" />
          Регистрация биометрии
        </CardTitle>
        <CardDescription>
          Настройте метод биометрической аутентификации
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="method">Метод аутентификации</Label>
          <Select value={method} onValueChange={onMethodChange}>
            <SelectTrigger id="method">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fingerprint">
                <div className="flex items-center gap-2">
                  <Icon name="Fingerprint" size={16} />
                  Отпечаток пальца
                </div>
              </SelectItem>
              <SelectItem value="face">
                <div className="flex items-center gap-2">
                  <Icon name="Scan" size={16} />
                  Распознавание лица
                </div>
              </SelectItem>
              <SelectItem value="iris">
                <div className="flex items-center gap-2">
                  <Icon name="Eye" size={16} />
                  Сканирование радужки
                </div>
              </SelectItem>
              <SelectItem value="voice">
                <div className="flex items-center gap-2">
                  <Icon name="Mic" size={16} />
                  Голосовая аутентификация
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {!isBiometricAvailable && method === 'fingerprint' && (
          <Alert>
            <Icon name="AlertTriangle" size={16} />
            <AlertDescription>
              Биометрическая аутентификация недоступна на этом устройстве
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3">
          <Button 
            onClick={onEnroll} 
            disabled={enrolling || (method === 'fingerprint' && !isBiometricAvailable)}
            className="flex-1"
          >
            {enrolling ? (
              <>
                <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                Регистрация...
              </>
            ) : (
              <>
                <Icon name="ScanFace" size={16} className="mr-2" />
                {enabled ? 'Перерегистрировать' : 'Зарегистрировать'}
              </>
            )}
          </Button>
          {enabled && (
            <Button 
              variant="destructive" 
              onClick={onRemove}
            >
              <Icon name="Trash2" size={16} className="mr-2" />
              Удалить
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
