import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface SecurityRecommendationsProps {
  onClose: () => void;
}

const SecurityRecommendations = ({ onClose }: SecurityRecommendationsProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <Icon name="Shield" size={24} className="text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Правила безопасности</h2>
              <p className="text-sm text-gray-500">Защита от мошенников</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
            <h3 className="font-bold text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
              <Icon name="AlertTriangle" size={20} />
              Как мошенники могут вас обмануть
            </h3>
            <ul className="space-y-2 text-sm text-red-800 dark:text-red-200">
              <li className="flex items-start gap-2">
                <Icon name="X" size={16} className="flex-shrink-0 mt-0.5" />
                <span><strong>Поддельные документы:</strong> Водитель предоставляет чужие фото авто или поддельное ВУ</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="X" size={16} className="flex-shrink-0 mt-0.5" />
                <span><strong>Пропажа груза:</strong> Водитель забирает груз и исчезает с ним</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="X" size={16} className="flex-shrink-0 mt-0.5" />
                <span><strong>Замена груза:</strong> Подмена качественного товара на бракованный</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="X" size={16} className="flex-shrink-0 mt-0.5" />
                <span><strong>Фиктивные заказы:</strong> Грузоотправитель создает заявку, но груза не существует</span>
              </li>

            </ul>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
            <h3 className="font-bold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
              <Icon name="ShieldCheck" size={20} />
              Как мы защищаем пользователей
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="Camera" size={16} className="text-white" />
                </div>
                <div>
                  <div className="font-medium text-sm">Фото-верификация</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Автоматическая проверка читаемости госномера на фото. Минимальное разрешение 800×600px.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="Star" size={16} className="text-white" />
                </div>
                <div>
                  <div className="font-medium text-sm">Рейтинговая система</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    После каждой доставки обе стороны оставляют отзыв. Пользователи с низким рейтингом блокируются.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="MapPin" size={16} className="text-white" />
                </div>
                <div>
                  <div className="font-medium text-sm">Геотрекинг</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Отслеживание местоположения автомобиля в режиме реального времени.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="Image" size={16} className="text-white" />
                </div>
                <div>
                  <div className="font-medium text-sm">Фото подтверждения</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Обязательное фото груза при погрузке и выгрузке с timestamp.
                  </div>
                </div>
              </div>


            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
            <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
              <Icon name="Lightbulb" size={20} />
              Рекомендации для безопасной работы
            </h3>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li className="flex items-start gap-2">
                <Icon name="CheckCircle" size={16} className="flex-shrink-0 mt-0.5 text-blue-600" />
                <span><strong>Проверяйте рейтинг:</strong> Работайте только с водителями/отправителями с рейтингом 4.5+</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="CheckCircle" size={16} className="flex-shrink-0 mt-0.5 text-blue-600" />
                <span><strong>Читайте отзывы:</strong> Изучите отзывы других пользователей перед сделкой</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="CheckCircle" size={16} className="flex-shrink-0 mt-0.5 text-blue-600" />
                <span><strong>Используйте чат:</strong> Вся коммуникация только через встроенный чат (модерируется)</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="CheckCircle" size={16} className="flex-shrink-0 mt-0.5 text-blue-600" />
                <span><strong>Делайте фото:</strong> Фотографируйте груз при передаче как доказательство</span>
              </li>

              <li className="flex items-start gap-2">
                <Icon name="CheckCircle" size={16} className="flex-shrink-0 mt-0.5 text-blue-600" />
                <span><strong>Сообщайте о нарушениях:</strong> Если что-то не так - немедленно свяжитесь с поддержкой</span>
              </li>
            </ul>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-3">
              <Icon name="Phone" size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                  Служба поддержки 24/7
                </p>
                <p className="text-yellow-800 dark:text-yellow-200">
                  При любых подозрительных действиях немедленно свяжитесь с нами:
                </p>
                <div className="mt-2 space-y-1">
                  <div className="font-mono">📞 8 (800) 555-35-35 (бесплатно)</div>
                  <div className="font-mono">📧 support@gruzklik.ru</div>
                  <div className="font-mono">💬 Telegram: @gruzklik_support</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-6">
          <Button onClick={onClose} className="w-full">
            Понятно, продолжить
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SecurityRecommendations;