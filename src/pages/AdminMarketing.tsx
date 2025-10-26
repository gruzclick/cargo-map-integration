import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Promo {
  id: string;
  code: string;
  discount: number;
  type: 'percent' | 'fixed';
  minAmount: number;
  maxUses: number;
  used: number;
  active: boolean;
  expiryDate: string;
}

interface Campaign {
  id: string;
  name: string;
  type: 'discount' | 'referral' | 'ab_test';
  status: 'active' | 'paused' | 'completed';
  target: string;
  conversions: number;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
}

const promosData: Promo[] = [
  {
    id: '1',
    code: 'WELCOME20',
    discount: 20,
    type: 'percent',
    minAmount: 1000,
    maxUses: 1000,
    used: 347,
    active: true,
    expiryDate: '2025-02-28'
  },
  {
    id: '2',
    code: 'DELIVERY500',
    discount: 500,
    type: 'fixed',
    minAmount: 2000,
    maxUses: 500,
    used: 89,
    active: true,
    expiryDate: '2025-03-15'
  },
];

const campaignsData: Campaign[] = [
  {
    id: '1',
    name: 'Скидка новым клиентам',
    type: 'discount',
    status: 'active',
    target: 'Новые пользователи из Москвы',
    conversions: 234,
    budget: 50000,
    spent: 23400,
    startDate: '2025-01-15',
    endDate: '2025-02-15'
  },
  {
    id: '2',
    name: 'Реферальная программа',
    type: 'referral',
    status: 'active',
    target: 'Все пользователи',
    conversions: 156,
    budget: 30000,
    spent: 15600,
    startDate: '2025-01-01',
    endDate: '2025-12-31'
  },
];

