import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Order } from '@/types/order';
import { getUserOrders, deleteOrder, saveOrder, addNotification, archiveOrder } from '@/utils/orderStorage';
import { OrderCard } from './OrderCard';
import { OrderEditModal } from './OrderEditModal';

interface OrdersPanelProps {
  userId: string;
  userName: string;
  isOpen: boolean;
  onToggle: () => void;
}

export const OrdersPanel = ({ userId, userName, isOpen, onToggle }: OrdersPanelProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const loadOrders = () => {
    const userOrders = getUserOrders(userId);
    const activeOrders = userOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');
    setOrders(activeOrders);
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  const handleCloseOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const confirmed = window.confirm('Вы уверены, что хотите закрыть заявку? Заявка будет перемещена в архив с доступом только для чтения.');
    if (!confirmed) return;

    // Archive order (moves to readonly archive)
    archiveOrder(orderId);

    // Notify accepted users
    if (order.acceptedBy) {
      addNotification({
        id: crypto.randomUUID(),
        userId: order.acceptedBy.userId,
        type: 'order-completed',
        orderId: order.id,
        message: `Заказчик ${userName} закрыл заявку`,
        read: false,
        createdAt: new Date().toISOString()
      });
    }

    loadOrders();
  };

  const handleCancelOrder = (orderId: string) => {
    const confirmed = window.confirm('Вы уверены, что хотите отменить заявку?');
    if (!confirmed) return;

    deleteOrder(orderId);
    loadOrders();
  };

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (updatedOrder: Order) => {
    saveOrder(updatedOrder);
    setIsEditModalOpen(false);
    setSelectedOrder(null);
    loadOrders();
  };

  return (
    <>
      <div className={`fixed top-16 left-0 w-full bg-white dark:bg-gray-900 border-b shadow-lg transition-all duration-300 z-40 ${
        isOpen ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Icon name="ClipboardList" size={24} className="text-blue-600" />
              <h2 className="text-xl font-bold">Мои заявки</h2>
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full text-sm font-medium">
                {orders.length}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={onToggle}>
              <Icon name="ChevronUp" size={20} />
            </Button>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Icon name="Inbox" size={48} className="mx-auto mb-3 opacity-50" />
              <p>У вас пока нет заявок</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {orders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onEdit={() => handleEditOrder(order)}
                  onClose={() => handleCloseOrder(order.id)}
                  onCancel={() => handleCancelOrder(order.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Button
        onClick={onToggle}
        className="fixed top-20 left-4 z-30 shadow-lg"
        variant={isOpen ? "secondary" : "default"}
      >
        <Icon name="ClipboardList" size={20} className="mr-2" />
        Мои заявки ({orders.length})
        <Icon name={isOpen ? "ChevronUp" : "ChevronDown"} size={16} className="ml-2" />
      </Button>

      {isEditModalOpen && selectedOrder && (
        <OrderEditModal
          order={selectedOrder}
          onSave={handleSaveEdit}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </>
  );
};