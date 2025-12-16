import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import { Order, saveOrder } from '@/utils/orderStorage';

interface DeliveryReport {
  orderId: string;
  photoUrl: string;
  warehouseNumber: string;
  vehiclePlate: string;
  notes: string;
  timestamp: string;
}

interface CompleteOrderModalProps {
  orders: Order[];
  carrierUserId: string;
  carrierUserName: string;
  onComplete: () => void;
  onClose: () => void;
}

export const CompleteOrderModal = ({
  orders,
  carrierUserId,
  carrierUserName,
  onComplete,
  onClose
}: CompleteOrderModalProps) => {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [warehouseNumber, setWarehouseNumber] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>(orders.map(o => o.id));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleOrderToggle = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSubmit = async () => {
    if (!photoFile) {
      alert('Прикрепите фото автомобиля у ворот склада');
      return;
    }

    if (!vehiclePlate.trim()) {
      alert('Укажите госномер автомобиля');
      return;
    }

    if (selectedOrders.length === 0) {
      alert('Выберите хотя бы одну заявку для отправки отчета');
      return;
    }

    setIsSubmitting(true);

    try {
      const report: DeliveryReport = {
        orderId: selectedOrders.join(','),
        photoUrl: photoPreview,
        warehouseNumber,
        vehiclePlate,
        notes,
        timestamp: new Date().toISOString()
      };

      localStorage.setItem(`delivery_report_${Date.now()}`, JSON.stringify(report));

      selectedOrders.forEach(orderId => {
        const order = orders.find(o => o.id === orderId);
        if (order) {
          const updatedOrder: Order = {
            ...order,
            status: 'completed',
            completedAt: new Date().toISOString(),
            deliveryReport: report
          };
          saveOrder(updatedOrder);
        }
      });

      const chatExpiresAt = new Date();
      chatExpiresAt.setDate(chatExpiresAt.getDate() + 7);

      selectedOrders.forEach(orderId => {
        const chatKey = `chat_${orderId}`;
        const chat = localStorage.getItem(chatKey);
        if (chat) {
          const chatData = JSON.parse(chat);
          chatData.expiresAt = chatExpiresAt.toISOString();
          localStorage.setItem(chatKey, JSON.stringify(chatData));
        }
      });

      onComplete();
    } catch (error) {
      console.error('Error completing order:', error);
      alert('Произошла ошибка при завершении заказа');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                <Icon name="CheckCircle" size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Завершение заказа</h2>
                <p className="text-sm text-gray-500">Отправьте отчет о доставке</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <Icon name="X" size={20} />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Фото автомобиля */}
            <div>
              <Label htmlFor="photo">Фото автомобиля у ворот склада *</Label>
              <p className="text-xs text-gray-500 mb-2">
                На фото должен быть виден номер автомобиля и номер ворот склада
              </p>
              
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview('');
                    }}
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                </div>
              ) : (
                <label
                  htmlFor="photo"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Icon name="Camera" size={48} className="text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Нажмите для выбора фото</p>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </label>
              )}
            </div>

            {/* Номер ворот склада */}
            <div>
              <Label htmlFor="warehouse">Номер ворот склада (если есть)</Label>
              <Input
                id="warehouse"
                value={warehouseNumber}
                onChange={(e) => setWarehouseNumber(e.target.value)}
                placeholder="Например: 5А"
              />
            </div>

            {/* Госномер автомобиля */}
            <div>
              <Label htmlFor="plate">Госномер автомобиля *</Label>
              <Input
                id="plate"
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                placeholder="А123БВ77"
                required
              />
            </div>

            {/* Дополнительные заметки */}
            <div>
              <Label htmlFor="notes">Дополнительная информация</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Укажите дополнительные детали о доставке..."
                rows={3}
              />
            </div>

            {/* Выбор заявок для отправки отчета */}
            <div>
              <Label>Отправить отчет по заявкам: *</Label>
              <div className="mt-3 space-y-2">
                {orders.map(order => (
                  <div
                    key={order.id}
                    className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Checkbox
                      id={`order-${order.id}`}
                      checked={selectedOrders.includes(order.id)}
                      onCheckedChange={() => handleOrderToggle(order.id)}
                    />
                    <label
                      htmlFor={`order-${order.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <p className="font-medium text-sm">
                        {order.type === 'shipper' ? 'Отправка груза' : 'Перевозка груза'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Заявка #{order.id.slice(0, 8)} •{' '}
                        {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                      </p>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Информация */}
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg flex items-start gap-3">
              <Icon name="Info" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-600 dark:text-blue-400">
                <p className="font-medium mb-1">Внимание:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Отчет будет отправлен всем выбранным клиентам</li>
                  <li>Заявки будут автоматически завершены</li>
                  <li>Переписка с клиентами будет доступна еще 7 дней</li>
                </ul>
              </div>
            </div>

            {/* Кнопки */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Отмена
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1"
                disabled={isSubmitting || !photoFile || !vehiclePlate || selectedOrders.length === 0}
              >
                {isSubmitting ? (
                  <>
                    <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  <>
                    <Icon name="Send" size={18} className="mr-2" />
                    Отправить отчет ({selectedOrders.length})
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteOrderModal;
