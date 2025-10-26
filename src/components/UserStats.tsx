import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { getUserStats, type UserStats as UserStatsType } from '@/utils/api';

const UserStats = () => {
  const [stats, setStats] = useState<UserStatsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getUserStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to load user stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !stats) {
    return null;
  }

  return (
    <div className="w-full bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 py-8 px-4">
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Статистика платформы в реальном времени
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-4 text-center">
              <Icon name="Users" size={32} className="mx-auto mb-2 text-white" />
              <div className="text-3xl font-bold text-white">{stats.total}</div>
              <div className="text-sm text-white/80 mt-1">Всего пользователей</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-4 text-center">
              <Icon name="Truck" size={32} className="mx-auto mb-2 text-white" />
              <div className="text-3xl font-bold text-white">{stats.drivers}</div>
              <div className="text-sm text-white/80 mt-1">Водителей</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-4 text-center">
              <Icon name="Package" size={32} className="mx-auto mb-2 text-white" />
              <div className="text-3xl font-bold text-white">{stats.clients}</div>
              <div className="text-sm text-white/80 mt-1">Клиентов</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-4 text-center">
              <Icon name="ClipboardList" size={32} className="mx-auto mb-2 text-white" />
              <div className="text-3xl font-bold text-white">{stats.logists}</div>
              <div className="text-sm text-white/80 mt-1">Логистов</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-4 text-center">
              <Icon name="ShieldCheck" size={32} className="mx-auto mb-2 text-white" />
              <div className="text-3xl font-bold text-white">{stats.verified}</div>
              <div className="text-sm text-white/80 mt-1">Верифицировано</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserStats;
