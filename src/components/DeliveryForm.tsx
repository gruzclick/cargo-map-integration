import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { sanitizeInput, secureLocalStorage, rateLimit } from '@/utils/security';
import { searchWarehouses, type MarketplaceWarehouse } from '@/data/marketplaceWarehouses';

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
  const [pickupSuggestions, setPickupSuggestions] = useState<MarketplaceWarehouse[]>([]);
  const [deliverySuggestions, setDeliverySuggestions] = useState<MarketplaceWarehouse[]>([]);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDeliverySuggestions, setShowDeliverySuggestions] = useState(false);
  const pickupRef = useRef<HTMLDivElement>(null);
  const deliveryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickupRef.current && !pickupRef.current.contains(event.target as Node)) {
        setShowPickupSuggestions(false);
      }
      if (deliveryRef.current && !deliveryRef.current.contains(event.target as Node)) {
        setShowDeliverySuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePickupAddressChange = (value: string) => {
    setFormData({ ...formData, pickup_address: value });
    if (value.length > 2) {
      const results = searchWarehouses(value);
      setPickupSuggestions(results);
      setShowPickupSuggestions(results.length > 0);
    } else {
      setShowPickupSuggestions(false);
    }
  };

  const handleDeliveryAddressChange = (value: string) => {
    setFormData({ ...formData, delivery_address: value });
    if (value.length > 2) {
      const results = searchWarehouses(value);
      setDeliverySuggestions(results);
      setShowDeliverySuggestions(results.length > 0);
    } else {
      setShowDeliverySuggestions(false);
    }
  };

  const selectPickupWarehouse = (warehouse: MarketplaceWarehouse) => {
    setFormData({ ...formData, pickup_address: warehouse.address });
    setShowPickupSuggestions(false);
  };

  const selectDeliveryWarehouse = (warehouse: MarketplaceWarehouse) => {
    setFormData({ ...formData, delivery_address: warehouse.address });
    setShowDeliverySuggestions(false);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Скопировано',
      description: `${label} скопирован в буфер обмена`
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const filePromises = Array.from(files).map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });
      
      Promise.all(filePromises).then(base64Images => {
        setCargoPhotos(prev => [...prev, ...base64Images]);
      });
    }
  };

  const removePhoto = (index: number) => {
    setCargoPhotos(prev => prev.filter((_, i) => i !== index));
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
          <div className="space-y-2">
            <Label htmlFor="cargo_photo">Фото груза (можно выбрать несколько) *</Label>
            <div className="relative">
              <Input
                id="cargo_photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                multiple
                required={cargoPhotos.length === 0}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full pointer-events-none"
              >
                <Icon name="Upload" size={18} className="mr-2" />
                {cargoPhotos.length === 0 ? 'Выбрать файлы' : `Выбрано файлов: ${cargoPhotos.length}`}
              </Button>
            </div>
            {cargoPhotos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                {cargoPhotos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo}
                      alt={`Груз ${index + 1}`}
                      className="w-full h-32 object-cover rounded-xl border border-border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8"
                      onClick={() => removePhoto(index)}
                    >
                      <Icon name="X" size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2" ref={pickupRef}>
              <Label htmlFor="pickup_address">Адрес груза *</Label>
              <div className="text-xs text-gray-500 mb-1">Начните вводить название маркетплейса (Wildberries, Ozon, Яндекс Маркет...)</div>
              <div className="flex gap-2 relative">
                <div className="flex-1 relative">
                  <Textarea
                    id="pickup_address"
                    placeholder="Wildberries, Ozon, Яндекс Маркет или адрес"
                    value={formData.pickup_address}
                    onChange={(e) => handlePickupAddressChange(e.target.value)}
                    onFocus={() => {
                      if (formData.pickup_address.length > 2) {
                        const results = searchWarehouses(formData.pickup_address);
                        if (results.length > 0) setShowPickupSuggestions(true);
                      }
                    }}
                    required
                    className="min-h-[80px]"
                  />
                  {showPickupSuggestions && pickupSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                      {pickupSuggestions.map((warehouse, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => selectPickupWarehouse(warehouse)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 border-b last:border-b-0"
                        >
                          <div className="font-semibold text-sm">{warehouse.marketplace} — {warehouse.city}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">{warehouse.address}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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

            <div className="space-y-2" ref={deliveryRef}>
              <Label htmlFor="delivery_address">Адрес доставки *</Label>
              <div className="text-xs text-gray-500 mb-1">Начните вводить название маркетплейса или адрес</div>
              <div className="flex gap-2 relative">
                <div className="flex-1 relative">
                  <Textarea
                    id="delivery_address"
                    placeholder="Wildberries, Ozon, Яндекс Маркет или адрес"
                    value={formData.delivery_address}
                    onChange={(e) => handleDeliveryAddressChange(e.target.value)}
                    onFocus={() => {
                      if (formData.delivery_address.length > 2) {
                        const results = searchWarehouses(formData.delivery_address);
                        if (results.length > 0) setShowDeliverySuggestions(true);
                      }
                    }}
                    required
                    className="min-h-[80px]"
                  />
                  {showDeliverySuggestions && deliverySuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                      {deliverySuggestions.map((warehouse, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => selectDeliveryWarehouse(warehouse)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 border-b last:border-b-0"
                        >
                          <div className="font-semibold text-sm">{warehouse.marketplace} — {warehouse.city}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">{warehouse.address}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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