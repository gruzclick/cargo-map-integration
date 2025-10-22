import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface Tender {
  id: string;
  title: string;
  route: string;
  cargo: string;
  weight: number;
  startDate: string;
  endDate: string;
  budget: number;
  bids: number;
  status: 'active' | 'closed' | 'won';
}

const TenderSystem = () => {
  const { toast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [tenders] = useState<Tender[]>([
    {
      id: '1',
      title: 'Перевозка строительных материалов',
      route: 'Москва → Санкт-Петербург',
      cargo: 'Кирпич, цемент',
      weight: 20000,
      startDate: '2024-10-25',
      endDate: '2024-10-30',
      budget: 150000,
      bids: 12,
      status: 'active'
    },
    {
      id: '2',
      title: 'Доставка продуктов питания',
      route: 'Казань → Нижний Новгород',
      cargo: 'Продукты (рефрижератор)',
      weight: 8000,
      startDate: '2024-10-24',
      endDate: '2024-10-26',
      budget: 80000,
      bids: 8,
      status: 'active'
    }
  ]);

  const handleCreateTender = () => {
    toast({
      title: 'Тендер создан',
      description: 'Ваш тендер опубликован и доступен перевозчикам'
    });
    setShowCreateForm(false);
  };

  const handlePlaceBid = (tenderId: string) => {
    toast({
      title: 'Ставка размещена',
      description: 'Ваше предложение отправлено заказчику'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Gavel" size={20} />
                Тендеры на перевозку
              </CardTitle>
              <CardDescription>
                Конкурентные торги на лучшие условия перевозки
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateForm(!showCreateForm)}>
              <Icon name="Plus" size={18} className="mr-2" />
              Создать тендер
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showCreateForm && (
            <Card className="mb-6 border-2 border-blue-500/50">
              <CardHeader>
                <CardTitle className="text-lg">Создание тендера</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="tender-title">Название тендера</Label>
                  <Input
                    id="tender-title"
                    placeholder="Перевозка..."
                    className="mt-1.5"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tender-from">Откуда</Label>
                    <Input
                      id="tender-from"
                      placeholder="Город отправления"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tender-to">Куда</Label>
                    <Input
                      id="tender-to"
                      placeholder="Город назначения"
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="tender-cargo">Описание груза</Label>
                  <Textarea
                    id="tender-cargo"
                    placeholder="Тип груза, особенности, требования..."
                    className="mt-1.5"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tender-weight">Вес (кг)</Label>
                    <Input
                      id="tender-weight"
                      type="number"
                      placeholder="1000"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tender-budget">Бюджет (₽)</Label>
                    <Input
                      id="tender-budget"
                      type="number"
                      placeholder="50000"
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tender-start">Дата начала</Label>
                    <Input
                      id="tender-start"
                      type="date"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tender-end">Дата окончания</Label>
                    <Input
                      id="tender-end"
                      type="date"
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowCreateForm(false)} className="flex-1">
                    Отмена
                  </Button>
                  <Button onClick={handleCreateTender} className="flex-1">
                    Опубликовать тендер
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {tenders.map((tender) => (
              <Card key={tender.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{tender.title}</h3>
                        <Badge variant={tender.status === 'active' ? 'default' : 'secondary'}>
                          {tender.status === 'active' ? 'Активен' : 'Закрыт'}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <p className="flex items-center gap-2">
                          <Icon name="MapPin" size={14} />
                          {tender.route}
                        </p>
                        <p className="flex items-center gap-2">
                          <Icon name="Package" size={14} />
                          {tender.cargo}
                        </p>
                        <p className="flex items-center gap-2">
                          <Icon name="Weight" size={14} />
                          {tender.weight.toLocaleString()} кг
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {tender.budget.toLocaleString()} ₽
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Бюджет
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Icon name="Users" size={14} />
                        {tender.bids} ставок
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="Calendar" size={14} />
                        до {new Date(tender.endDate).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                    
                    {tender.status === 'active' && (
                      <Button size="sm" onClick={() => handlePlaceBid(tender.id)}>
                        <Icon name="TrendingDown" size={14} className="mr-1" />
                        Сделать ставку
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TenderSystem;
