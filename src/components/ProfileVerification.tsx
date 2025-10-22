import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface ProfileVerificationProps {
  userId: string;
  onVerificationComplete?: (method: string) => void;
}

const ProfileVerification = ({ userId, onVerificationComplete }: ProfileVerificationProps) => {
  const { toast } = useToast();
  const [verified, setVerified] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVerification = async (method: 'sber' | 'gosuslugi' | 'tinkoff') => {
    setLoading(true);
    
    const methodNames = {
      sber: 'Сбер ID',
      gosuslugi: 'Госуслуги',
      tinkoff: 'Тинькофф ID'
    };

    toast({
      title: `Переход на ${methodNames[method]}`,
      description: 'Перенаправляем на страницу авторизации...'
    });

    setTimeout(() => {
      setVerified(true);
      setVerificationMethod(methodNames[method]);
      setLoading(false);
      
      toast({
        title: 'Верификация успешна!',
        description: `Ваш профиль подтвержден через ${methodNames[method]}`
      });
      
      onVerificationComplete?.(method);
    }, 2500);
  };

  return (
    <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-white/30 dark:border-gray-700/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="ShieldCheck" size={20} />
          Верификация профиля
          {verified && (
            <Icon name="BadgeCheck" size={20} className="text-green-600 dark:text-green-400 ml-auto" />
          )}
        </CardTitle>
        <CardDescription>
          Подтвердите личность для повышения доверия и доступа ко всем функциям
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!verified ? (
          <>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start gap-3">
                <Icon name="AlertTriangle" size={20} className="text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    Профиль не верифицирован
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                    Подтвердите личность для повышения рейтинга и получения доступа к крупным заказам
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Выберите способ верификации:
              </p>

              <Button
                variant="outline"
                className="w-full justify-start h-auto py-4"
                onClick={() => handleVerification('gosuslugi')}
                disabled={loading}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon name="Building2" size={20} className="text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">Госуслуги</p>
                    <p className="text-xs text-muted-foreground">
                      Быстрая верификация через ЕСИА
                    </p>
                  </div>
                  <Icon name="ChevronRight" size={20} className="text-gray-400" />
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-auto py-4"
                onClick={() => handleVerification('sber')}
                disabled={loading}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon name="Wallet" size={20} className="text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">Сбер ID</p>
                    <p className="text-xs text-muted-foreground">
                      Верификация через Сбербанк
                    </p>
                  </div>
                  <Icon name="ChevronRight" size={20} className="text-gray-400" />
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-auto py-4"
                onClick={() => handleVerification('tinkoff')}
                disabled={loading}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon name="CreditCard" size={20} className="text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">Тинькофф ID</p>
                    <p className="text-xs text-muted-foreground">
                      Подтверждение через Т-Банк
                    </p>
                  </div>
                  <Icon name="ChevronRight" size={20} className="text-gray-400" />
                </div>
              </Button>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                <p className="flex items-start gap-2">
                  <Icon name="Check" size={14} className="mt-0.5 text-green-600 flex-shrink-0" />
                  <span>Увеличение рейтинга доверия</span>
                </p>
                <p className="flex items-start gap-2">
                  <Icon name="Check" size={14} className="mt-0.5 text-green-600 flex-shrink-0" />
                  <span>Доступ к крупным заказам</span>
                </p>
                <p className="flex items-start gap-2">
                  <Icon name="Check" size={14} className="mt-0.5 text-green-600 flex-shrink-0" />
                  <span>Быстрое оформление документов</span>
                </p>
                <p className="flex items-start gap-2">
                  <Icon name="Check" size={14} className="mt-0.5 text-green-600 flex-shrink-0" />
                  <span>Приоритет в поиске</span>
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-start gap-3">
                <Icon name="CheckCircle2" size={20} className="text-green-600 dark:text-green-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    Профиль верифицирован
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    Метод верификации: {verificationMethod}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Преимущества верифицированного профиля:
              </p>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded">
                  <Icon name="TrendingUp" size={16} className="text-blue-600" />
                  <span className="text-xs">Рейтинг +20%</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded">
                  <Icon name="Star" size={16} className="text-yellow-600" />
                  <span className="text-xs">VIP статус</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded">
                  <Icon name="Shield" size={16} className="text-green-600" />
                  <span className="text-xs">Защита</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded">
                  <Icon name="Zap" size={16} className="text-orange-600" />
                  <span className="text-xs">Приоритет</span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setVerified(false);
                setVerificationMethod(null);
              }}
            >
              Сбросить верификацию
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileVerification;
