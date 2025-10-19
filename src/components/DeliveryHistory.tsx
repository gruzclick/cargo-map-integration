import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import PDFExport from '@/components/PDFExport';
import { useToast } from '@/hooks/use-toast';

const exportToExcel = (deliveries: Delivery[]) => {
  const headers = ['Дата', 'Откуда', 'Куда', 'Вес (кг)', 'Стоимость', 'Статус', 'Рейтинг', 'Контрагент'];
  
  const rows = deliveries.map(d => [
    d.date,
    d.from,
    d.to,
    d.weight.toString(),
    d.cost ? `${d.cost}₽` : '-',
    d.status === 'completed' ? 'Завершён' : 'Отменён',
    d.rating ? d.rating.toString() : '-',
    d.driver || d.client || '-'
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `История_заказов_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};

interface Delivery {
  id: string;
  date: string;
  from: string;
  to: string;
  weight: number;
  status: 'completed' | 'cancelled';
  rating?: number;
  driver?: string;
  client?: string;
  cost?: number;
}

interface DeliveryHistoryProps {
  userId: string;
  userType: 'client' | 'carrier';
}

const DeliveryHistory = ({ userId, userType }: DeliveryHistoryProps) => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingDelivery, setRatingDelivery] = useState<string | null>(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchHistory();
  }, [userId]);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`https://functions.poehali.dev/b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e?user_id=${userId}&user_type=${userType}`);
      const data = await response.json();
      setDeliveries(data.deliveries || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitRating = async (deliveryId: string, rating: number) => {
    try {
      const response = await fetch('https://functions.poehali.dev/b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'rate_delivery',
          delivery_id: deliveryId,
          rating: rating,
          user_id: userId,
          user_type: userType
        })
      });

      if (response.ok) {
        toast({
          title: 'Оценка отправлена!',
          description: 'Спасибо за ваш отзыв'
        });
        setRatingDelivery(null);
        fetchHistory();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить оценку',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'completed') {
      return <Badge className="bg-green-500/10 text-green-500 border-0">Завершено</Badge>;
    }
    return <Badge variant="destructive">Отменено</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="Loader2" size={32} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  const exportDeliveries = deliveries.map(d => ({
    id: d.id,
    from: d.from,
    to: d.to,
    cargo: '-',
    weight: `${d.weight} кг`,
    status: d.status,
    date: new Date(d.date).toLocaleDateString('ru-RU'),
    price: d.cost ? `${d.cost} ₽` : undefined,
    carrier: d.driver,
    client: d.client
  }));

  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  const userName = userData.full_name || userData.phone || 'Пользователь';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-semibold">История поставок</h3>
          <p className="text-muted-foreground">Все ваши завершенные заказы</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToExcel(deliveries)}
            className="gap-2"
          >
            <Icon name="FileSpreadsheet" size={16} />
            <span className="hidden md:inline">Excel</span>
          </Button>
          <PDFExport 
            deliveries={exportDeliveries} 
            userType={userType}
            userName={userName}
          />
          <Badge variant="secondary" className="gap-2">
            <Icon name="PackageCheck" size={16} />
            <span className="hidden md:inline">{deliveries.length} поставок</span>
            <span className="md:hidden">{deliveries.length}</span>
          </Badge>
        </div>
      </div>

      {deliveries.length === 0 ? (
        <Card className="border-0 shadow-md rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
              <Icon name="PackageSearch" size={32} className="text-muted-foreground" />
            </div>
            <h4 className="text-lg font-semibold mb-2">История пуста</h4>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Здесь будут отображаться все ваши завершенные поставки
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {deliveries.map((delivery) => (
            <Card key={delivery.id} className="border-0 shadow-md rounded-2xl hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon name="Package" size={22} className="text-accent" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {delivery.from} → {delivery.to}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Icon name="Calendar" size={14} />
                        {new Date(delivery.date).toLocaleDateString('ru-RU', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(delivery.status)}
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="flex items-center gap-2">
                    <Icon name="Weight" size={16} className="text-muted-foreground" />
                    <span className="text-sm">{delivery.weight} кг</span>
                  </div>
                  {delivery.cost && (
                    <div className="flex items-center gap-2">
                      <Icon name="Wallet" size={16} className="text-muted-foreground" />
                      <span className="text-sm font-semibold">{delivery.cost.toLocaleString()} ₽</span>
                    </div>
                  )}
                  {userType === 'client' && delivery.driver && (
                    <div className="flex items-center gap-2">
                      <Icon name="User" size={16} className="text-muted-foreground" />
                      <span className="text-sm">{delivery.driver}</span>
                    </div>
                  )}
                  {userType === 'carrier' && delivery.client && (
                    <div className="flex items-center gap-2">
                      <Icon name="Building" size={16} className="text-muted-foreground" />
                      <span className="text-sm">{delivery.client}</span>
                    </div>
                  )}
                </div>

                {delivery.rating ? (
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Icon name="Star" size={16} className="text-yellow-500" />
                    <span className="text-sm font-medium">Оценка: {delivery.rating}/5</span>
                  </div>
                ) : delivery.status === 'completed' && (
                  <div className="pt-2 border-t">
                    {ratingDelivery === delivery.id ? (
                      <div className="space-y-3">
                        <p className="text-sm font-medium">Оцените {userType === 'client' ? 'водителя' : 'клиента'}:</p>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setSelectedRating(star)}
                              className="transition-transform hover:scale-110"
                            >
                              <Icon
                                name="Star"
                                size={24}
                                className={selectedRating >= star ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                              />
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => submitRating(delivery.id, selectedRating)}
                            disabled={selectedRating === 0}
                            className="rounded-lg"
                          >
                            Отправить
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setRatingDelivery(null);
                              setSelectedRating(0);
                            }}
                            className="rounded-lg"
                          >
                            Отмена
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRatingDelivery(delivery.id)}
                        className="rounded-lg"
                      >
                        <Icon name="Star" size={16} className="mr-2" />
                        Оценить
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveryHistory;