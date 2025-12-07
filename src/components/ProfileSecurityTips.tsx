import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export const ProfileSecurityTips = () => {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-500 rounded-lg">
            <Icon name="ShieldCheck" size={20} className="text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">Защита от мошенников</CardTitle>
            <CardDescription className="text-sm">
              Заполните профиль полностью для безопасных сделок
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <TipItem
          icon="UserCheck"
          title="ФИО и телефон"
          description="Обязательны для верификации. Скрытые данные = высокий риск мошенничества"
        />
        <TipItem
          icon="MessageCircle"
          title="Telegram аккаунт"
          description="Позволяет быстро связаться и проверить историю профиля"
        />
        <TipItem
          icon="Building2"
          title="Компания и ИНН"
          description="Подтверждают легальность бизнеса, можно проверить в ЕГРЮЛ/ЕГРИП"
        />
        <TipItem
          icon="Camera"
          title="Фото профиля"
          description="Повышает доверие, показывает что вы реальный человек"
        />
        
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-2">
            <Icon name="AlertTriangle" size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-red-700 dark:text-red-300">
              <p className="font-semibold mb-1">⚠️ Признаки мошенника:</p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                <li>Нет ФИО, телефона или все данные скрыты</li>
                <li>Просит предоплату без документов</li>
                <li>Отказывается от видеозвонка или встречи</li>
                <li>Профиль создан недавно, нет истории сделок</li>
                <li>Цена сильно ниже рынка</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-start gap-2">
            <Icon name="CheckCircle" size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-green-700 dark:text-green-300">
              <p className="font-semibold mb-1">✅ Безопасная сделка:</p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                <li>Полный профиль с реальными данными</li>
                <li>Положительные отзывы и рейтинг</li>
                <li>Готовность подписать договор</li>
                <li>Работа через эскроу или частичная оплата</li>
                <li>Проверенная компания в ЕГРЮЛ</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const TipItem = ({ icon, title, description }: { icon: string; title: string; description: string }) => (
  <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-black/20 transition-colors">
    <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded">
      <Icon name={icon} size={16} className="text-blue-600 dark:text-blue-400" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</p>
      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{description}</p>
    </div>
  </div>
);
