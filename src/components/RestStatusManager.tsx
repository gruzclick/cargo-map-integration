import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import Icon from './ui/icon';
import { useToast } from './ui/use-toast';

interface RestStatusManagerProps {
  userType: 'driver' | 'client';
  onStatusChange: () => void;
}

export default function RestStatusManager({ userType, onStatusChange }: RestStatusManagerProps) {
  const [showRestForm, setShowRestForm] = useState(false);
  const [restUntil, setRestUntil] = useState('');
  const [nextRoute, setNextRoute] = useState('');
  const [nextDeliveryDate, setNextDeliveryDate] = useState('');
  const { toast } = useToast();

  const userId = localStorage.getItem('userId') || '';

  const setRestStatus = async () => {
    try {
      await fetch('https://functions.poehali.dev/b388f085-faa7-4aab-88a5-b45708b116eb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_rest_status',
          user_id: userId,
          user_type: userType,
          rest_until: restUntil || null,
          next_route: nextRoute,
          next_delivery_date: nextDeliveryDate
        })
      });

      toast({
        title: 'Статус обновлен',
        description: restUntil ? `Отдых до ${restUntil}` : 'Статус отдыха установлен'
      });

      setShowRestForm(false);
      setRestUntil('');
      setNextRoute('');
      setNextDeliveryDate('');
      onStatusChange();
    } catch (error) {
      console.error('Error setting rest status:', error);
    }
  };

  const setActiveStatus = async () => {
    try {
      await fetch('https://functions.poehali.dev/b388f085-faa7-4aab-88a5-b45708b116eb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_active_status',
          user_id: userId,
          user_type: userType
        })
      });

      toast({
        title: 'Статус обновлен',
        description: 'Вы снова активны'
      });

      onStatusChange();
    } catch (error) {
      console.error('Error setting active status:', error);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Icon name="Power" size={20} className="text-primary" />
            Управление статусом
          </h3>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setShowRestForm(!showRestForm)}
          >
            <Icon name="Coffee" size={18} className="mr-2" />
            На отдыхе
          </Button>
          <Button
            variant="default"
            className="flex-1"
            onClick={setActiveStatus}
          >
            <Icon name="Play" size={18} className="mr-2" />
            Активен
          </Button>
        </div>
      </Card>

      {showRestForm && (
        <Card className="p-4 space-y-4 border-orange-500/30 bg-orange-500/5">
          <h3 className="font-semibold">Настройка отдыха</h3>

          <div className="space-y-2">
            <Label>
              {userType === 'driver' ? 'Отдых до (опционально)' : 'Следующая поставка готова (дата и время)'}
            </Label>
            <Input
              type="datetime-local"
              value={userType === 'driver' ? restUntil : nextDeliveryDate}
              onChange={(e) => userType === 'driver' ? setRestUntil(e.target.value) : setNextDeliveryDate(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {userType === 'driver' 
                ? 'Оставьте пустым для бессрочного отдыха'
                : 'Укажите когда будет готова следующая поставка'}
            </p>
          </div>

          {userType === 'driver' && (
            <div className="space-y-2">
              <Label>Маршрут после отдыха</Label>
              <Textarea
                placeholder="Москва → Санкт-Петербург → Новгород"
                value={nextRoute}
                onChange={(e) => setNextRoute(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Укажите склады на которые сможете забрать грузы после отдыха
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={setRestStatus} className="flex-1">
              <Icon name="Check" size={18} className="mr-2" />
              Применить
            </Button>
            <Button variant="outline" onClick={() => setShowRestForm(false)} className="flex-1">
              Отмена
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
