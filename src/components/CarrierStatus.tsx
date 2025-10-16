import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import LocationTracker from './LocationTracker';

interface CarrierStatusProps {
  userId: string;
}

const CarrierStatus = ({ userId }: CarrierStatusProps) => {
  const [status, setStatus] = useState<'free' | 'has_space' | 'full'>('free');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleStatusChange = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/e0c57b5b-aa36-4b28-8b31-c70ece513cae', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          user_id: userId,
          status: status
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Статус обновлен!',
          description: `Ваш статус изменен на "${getStatusLabel(status)}"`
        });
      } else {
        throw new Error(data.error || 'Ошибка обновления статуса');
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'free': return 'Свободен';
      case 'has_space': return 'Есть места';
      case 'full': return 'Мест нет';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'free': return 'CircleCheck';
      case 'has_space': return 'CircleDot';
      case 'full': return 'CircleX';
      default: return 'Circle';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'free': return 'text-green-500';
      case 'has_space': return 'text-yellow-500';
      case 'full': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <LocationTracker userId={userId} userType="carrier" enabled={true} />
      
      <Card className="border-0 shadow-xl rounded-3xl">
        <CardHeader className="space-y-2">
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <Icon name="Truck" size={32} className="text-accent" />
          </div>
          <CardTitle className="text-3xl font-bold text-center">
            Статус водителя
          </CardTitle>
          <CardDescription className="text-center text-base">
            Укажите свой текущий статус для отображения на карте
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <RadioGroup value={status} onValueChange={(val: any) => setStatus(val)} className="space-y-3">
            <div className="flex items-center space-x-3 border rounded-xl p-4 hover:bg-accent/5 transition-colors cursor-pointer">
              <RadioGroupItem value="free" id="free" />
              <Label htmlFor="free" className="cursor-pointer flex items-center gap-3 flex-1">
                <Icon name={getStatusIcon('free')} size={24} className={getStatusColor('free')} />
                <div>
                  <div className="font-semibold">{getStatusLabel('free')}</div>
                  <div className="text-sm text-muted-foreground">Готов принять заказ</div>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-3 border rounded-xl p-4 hover:bg-accent/5 transition-colors cursor-pointer">
              <RadioGroupItem value="has_space" id="has_space" />
              <Label htmlFor="has_space" className="cursor-pointer flex items-center gap-3 flex-1">
                <Icon name={getStatusIcon('has_space')} size={24} className={getStatusColor('has_space')} />
                <div>
                  <div className="font-semibold">{getStatusLabel('has_space')}</div>
                  <div className="text-sm text-muted-foreground">Могу взять дополнительный груз</div>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-3 border rounded-xl p-4 hover:bg-accent/5 transition-colors cursor-pointer">
              <RadioGroupItem value="full" id="full" />
              <Label htmlFor="full" className="cursor-pointer flex items-center gap-3 flex-1">
                <Icon name={getStatusIcon('full')} size={24} className={getStatusColor('full')} />
                <div>
                  <div className="font-semibold">{getStatusLabel('full')}</div>
                  <div className="text-sm text-muted-foreground">Машина полностью загружена</div>
                </div>
              </Label>
            </div>
          </RadioGroup>

          <Button 
            onClick={handleStatusChange} 
            className="w-full h-12 text-base rounded-xl"
            disabled={loading}
          >
            {loading ? (
              <>
                <Icon name="Loader2" size={18} className="animate-spin mr-2" />
                Обновление...
              </>
            ) : (
              <>
                <Icon name="Check" size={18} className="mr-2" />
                Обновить статус
              </>
            )}
          </Button>

          <div className="bg-accent/10 rounded-xl p-4 space-y-2">
            <div className="flex items-start gap-2">
              <Icon name="Info" size={18} className="text-accent mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-semibold mb-1">Как это работает:</p>
                <ul className="space-y-1 ml-2">
                  <li>• Ваш статус отображается на карте в реальном времени</li>
                  <li>• Клиенты видят только свободных водителей</li>
                  <li>• Обновляйте статус при изменении загруженности</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CarrierStatus;