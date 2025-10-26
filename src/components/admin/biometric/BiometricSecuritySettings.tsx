import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';

interface BiometricSecuritySettingsProps {
  backupPin: string;
  requirePinBackup: boolean;
  autoLockTimeout: number;
  allowFallbackPassword: boolean;
  saving: boolean;
  onBackupPinChange: (value: string) => void;
  onRequirePinBackupChange: (value: boolean) => void;
  onAutoLockTimeoutChange: (value: number) => void;
  onAllowFallbackPasswordChange: (value: boolean) => void;
  onSave: () => void;
}

export const BiometricSecuritySettings = ({
  backupPin,
  requirePinBackup,
  autoLockTimeout,
  allowFallbackPassword,
  saving,
  onBackupPinChange,
  onRequirePinBackupChange,
  onAutoLockTimeoutChange,
  onAllowFallbackPasswordChange,
  onSave
}: BiometricSecuritySettingsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Settings" size={24} className="text-gray-600" />
          Настройки безопасности
        </CardTitle>
        <CardDescription>
          Дополнительные параметры биометрической защиты
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="backup-pin">Резервный PIN-код</Label>
          <Input
            id="backup-pin"
            type="password"
            placeholder="Введите 4-значный PIN"
            value={backupPin}
            onChange={(e) => onBackupPinChange(e.target.value)}
            maxLength={4}
          />
          <p className="text-xs text-muted-foreground">
            Используется при недоступности биометрии
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Требовать резервный PIN</Label>
            <p className="text-xs text-muted-foreground">
              Обязательная установка резервного PIN-кода
            </p>
          </div>
          <Switch
            checked={requirePinBackup}
            onCheckedChange={onRequirePinBackupChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeout">Таймаут автоблокировки (мин)</Label>
          <Input
            id="timeout"
            type="number"
            min="1"
            max="60"
            value={autoLockTimeout}
            onChange={(e) => onAutoLockTimeoutChange(Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">
            Время бездействия до требования повторной аутентификации
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Разрешить пароль как резерв</Label>
            <p className="text-xs text-muted-foreground">
              Возможность входа по паролю при сбое биометрии
            </p>
          </div>
          <Switch
            checked={allowFallbackPassword}
            onCheckedChange={onAllowFallbackPasswordChange}
          />
        </div>

        <Button 
          onClick={onSave} 
          disabled={saving}
          className="w-full"
        >
          {saving ? (
            <>
              <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
              Сохранение...
            </>
          ) : (
            <>
              <Icon name="Save" size={16} className="mr-2" />
              Сохранить настройки
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