export default function AdminMarketing() {
  const { toast } = useToast();
  const [promos, setPromos] = useState<Promo[]>(promosData);
  const [campaigns, setCampaigns] = useState<Campaign[]>(campaignsData);
  const [newPromo, setNewPromo] = useState({
    code: '',
    discount: 10,
    type: 'percent' as 'percent' | 'fixed',
    minAmount: 0,
    maxUses: 100
  });

  const handleCreatePromo = () => {
    if (!newPromo.code) {
      toast({
        title: 'Ошибка',
        description: 'Введите код промокода',
        variant: 'destructive'
      });
      return;
    }

    const promo: Promo = {
      id: Date.now().toString(),
      code: newPromo.code.toUpperCase(),
      discount: newPromo.discount,
      type: newPromo.type,
      minAmount: newPromo.minAmount,
      maxUses: newPromo.maxUses,
      used: 0,
      active: true,
      expiryDate: '2025-12-31'
    };

    setPromos([...promos, promo]);
    setNewPromo({ code: '', discount: 10, type: 'percent', minAmount: 0, maxUses: 100 });
    toast({
      title: 'Промокод создан',
      description: `Промокод ${promo.code} активирован`
    });
  };

  const handleTogglePromo = (id: string) => {
    setPromos(promos.map(p => p.id === id ? { ...p, active: !p.active } : p));
    toast({
      title: 'Статус изменен',
      description: 'Промокод обновлен'
    });
  };

  const handleDeletePromo = (id: string) => {
    setPromos(promos.filter(p => p.id !== id));
    toast({
      title: 'Промокод удален',
      description: 'Промокод удален из системы'
    });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => window.history.back()}>
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Icon name="Target" size={32} />
              Маркетинг
            </h1>
            <p className="text-muted-foreground">Промокоды, акции и целевые кампании</p>
          </div>
        </div>

        <Tabs defaultValue="promos" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="promos">Промокоды</TabsTrigger>
            <TabsTrigger value="campaigns">Кампании</TabsTrigger>
            <TabsTrigger value="referral">Реферальная программа</TabsTrigger>
          </TabsList>

          <TabsContent value="promos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Создать промокод</CardTitle>
                <CardDescription>Скидка для клиентов по специальному коду</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="promo-code">Код промокода</Label>
                    <Input
                      id="promo-code"
                      placeholder="SUMMER2025"
                      value={newPromo.code}
                      onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="promo-type">Тип скидки</Label>
                    <Select value={newPromo.type} onValueChange={(val: 'percent' | 'fixed') => setNewPromo({ ...newPromo, type: val })}>
                      <SelectTrigger id="promo-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percent">Процент (%)</SelectItem>
                        <SelectItem value="fixed">Фиксированная сумма (₽)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="promo-discount">
                      Размер скидки {newPromo.type === 'percent' ? '(%)' : '(₽)'}
                    </Label>
                    <Input
                      id="promo-discount"
                      type="number"
                      value={newPromo.discount}
                      onChange={(e) => setNewPromo({ ...newPromo, discount: parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="promo-min">Минимальная сумма заказа (₽)</Label>
                    <Input
                      id="promo-min"
                      type="number"
                      value={newPromo.minAmount}
                      onChange={(e) => setNewPromo({ ...newPromo, minAmount: parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="promo-max">Максимум использований</Label>
                    <Input
                      id="promo-max"
                      type="number"
                      value={newPromo.maxUses}
                      onChange={(e) => setNewPromo({ ...newPromo, maxUses: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <Button onClick={handleCreatePromo} className="w-full">
                  <Icon name="Plus" size={16} className="mr-2" />
                  Создать промокод
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Активные промокоды ({promos.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Код</TableHead>
                      <TableHead>Скидка</TableHead>
                      <TableHead>Мин. сумма</TableHead>
                      <TableHead>Использовано</TableHead>
                      <TableHead>Лимит</TableHead>
                      <TableHead>Срок до</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {promos.map((promo) => (
                      <TableRow key={promo.id}>
                        <TableCell className="font-mono font-bold">{promo.code}</TableCell>
                        <TableCell>
                          {promo.discount}{promo.type === 'percent' ? '%' : '₽'}
                        </TableCell>
                        <TableCell>{promo.minAmount}₽</TableCell>
                        <TableCell>{promo.used}</TableCell>
                        <TableCell>{promo.maxUses}</TableCell>
                        <TableCell>{promo.expiryDate}</TableCell>
                        <TableCell>
                          <Badge variant={promo.active ? 'default' : 'secondary'}>
                            {promo.active ? 'Активен' : 'Отключен'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTogglePromo(promo.id)}
                            >
                              <Icon name={promo.active ? "Pause" : "Play"} size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePromo(promo.id)}
                            >
                              <Icon name="Trash2" size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Целевые кампании</CardTitle>
                    <CardDescription>A/B тестирование и таргетированные акции</CardDescription>
                  </div>
                  <Button>
                    <Icon name="Plus" size={16} className="mr-2" />
                    Создать кампанию
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg flex items-center gap-2">
                            {campaign.name}
                            <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                              {campaign.status === 'active' ? 'Активна' : campaign.status}
                            </Badge>
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            <Icon name="Target" size={14} className="inline mr-1" />
                            {campaign.target}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">{campaign.conversions}</p>
                          <p className="text-xs text-muted-foreground">конверсий</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Бюджет</p>
                          <p className="font-semibold">{campaign.budget.toLocaleString('ru-RU')} ₽</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Потрачено</p>
                          <p className="font-semibold">{campaign.spent.toLocaleString('ru-RU')} ₽</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Начало</p>
                          <p className="font-semibold">{campaign.startDate}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Конец</p>
                          <p className="font-semibold">{campaign.endDate}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {Math.round((campaign.spent / campaign.budget) * 100)}%
                        </span>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="sm">
                          <Icon name="BarChart3" size={14} className="mr-1" />
                          Статистика
                        </Button>
                        <Button variant="outline" size="sm">
                          <Icon name="Edit" size={14} className="mr-1" />
                          Редактировать
                        </Button>
                        <Button variant="outline" size="sm">
                          <Icon name="Pause" size={14} className="mr-1" />
                          Приостановить
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Что такое A/B тестирование?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  A/B тестирование — это метод сравнения двух версий страницы или функции, чтобы определить какая работает лучше.
                  Например, можно показать половине пользователей красную кнопку "Заказать", а второй половине — синюю,
                  и посмотреть где будет больше кликов. Так вы узнаете что лучше привлекает клиентов.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referral" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Реферальная программа</CardTitle>
                <CardDescription>Приводи друга — получи бонус</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="space-y-1">
                    <Label>Программа активна</Label>
                    <p className="text-sm text-muted-foreground">Пользователи могут приглашать друзей</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label>Бонус приглашающему (₽)</Label>
                  <Input type="number" defaultValue="500" className="w-48" />
                </div>

                <div className="space-y-2">
                  <Label>Бонус приглашенному (₽)</Label>
                  <Input type="number" defaultValue="300" className="w-48" />
                </div>

                <div className="space-y-2">
                  <Label>Условие активации</Label>
                  <select className="w-full p-2 border rounded-md bg-background">
                    <option>После первого заказа</option>
                    <option>После регистрации</option>
                    <option>После заказа на сумму от 1000₽</option>
                  </select>
                </div>

                <Button>
                  <Icon name="Save" size={16} className="mr-2" />
                  Сохранить настройки
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Статистика реферальной программы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Приглашено</p>
                    <p className="text-3xl font-bold">156</p>
                    <p className="text-xs text-green-600 mt-1">+23 за неделю</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Активировано</p>
                    <p className="text-3xl font-bold">89</p>
                    <p className="text-xs text-muted-foreground mt-1">57% конверсия</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Выплачено</p>
                    <p className="text-3xl font-bold">44,500₽</p>
                    <p className="text-xs text-muted-foreground mt-1">в бонусах</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
