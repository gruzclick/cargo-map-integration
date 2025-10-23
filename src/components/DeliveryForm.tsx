import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { sanitizeInput, rateLimit } from '@/utils/security';
import CargoPhotoUpload from '@/components/delivery-form/CargoPhotoUpload';
import AddressInputWithSuggestions from '@/components/delivery-form/AddressInputWithSuggestions';
import CargoDetailsFields from '@/components/delivery-form/CargoDetailsFields';
import DocumentTypeFields from '@/components/delivery-form/DocumentTypeFields';

interface DeliveryFormProps {
  onSuccess: () => void;
}

const DeliveryForm = ({ onSuccess }: DeliveryFormProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [documentType, setDocumentType] = useState<'delivery' | 'receipt' | 'invoice'>('delivery');
  
  const [formData, setFormData] = useState({
    pickup_address: '',
    delivery_address: '',
    cargo_unit: 'boxes',
    cargo_quantity: '',
    weight: '',
    delivery_date: '',
    delivery_price: ''
  });

  const [cargoPhotos, setCargoPhotos] = useState<string[]>([]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Скопировано',
      description: `${label} скопирован в буфер обмена`
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rateLimit('delivery-form', 5, 60000)) {
      toast({
        variant: 'destructive',
        title: 'Слишком много запросов',
        description: 'Подождите минуту перед следующей отправкой'
      });
      return;
    }
    
    setLoading(true);

    try {
      const sanitizedData = {
        id: crypto.randomUUID(),
        document_type: documentType,
        pickup_address: sanitizeInput(formData.pickup_address, 500),
        delivery_address: sanitizeInput(formData.delivery_address, 500),
        cargo_unit: formData.cargo_unit,
        cargo_quantity: parseInt(formData.cargo_quantity),
        weight: parseFloat(formData.weight),
        delivery_date: formData.delivery_date,
        delivery_price: parseFloat(formData.delivery_price),
        cargo_photos: cargoPhotos,
        created_at: new Date().toISOString(),
        status: 'pending'
      };

      const existingDeliveries = JSON.parse(localStorage.getItem('deliveries') || '[]');
      existingDeliveries.push(sanitizedData);
      localStorage.setItem('deliveries', JSON.stringify(existingDeliveries));

      toast({
        title: 'Поставка создана!',
        description: 'Ваша заявка принята и ожидает перевозчика'
      });
      
      setFormData({
        pickup_address: '',
        delivery_address: '',
        cargo_unit: 'boxes',
        cargo_quantity: '',
        weight: '',
        delivery_date: '',
        delivery_price: ''
      });
      setCargoPhotos([]);
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Произошла ошибка при создании поставки',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-xl rounded-3xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
            <Icon name="Package" size={24} className="text-accent" />
          </div>
          Создать поставку
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <CargoPhotoUpload
            photos={cargoPhotos}
            onPhotosChange={setCargoPhotos}
            required={true}
          />

          <div className="grid md:grid-cols-2 gap-4">
            <AddressInputWithSuggestions
              id="pickup_address"
              label="Адрес груза *"
              value={formData.pickup_address}
              onChange={(value) => setFormData({ ...formData, pickup_address: value })}
              onCopy={() => copyToClipboard(formData.pickup_address, 'Адрес забора')}
              placeholder="Wildberries, Ozon, Яндекс Маркет или адрес"
              required={true}
            />

            <AddressInputWithSuggestions
              id="delivery_address"
              label="Адрес доставки *"
              value={formData.delivery_address}
              onChange={(value) => setFormData({ ...formData, delivery_address: value })}
              onCopy={() => copyToClipboard(formData.delivery_address, 'Адрес доставки')}
              placeholder="Wildberries, Ozon, Яндекс Маркет или адрес"
              required={true}
            />

            <CargoDetailsFields
              cargoUnit={formData.cargo_unit}
              cargoQuantity={formData.cargo_quantity}
              weight={formData.weight}
              onCargoUnitChange={(value) => setFormData({ ...formData, cargo_unit: value })}
              onCargoQuantityChange={(value) => setFormData({ ...formData, cargo_quantity: value })}
              onWeightChange={(value) => setFormData({ ...formData, weight: value })}
            />
          </div>

          <DocumentTypeFields
            documentType={documentType}
            deliveryDate={formData.delivery_date}
            deliveryPrice={formData.delivery_price}
            onDeliveryDateChange={(value) => setFormData({ ...formData, delivery_date: value })}
            onDeliveryPriceChange={(value) => setFormData({ ...formData, delivery_price: value })}
          />
          
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 flex gap-2">
            <Icon name="MessageSquare" size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-400">
              После создания заявки вы сможете общаться с перевозчиком через встроенный чат
            </p>
          </div>

          <Button type="submit" className="w-full h-12 text-base rounded-xl" disabled={loading}>
            {loading ? (
              <>
                <Icon name="Loader2" size={18} className="animate-spin mr-2" />
                Создание...
              </>
            ) : (
              <>
                <Icon name="Plus" size={18} className="mr-2" />
                Создать поставку
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default DeliveryForm;
