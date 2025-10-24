import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface OverviewTabProps {
  mockUserName: string;
  userType: 'client' | 'driver';
}

const OverviewTab = ({ mockUserName, userType }: OverviewTabProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Package" size={20} />
              Доставки
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">127</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Всего выполнено</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Star" size={20} />
              Рейтинг
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-yellow-500 dark:text-yellow-400">4.8</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Средняя оценка</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="DollarSign" size={20} />
              Заработано
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600 dark:text-green-400">1.2M ₽</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">За всё время</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Личная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
              СИ
            </div>
            <div>
              <div className="font-semibold text-lg text-gray-900 dark:text-gray-100">{mockUserName}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {userType === 'driver' ? 'Водитель-перевозчик' : 'Клиент'}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Телефон</div>
              <div className="font-medium text-gray-900 dark:text-gray-100">+7 (999) 222-22-22</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Email</div>
              <div className="font-medium text-gray-900 dark:text-gray-100">carrier@test.ru</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Транспорт</div>
              <div className="font-medium text-gray-900 dark:text-gray-100">Грузовик средний (5 тонн)</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Статус</div>
              <div className="font-medium text-green-600 dark:text-green-400">✓ Активен</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTab;
