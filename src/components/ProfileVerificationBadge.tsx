import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface ProfileVerificationBadgeProps {
  user: any;
}

export const ProfileVerificationBadge = ({ user }: ProfileVerificationBadgeProps) => {
  const checks = [
    { 
      key: 'full_name', 
      label: 'ФИО', 
      value: user?.full_name,
      required: true 
    },
    { 
      key: 'phone_number', 
      label: 'Телефон', 
      value: user?.phone_number,
      required: true 
    },
    { 
      key: 'telegram', 
      label: 'Telegram', 
      value: user?.telegram,
      required: false 
    },
    { 
      key: 'company', 
      label: 'Компания', 
      value: user?.company,
      required: false 
    },
    { 
      key: 'inn', 
      label: 'ИНН', 
      value: user?.inn,
      required: false 
    },
    { 
      key: 'avatar', 
      label: 'Фото профиля', 
      value: user?.avatar,
      required: false 
    },
  ];

  const completedRequired = checks.filter(c => c.required && c.value).length;
  const totalRequired = checks.filter(c => c.required).length;
  const completedOptional = checks.filter(c => !c.required && c.value).length;
  const totalOptional = checks.filter(c => !c.required).length;
  
  const completedAll = checks.filter(c => c.value).length;
  const totalAll = checks.length;
  const progressPercent = Math.round((completedAll / totalAll) * 100);

  const isFullyVerified = completedRequired === totalRequired && completedAll === totalAll;
  const isPartiallyVerified = completedRequired === totalRequired;

  return (
    <Card className={`border-2 ${
      isFullyVerified 
        ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-500' 
        : isPartiallyVerified
        ? 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-500'
        : 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 border-orange-500'
    }`}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full ${
            isFullyVerified 
              ? 'bg-green-500' 
              : isPartiallyVerified 
              ? 'bg-blue-500' 
              : 'bg-orange-500'
          }`}>
            <Icon 
              name={isFullyVerified ? "ShieldCheck" : isPartiallyVerified ? "Shield" : "ShieldAlert"} 
              size={28} 
              className="text-white" 
            />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {isFullyVerified ? 'Профиль полностью верифицирован' : 
                 isPartiallyVerified ? 'Профиль частично заполнен' : 
                 'Профиль не заполнен'}
              </h3>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {isFullyVerified ? 'Отлично! Все данные заполнены. Контрагенты будут вам доверять.' :
               isPartiallyVerified ? 'Заполните рекомендуемые поля для повышения доверия.' :
               'Заполните обязательные поля для безопасных сделок.'}
            </p>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Прогресс заполнения
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {progressPercent}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      isFullyVerified ? 'bg-green-500' : 
                      isPartiallyVerified ? 'bg-blue-500' : 
                      'bg-orange-500'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {checks.map((check) => (
                  <div 
                    key={check.key}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                      check.value 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                        : check.required
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <Icon 
                      name={check.value ? "CheckCircle2" : check.required ? "XCircle" : "Circle"} 
                      size={14}
                      className="flex-shrink-0"
                    />
                    <span className="truncate">
                      {check.label}
                      {check.required && <span className="text-red-500 ml-0.5">*</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {!isFullyVerified && (
              <div className="mt-4 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <Icon name="Info" size={12} className="inline mr-1" />
                  {!isPartiallyVerified ? (
                    <span className="font-medium text-red-600 dark:text-red-400">
                      Заполните ФИО и телефон для доступа к сделкам
                    </span>
                  ) : (
                    <span>
                      Заполните остальные поля для увеличения доверия: {totalAll - completedAll} из {totalAll}
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
