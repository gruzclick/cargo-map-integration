import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';

interface Deal {
  id: string;
  date: string;
  cargo: string;
  route: string;
  price: number;
  status: 'completed' | 'in_progress' | 'cancelled';
  partner: string;
  rating?: number;
}

const DealsHistory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [deals] = useState<Deal[]>([
    {
      id: '1',
      date: '2025-10-20',
      cargo: 'Мебель 5 тонн',
      route: 'Москва → Санкт-Петербург',
      price: 42000,
      status: 'completed',
      partner: 'ООО "Транспорт+"',
      rating: 5
    },
    {
      id: '2',
      date: '2025-10-18',
      cargo: 'Стройматериалы 10 тонн',
      route: 'Казань → Нижний Новгород',
      price: 65000,
      status: 'completed',
      partner: 'ИП Иванов',
      rating: 4
    },
    {
      id: '3',
      date: '2025-10-15',
      cargo: 'Продукты питания 3 тонны',
      route: 'Москва → Тверь',
      price: 22000,
      status: 'in_progress',
      partner: 'ЗАО "Логистика"'
    },
    {
      id: '4',
      date: '2025-10-10',
      cargo: 'Электроника 2 тонны',
      route: 'Санкт-Петербург → Москва',
      price: 35000,
      status: 'cancelled',
      partner: 'ООО "Быстрая доставка"'
    },
    {
      id: '5',
      date: '2025-10-05',
      cargo: 'Одежда 4 тонны',
      route: 'Москва → Екатеринбург',
      price: 78000,
      status: 'completed',
      partner: 'ИП Петров',
      rating: 5
    }
  ]);

  const filteredDeals = deals.filter(deal => 
    deal.cargo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deal.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deal.partner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-600">Завершено</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-600">В процессе</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Отменено</Badge>;
      default:
        return null;
    }
  };

  const totalEarned = deals
    .filter(d => d.status === 'completed')
    .reduce((sum, d) => sum + d.price, 0);

  const completedDeals = deals.filter(d => d.status === 'completed').length;
  const averageRating = deals
    .filter(d => d.rating)
    .reduce((sum, d) => sum + (d.rating || 0), 0) / deals.filter(d => d.rating).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Всего сделок</p>
                <p className="text-3xl font-bold mt-1">{completedDeals}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Icon name="PackageCheck" size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Заработано</p>
                <p className="text-3xl font-bold mt-1">{(totalEarned / 1000).toFixed(0)}K ₽</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Icon name="TrendingUp" size={24} className="text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Средний рейтинг</p>
                <p className="text-3xl font-bold mt-1 flex items-center gap-1">
                  {averageRating.toFixed(1)}
                  <Icon name="Star" size={20} className="text-yellow-500" />
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <Icon name="Award" size={24} className="text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="History" size={20} />
            История сделок
          </CardTitle>
          <CardDescription>
            Все ваши завершенные и активные перевозки
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Поиск по грузу, маршруту или партнеру..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredDeals.map((deal) => (
              <Card key={deal.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{deal.cargo}</h3>
                        {getStatusBadge(deal.status)}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-1">
                        <Icon name="MapPin" size={14} />
                        {deal.route}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <Icon name="User" size={14} />
                        {deal.partner}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {deal.price.toLocaleString()} ₽
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {new Date(deal.date).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                      {deal.rating && (
                        <div className="flex items-center gap-1 text-sm">
                          <Icon name="Star" size={14} className="text-yellow-500" />
                          <span className="font-medium">{deal.rating}.0</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {deal.status === 'completed' && (
                        <>
                          <Button variant="outline" size="sm">
                            <Icon name="FileText" size={14} className="mr-1" />
                            Документы
                          </Button>
                          <Button variant="outline" size="sm">
                            <Icon name="MessageSquare" size={14} className="mr-1" />
                            Чат
                          </Button>
                        </>
                      )}
                      {deal.status === 'in_progress' && (
                        <Button size="sm">
                          <Icon name="MapPin" size={14} className="mr-1" />
                          Отследить
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredDeals.length === 0 && (
            <div className="text-center py-12">
              <Icon name="PackageX" size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Сделки не найдены</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DealsHistory;
