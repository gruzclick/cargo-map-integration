import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Order } from '@/types/order';

interface OrderEditModalProps {
  order: Order;
  onSave: (order: Order) => void;
  onClose: () => void;
}

export const OrderEditModal = ({ order, onSave, onClose }: OrderEditModalProps) => {
  const [editedOrder, setEditedOrder] = useState<Order>(order);

  const handleSave = () => {
    onSave({
      ...editedOrder,
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b sticky top-0 bg-white dark:bg-gray-900 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Редактировать заявку</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <Icon name="X" size={20} />
            </Button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {order.type === 'shipper' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Редактирование заявок на отправку в разработке. Пока что можно только отменить или закрыть заявку.
              </p>
            </div>
          )}

          {order.type === 'carrier' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Редактирование заявок на перевозку в разработке. Пока что можно только отменить или закрыть заявку.
              </p>
            </div>
          )}
        </div>

        <div className="p-6 border-t sticky bottom-0 bg-white dark:bg-gray-900 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Отмена
          </Button>
          <Button onClick={handleSave} className="flex-1">
            Сохранить изменения
          </Button>
        </div>
      </div>
    </div>
  );
};
