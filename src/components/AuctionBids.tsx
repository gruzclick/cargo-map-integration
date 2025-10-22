import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface AuctionBid {
  id: string;
  cargo: string;
  route: string;
  startPrice: number;
  currentPrice: number;
  bidsCount: number;
  timeLeft: string;
  status: 'active' | 'won' | 'lost' | 'ended';
  myBid?: number;
}

const AuctionBids = () => {
  const { toast } = useToast();
  const [auctions] = useState<AuctionBid[]>([
    {
      id: '1',
      cargo: 'Мебель 5 тонн',
      route: 'Москва → Санкт-Петербург',
      startPrice: 50000,
      currentPrice: 42000,
      bidsCount: 8,
      timeLeft: '2 часа',
      status: 'active',
      myBid: 45000
    },
    {
      id: '2',
      cargo: 'Стройматериалы 10 тонн',
      route: 'Казань → Нижний Новгород',
      startPrice: 80000,
      currentPrice: 65000,
      bidsCount: 12,
      timeLeft: '45 минут',
      status: 'active'
    },
    {
      id: '3',
      cargo: 'Продукты питания 3 тонны',
      route: 'Москва → Тверь',
      startPrice: 25000,
      currentPrice: 22000,
      bidsCount: 5,
      timeLeft: 'Завершен',
      status: 'won',
      myBid: 22000
    }
  ]);

  const [bidAmount, setBidAmount] = useState<{ [key: string]: string }>({});

  const handlePlaceBid = (auctionId: string) => {
    const amount = bidAmount[auctionId];
    if (!amount) {
      toast({
        title: 'Ошибка',
        description: 'Введите сумму ставки',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Ставка размещена',
      description: `Ваша ставка ${amount} ₽ принята. Вы лидируете в аукционе!`
    });

    setBidAmount({ ...bidAmount, [auctionId]: '' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-600">Активен</Badge>;
      case 'won':
        return <Badge className="bg-blue-600">Выигран</Badge>;
      case 'lost':
        return <Badge variant="destructive">Проигран</Badge>;
      case 'ended':
        return <Badge variant="secondary">Завершен</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Gavel" size={20} />
            Аукцион ставок
          </CardTitle>
          <CardDescription>
            Предложите свою цену и выиграйте перевозку
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {auctions.map((auction) => (
              <Card key={auction.id} className="border-2">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{auction.cargo}</h3>
                          {getStatusBadge(auction.status)}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <Icon name="MapPin" size={14} />
                          {auction.route}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Текущая цена</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {auction.currentPrice.toLocaleString()} ₽
                        </p>
                        {auction.myBid && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            Ваша ставка: {auction.myBid.toLocaleString()} ₽
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Стартовая цена</p>
                        <p className="font-semibold">{auction.startPrice.toLocaleString()} ₽</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Ставок</p>
                        <p className="font-semibold flex items-center gap-1">
                          <Icon name="Users" size={14} />
                          {auction.bidsCount}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Осталось</p>
                        <p className="font-semibold flex items-center gap-1">
                          <Icon name="Clock" size={14} />
                          {auction.timeLeft}
                        </p>
                      </div>
                    </div>

                    {auction.status === 'active' && (
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Input
                            type="number"
                            placeholder={`Меньше ${auction.currentPrice}`}
                            value={bidAmount[auction.id] || ''}
                            onChange={(e) => setBidAmount({ ...bidAmount, [auction.id]: e.target.value })}
                          />
                        </div>
                        <Button onClick={() => handlePlaceBid(auction.id)}>
                          <Icon name="TrendingDown" size={18} className="mr-2" />
                          Сделать ставку
                        </Button>
                      </div>
                    )}

                    {auction.status === 'won' && (
                      <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <Icon name="Trophy" size={20} className="text-blue-600 dark:text-blue-400" />
                        <p className="text-sm text-blue-900 dark:text-blue-100 font-medium">
                          Поздравляем! Вы выиграли этот аукцион
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Info" size={20} />
            Как работает аукцион
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center shrink-0">
              <span className="font-bold text-blue-600 dark:text-blue-400">1</span>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Выберите груз</strong> - просмотрите доступные аукционы и выберите подходящий маршрут
            </p>
          </div>
          
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center shrink-0">
              <span className="font-bold text-green-600 dark:text-green-400">2</span>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Сделайте ставку</strong> - предложите свою цену ниже текущей. Чем ниже цена - тем выше шанс выиграть
            </p>
          </div>
          
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center shrink-0">
              <span className="font-bold text-purple-600 dark:text-purple-400">3</span>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Следите за временем</strong> - аукцион заканчивается через указанное время. Побеждает самая низкая ставка
            </p>
          </div>
          
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center shrink-0">
              <span className="font-bold text-orange-600 dark:text-orange-400">4</span>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Получите заказ</strong> - если ваша ставка самая низкая, вы получаете контракт на перевозку
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuctionBids;
