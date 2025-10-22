import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { sanitizeInput, secureLocalStorage, rateLimit } from '@/utils/security';

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

  const [cargoPhoto, setCargoPhoto] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string>('');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Скопировано',
      description: `${label} скопирован в буфер обмена`
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setCargoPhoto(base64);
        setPhotoPreview(base64);
      };
      reader.readAsDataURL(file);
    }
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
      const token = secureLocalStorage.get('auth_token');
      
      if (!token) {
        throw new Error('Требуется авторизация');
      }

      const sanitizedData = {
        document_type: documentType,
        pickup_address: sanitizeInput(formData.pickup_address, 500),
        delivery_address: sanitizeInput(formData.delivery_address, 500),
        cargo_unit: formData.cargo_unit,
        cargo_quantity: parseInt(formData.cargo_quantity),
        weight: parseFloat(formData.weight),
        delivery_date: formData.delivery_date,
        delivery_price: parseFloat(formData.delivery_price),
        cargo_photo: cargoPhoto
      };

      const response = await fetch('https://functions.poehali.dev/408b238a-389b-4a3c-9dfd-2cbbb8b83330', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token
        },
        body: JSON.stringify(sanitizedData)
      });

      const data = await response.json();

      if (response.ok) {
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
        setCargoPhoto('');
        setPhotoPreview('');
        onSuccess();
      } else {
        throw new Error(data.error || 'Ошибка создания поставки');
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
          <div className="space-y-2">
            <Label htmlFor="document_type">Тип документа *</Label>
            <Select value={documentType} onValueChange={(value: any) => setDocumentType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="delivery">Поставка</SelectItem>
                <SelectItem value="receipt">Приемка</SelectItem>
                <SelectItem value="invoice">Счет-фактура</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cargo_photo">Фото груза *</Label>
            <div className="relative">
              <Input
                id="cargo_photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                required
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full pointer-events-none"
              >
                <Icon name="Upload" size={18} className="mr-2" />
                Выбрать файл
              </Button>
            </div>
            {photoPreview && (
              <img
                src={photoPreview}
                alt="Груз"
                className="mt-3 w-full h-48 object-cover rounded-xl border border-border"
              />
            )}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pickup_address">Адрес груза *</Label>
              <div className="flex gap-2">
                <Textarea
                  id="pickup_address"
                  placeholder="Москва, ул. Ленина, д. 1"
                  value={formData.pickup_address}
                  onChange={(e) => setFormData({ ...formData, pickup_address: e.target.value })}
                  required
                  className="min-h-[80px]"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(formData.pickup_address, 'Адрес забора')}
                  disabled={!formData.pickup_address}
                >
                  <Icon name="Copy" size={18} />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery_address">Адрес доставки *</Label>
              <div className="flex gap-2">
                <Textarea
                  id="delivery_address"
                  placeholder="Санкт-Петербург, пр. Невский, д. 10"
                  value={formData.delivery_address}
                  onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                  required
                  className="min-h-[80px]"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(formData.delivery_address, 'Адрес доставки')}
                  disabled={!formData.delivery_address}
                >
                  <Icon name="Copy" size={18} />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="cargo_unit">Единицы *</Label>
                  <Select value={formData.cargo_unit} onValueChange={(val) => setFormData({ ...formData, cargo_unit: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="boxes">Коробки</SelectItem>
                      <SelectItem value="pallets">Паллеты</SelectItem>
                      <SelectItem value="pieces">Штуки</SelectItem>
                      <SelectItem value="tons">Тонны</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cargo_quantity">Количество *</Label>
                  <Input
                    id="cargo_quantity"
                    type="number"
                    placeholder="10"
                    value={formData.cargo_quantity}
                    onChange={(e) => setFormData({ ...formData, cargo_quantity: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Вес (кг)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="150.5"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                />
              </div>
            </div>
          </div>

          {documentType === 'delivery' && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="delivery_date">Дата поставки *</Label>
                <Input
                  id="delivery_date"
                  type="date"
                  value={formData.delivery_date}
                  onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="delivery_price">Цена за доставку (₽) *</Label>
                <Input
                  id="delivery_price"
                  type="number"
                  step="0.01"
                  placeholder="5000"
                  value={formData.delivery_price}
                  onChange={(e) => setFormData({ ...formData, delivery_price: e.target.value })}
                  required
                />
              </div>
            </div>
          )}

          {documentType === 'receipt' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="receipt_number">Номер приемки *</Label>
                <Input
                  id="receipt_number"
                  type="text"
                  placeholder="ПР-00001"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receipt_date">Дата приемки *</Label>
                <Input
                  id="receipt_date"
                  type="date"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quality_status">Статус качества *</Label>
                <Select defaultValue="good">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="good">Товар в отличном состоянии</SelectItem>
                    <SelectItem value="acceptable">Незначительные повреждения</SelectItem>
                    <SelectItem value="damaged">Существенные повреждения</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {documentType === 'invoice' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invoice_number">Номер счет-фактуры *</Label>
                <Input
                  id="invoice_number"
                  type="text"
                  placeholder="СФ-00001"
                  required
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice_date">Дата выставления *</Label>
                  <Input
                    id="invoice_date"
                    type="date"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_terms">Срок оплаты (дней) *</Label>
                  <Input
                    id="payment_terms"
                    type="number"
                    placeholder="30"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="total_amount">Общая сумма (₽) *</Label>
                <Input
                  id="total_amount"
                  type="number"
                  step="0.01"
                  placeholder="50000"
                  required
                />
              </div>
            </div>
          )}
          
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