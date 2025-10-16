import { Card } from './ui/card';
import Icon from './ui/icon';

export default function SecurityFeatures() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">Безопасность платформы</h2>

      <Card className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name="Shield" size={20} className="text-green-400" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Проверка документов</h3>
            <p className="text-sm text-muted-foreground">
              Все водители проходят обязательную проверку паспорта и водительских прав. 
              Документы проверяются модераторами в течение 24 часов.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name="MessageSquare" size={20} className="text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Защищённый чат</h3>
            <p className="text-sm text-muted-foreground">
              Вся переписка контролируется. Запрещена передача личных контактов. 
              Автоматическая блокировка номеров телефонов и ссылок на мессенджеры.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name="Star" size={20} className="text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Система рейтингов</h3>
            <p className="text-sm text-muted-foreground">
              Честные отзывы после каждой доставки. Водители с рейтингом ниже 4.0 
              получают предупреждение, ниже 3.5 — блокировку аккаунта.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name="Camera" size={20} className="text-yellow-400" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Фотофиксация</h3>
            <p className="text-sm text-muted-foreground">
              Обязательное фото груза при создании заявки и после доставки. 
              Это защищает обе стороны от споров о состоянии груза.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name="MapPin" size={20} className="text-red-400" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Отслеживание в реальном времени</h3>
            <p className="text-sm text-muted-foreground">
              Клиент всегда видит где находится водитель с его грузом. 
              GPS-данные передаются каждые 10 секунд во время активной доставки.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name="AlertTriangle" size={20} className="text-orange-400" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Система жалоб</h3>
            <p className="text-sm text-muted-foreground">
              Возможность подать жалобу на нарушение правил. Модерация проверяет 
              жалобы в течение 2 часов. При подтверждении — штраф или блокировка.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name="FileText" size={20} className="text-cyan-400" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">История сделок</h3>
            <p className="text-sm text-muted-foreground">
              Все заказы сохраняются в истории с полной информацией: фото, адреса, 
              время, стоимость. Доступ к истории в любой момент.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name="Lock" size={20} className="text-pink-400" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Защита данных</h3>
            <p className="text-sm text-muted-foreground">
              Все данные шифруются. Номера телефонов скрыты. Личная информация 
              доступна только при активном заказе и удаляется после завершения.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-blue-500/10 border-blue-500/30">
        <div className="flex gap-3">
          <Icon name="Info" size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-400">
            <p className="font-semibold mb-1">Информационная платформа</p>
            <p>
              Груз Клик — информационная платформа для поиска перевозчиков. 
              Мы не заключаем договоры и не несём ответственности за исполнение сделок. 
              Все споры решаются напрямую между клиентом и перевозчиком.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
