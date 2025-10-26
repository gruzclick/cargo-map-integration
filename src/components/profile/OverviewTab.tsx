import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface OverviewTabProps {
  mockUserName: string;
  userType: 'client' | 'driver';
}

const OverviewTab = ({ mockUserName, userType }: OverviewTabProps) => {
  const hasData = mockUserName && mockUserName.trim() !== '';

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
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">0</div>
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
            <div className="text-4xl font-bold text-gray-400 dark:text-gray-600">—</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Нет оценок</div>
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
            <div className="text-4xl font-bold text-green-600 dark:text-green-400">0 ₽</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">За всё время</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Личная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!hasData ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Icon name="User" size={48} className="mx-auto mb-3 opacity-50" />
              <p>Заполните профиль в настройках</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                  {mockUserName.split(' ').map(n => n[0]).join('').toUpperCase()}
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
                  <div className="font-medium text-gray-900 dark:text-gray-100">Не указан</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Email</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">Не указан</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Транспорт</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">Не указан</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Статус</div>
                  <div className="font-medium text-green-600 dark:text-green-400">✓ Активен</div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTab;