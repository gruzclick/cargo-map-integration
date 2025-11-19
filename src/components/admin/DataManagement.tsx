import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export const DataManagement = () => {
  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
            <Icon name="Database" size={24} />
            Управление данными
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Просмотр и управление базой данных
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <Icon name="Users" size={24} className="text-blue-600" />
              Пользователи
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Всего зарегистрированных пользователей в системе
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">0</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <Icon name="Truck" size={24} className="text-green-600" />
              Водители
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Водители, подключенные к платформе
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">0</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <Icon name="Package" size={24} className="text-orange-600" />
              Грузы
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Активные и завершенные грузоперевозки
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">0</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <Icon name="ShoppingCart" size={24} className="text-purple-600" />
              Доставки
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Записи о выполненных доставках
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">0</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <Icon name="FileText" size={24} className="text-gray-600" />
              Логи входа
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              История авторизаций пользователей
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-600">0</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-300 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100 flex items-center gap-2">
            <Icon name="Info" size={24} />
            Информация
          </CardTitle>
          <CardDescription className="text-blue-700 dark:text-blue-300">
            Эта панель показывает общую статистику базы данных. Все изменения данных выполняются через соответствующие разделы управления.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
};
