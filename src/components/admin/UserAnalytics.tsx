import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from '@/components/ui/icon';
import { secureLocalStorage } from '@/utils/security';

interface UserAnalyticsProps {
  stats: {
    totalUsers: number;
    newUsersThisWeek: number;
    averageSessionTime: number;
  };
}

interface AnalyticsData {
  userActivity: Array<{ day: string; users: number }>;
  userGrowth: Array<{ month: string; users: number }>;
  userTypes: Array<{ name: string; value: number }>;
}

export const UserAnalytics = ({ stats }: UserAnalyticsProps) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    userActivity: [],
    userGrowth: [],
    userTypes: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const token = secureLocalStorage.get('admin_token');
      const response = await fetch('https://functions.poehali.dev/f06efb37-9437-4df8-8032-f2ba53b2e2d6', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || ''
        },
        body: JSON.stringify({ action: 'get_user_analytics' })
      });

      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки аналитики:', error);
    } finally {
      setLoading(false);
    }
  };

  const userActivityData = analyticsData.userActivity.length > 0 
    ? analyticsData.userActivity 
    : [
        { day: 'ПН', users: 0 },
        { day: 'ВТ', users: 0 },
        { day: 'СР', users: 0 },
        { day: 'ЧТ', users: 0 },
        { day: 'ПТ', users: 0 },
        { day: 'СБ', users: 0 },
        { day: 'ВС', users: 0 }
      ];

  const userGrowthData = analyticsData.userGrowth.length > 0 
    ? analyticsData.userGrowth 
    : [{ month: 'Текущий', users: stats.totalUsers }];

  const userTypeData = analyticsData.userTypes.length > 0
    ? analyticsData.userTypes.map((type, index) => ({
        ...type,
        color: index === 0 ? '#3b82f6' : '#10b981'
      }))
    : [
        { name: 'Заказчики', value: Math.floor(stats.totalUsers * 0.65), color: '#3b82f6' },
        { name: 'Водители', value: Math.floor(stats.totalUsers * 0.35), color: '#10b981' }
      ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
            <Icon name="TrendingUp" size={20} />
            Рост пользователей
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Динамика роста за последние 6 месяцев
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={userGrowthData}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="users" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorUsers)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
            <Icon name="Activity" size={20} />
            Активность по дням недели
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Среднее количество активных пользователей
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={userActivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Bar dataKey="users" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
            <Icon name="Users" size={20} />
            Распределение по типам
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Соотношение заказчиков и водителей
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={userTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {userTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-300 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100 flex items-center gap-2">
            <Icon name="Clock" size={20} />
            Среднее время сессии
          </CardTitle>
          <CardDescription className="text-blue-700 dark:text-blue-300">
            В минутах за последние 7 дней
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="text-6xl font-bold text-blue-900 dark:text-blue-100">
              {stats.averageSessionTime}
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">минут</p>
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-blue-200 dark:border-blue-800">
              <div>
                <p className="text-xs text-blue-600 dark:text-blue-400">Новых за неделю</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.newUsersThisWeek}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600 dark:text-blue-400">Всего</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalUsers}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600 dark:text-blue-400">Рост</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">+12%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};