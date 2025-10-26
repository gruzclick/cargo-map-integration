import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface BiometricStatusProps {
  enabled: boolean;
  method: string;
  deviceId: string;
  registeredDate: string;
  lastUsed: string;
}

export const BiometricStatus = ({ 
  enabled, 
  method, 
  deviceId, 
  registeredDate, 
  lastUsed 
}: BiometricStatusProps) => {
  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'fingerprint': return 'Fingerprint';
      case 'face': return 'Scan';
      case 'iris': return 'Eye';
      case 'voice': return 'Mic';
      default: return 'Shield';
    }
  };

  const getMethodName = (method: string) => {
    switch (method) {
      case 'fingerprint': return 'Отпечаток пальца';
      case 'face': return 'Распознавание лица';
      case 'iris': return 'Сканирование радужки';
      case 'voice': return 'Голосовая аутентификация';
      default: return method;
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Не указано';
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-purple-200 dark:border-purple-800">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <Icon name={getMethodIcon(method)} size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Биометрическая аутентификация</h3>
              <p className="text-sm text-muted-foreground">
                {enabled ? getMethodName(method) : 'Не активирована'}
              </p>
            </div>
          </div>
          <Badge variant={enabled ? "default" : "secondary"} className={enabled ? "bg-green-600" : ""}>
            {enabled ? 'Активна' : 'Неактивна'}
          </Badge>
        </div>

        {enabled && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-purple-200 dark:border-purple-800">
            <div>
              <p className="text-xs text-muted-foreground mb-1">ID устройства</p>
              <p className="text-sm font-mono truncate">{deviceId || 'Не указан'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Дата регистрации</p>
              <p className="text-sm">{formatDate(registeredDate)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Последнее использование</p>
              <p className="text-sm">{formatDate(lastUsed)}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
