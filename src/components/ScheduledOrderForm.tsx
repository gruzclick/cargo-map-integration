import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { Calendar, MapPin, Package } from 'lucide-react';

interface ScheduledOrderFormProps {
  clientId: string;
  onSubmit?: () => void;
}

export function ScheduledOrderForm({ clientId, onSubmit }: ScheduledOrderFormProps) {
  const { t } = useTranslation();
  const [cargoType, setCargoType] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState('');
  const [volume, setVolume] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cargoTypes = ['box', 'pallet', 'container', 'bulk', 'liquid'];
  const vehicleTypes = ['tent_truck', 'refrigerator', 'container', 'flatbed', 'tanker'];

  const handleSubmit = async () => {
    if (!cargoType || !origin || !destination || !vehicleType || !scheduledDate) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/orders/scheduled', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          cargo_type: cargoType,
          origin: origin.trim(),
          destination: destination.trim(),
          scheduled_date: scheduledDate,
          weight: weight ? parseFloat(weight) : null,
          volume: volume ? parseFloat(volume) : null,
          vehicle_type: vehicleType,
          price: price ? parseFloat(price) : null,
          description: description.trim(),
        }),
      });

      if (response.ok) {
        setCargoType('');
        setOrigin('');
        setDestination('');
        setScheduledDate(new Date().toISOString().split('T')[0]);
        setWeight('');
        setVolume('');
        setVehicleType('');
        setPrice('');
        setDescription('');
        onSubmit?.();

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(t('scheduledOrder.created'), {
            body: t('scheduledOrder.createdBody', { date: scheduledDate }),
            icon: '/icon-192.png',
          });
        }
      }
    } catch (error) {
      console.error('Failed to create scheduled order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5" />
        <h3 className="font-semibold text-lg">{t('scheduledOrder.title')}</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        {t('scheduledOrder.subtitle')}
      </p>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            {t('scheduledOrder.cargoType')}
          </label>
          <Select value={cargoType} onValueChange={setCargoType}>
            <SelectTrigger>
              <SelectValue placeholder={t('scheduledOrder.selectCargoType')} />
            </SelectTrigger>
            <SelectContent>
              {cargoTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {t(`cargoTypes.${type}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {t('scheduledOrder.origin')}
          </label>
          <Input
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder={t('scheduledOrder.originPlaceholder')}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {t('scheduledOrder.destination')}
          </label>
          <Input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder={t('scheduledOrder.destinationPlaceholder')}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {t('scheduledOrder.scheduledDate')}
          </label>
          <Input
            type="date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              {t('scheduledOrder.weight')}
            </label>
            <Input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">
              {t('scheduledOrder.volume')}
            </label>
            <Input
              type="number"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              placeholder="0"
              step="0.01"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block flex items-center gap-2">
            <Package className="h-4 w-4" />
            {t('scheduledOrder.vehicleType')}
          </label>
          <Select value={vehicleType} onValueChange={setVehicleType}>
            <SelectTrigger>
              <SelectValue placeholder={t('scheduledOrder.selectVehicleType')} />
            </SelectTrigger>
            <SelectContent>
              {vehicleTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {t(`vehicleTypes.${type}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            {t('scheduledOrder.price')}
          </label>
          <Input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            {t('scheduledOrder.description')}
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('scheduledOrder.descriptionPlaceholder')}
            rows={3}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!cargoType || !origin || !destination || !vehicleType || !scheduledDate || isSubmitting}
          className="w-full"
        >
          {t('scheduledOrder.submit')}
        </Button>
      </div>
    </Card>
  );
}
