import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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

const DeliveryFormMultiStep = ({ onSuccess }: DeliveryFormProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);

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

  const steps = [
    { number: 1, title: 'Маршрут', icon: 'MapPin' as const },
    { number: 2, title: 'Груз', icon: 'Package' as const },
    { number: 3, title: 'Дата и цена', icon: 'Calendar' as const }
  ];

  const canProceedToStep2 = formData.pickup_address && formData.delivery_address;
  const canProceedToStep3 = formData.cargo_unit && formData.cargo_quantity && formData.weight;
  const canSubmit = formData.delivery_date && formData.delivery_price;

  const handleNext = () => {
    if (currentStep === 1 && !canProceedToStep2) {
      toast({
        title: 'Заполните адреса',
        description: 'Укажите пункты отправления и назначения',
        variant: 'destructive'
      });
      return;
    }
    if (currentStep === 2 && !canProceedToStep3) {
      toast({
        title: 'Укажите параметры груза',
        description: 'Заполните тип, количество и вес груза',
        variant: 'destructive'
      });
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      toast({
        title: 'Заполните дату и цену',
        description: 'Укажите когда нужно доставить и стоимость',
        variant: 'destructive'
      });
      return;
    }

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
      setCurrentStep(1);
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
    <Card className="w-full max-w-2xl mx-auto bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-xl">
      <CardContent className="p-4 md:p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      currentStep >= step.number 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                    }`}
                  >
                    <Icon name={step.icon} size={20} />
                  </div>
                  <span className={`text-xs mt-2 ${
                    currentStep >= step.number 
                      ? 'text-blue-600 dark:text-blue-400 font-medium' 
                      : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded ${
                    currentStep > step.number 
                      ? 'bg-blue-600' 
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form className="space-y-4">
          {currentStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Откуда и куда везём?
              </h3>
              <AddressInputWithSuggestions
                label="Откуда забрать"
                value={formData.pickup_address}
                onChange={(val) => setFormData({ ...formData, pickup_address: val })}
                placeholder="Москва, ул. Ленина, 1"
                icon="MapPin"
              />
              <AddressInputWithSuggestions
                label="Куда доставить"
                value={formData.delivery_address}
                onChange={(val) => setFormData({ ...formData, delivery_address: val })}
                placeholder="Санкт-Петербург, Невский проспект, 50"
                icon="Navigation"
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Что везём?
              </h3>
              <CargoDetailsFields
                formData={formData}
                setFormData={setFormData}
              />
              <div className="pt-4">
                <CargoPhotoUpload
                  cargoPhotos={cargoPhotos}
                  setCargoPhotos={setCargoPhotos}
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Когда и за сколько?
              </h3>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  <Icon name="Calendar" size={16} className="inline mr-2" />
                  Дата доставки
                </label>
                <input
                  type="date"
                  value={formData.delivery_date}
                  onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  <Icon name="DollarSign" size={16} className="inline mr-2" />
                  Цена доставки (₽)
                </label>
                <input
                  type="number"
                  value={formData.delivery_price}
                  onChange={(e) => setFormData({ ...formData, delivery_price: e.target.value })}
                  placeholder="5000"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <DocumentTypeFields
                documentType={documentType}
                setDocumentType={setDocumentType}
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="flex-1"
              >
                <Icon name="ChevronLeft" size={18} className="mr-2" />
                Назад
              </Button>
            )}
            
            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Далее
                <Icon name="ChevronRight" size={18} className="ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? (
                  <>
                    <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                    Создание...
                  </>
                ) : (
                  <>
                    <Icon name="Check" size={18} className="mr-2" />
                    Создать заказ
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DeliveryFormMultiStep;
