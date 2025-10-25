import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface DashboardStatsProps {
  stats: {
    totalUsers: number;
    activeOrders: number;
    totalRevenue: number;
    activeDrivers: number;
  };
  loading: boolean;
}

export const DashboardStats = ({ stats, loading }: DashboardStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Всего пользователей
          </CardTitle>
          <Icon name="Users" size={20} className="text-blue-600 dark:text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {loading ? '...' : stats.totalUsers.toLocaleString()}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Активные заказы
          </CardTitle>
          <Icon name="Package" size={20} className="text-green-600 dark:text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {loading ? '...' : stats.activeOrders}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Общая выручка
          </CardTitle>
          <Icon name="DollarSign" size={20} className="text-yellow-600 dark:text-yellow-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {loading ? '...' : `${stats.totalRevenue.toLocaleString()} ₽`}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Активные водители
          </CardTitle>
          <Icon name="Truck" size={20} className="text-purple-600 dark:text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {loading ? '...' : stats.activeDrivers}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
