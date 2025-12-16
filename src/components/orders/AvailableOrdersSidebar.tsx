import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Order } from '@/types/order';
import { getActiveOrders, saveOrder, addNotification } from '@/utils/orderStorage';

interface AvailableOrdersSidebarProps {
  currentUserId: string;
  currentUserName: string;
  onOrderAccept: (orderId: string) => void;
}

export const AvailableOrdersSidebar = ({ 
  currentUserId, 
  currentUserName,
  onOrderAccept 
}: AvailableOrdersSidebarProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const loadOrders = () => {
    const activeOrders = getActiveOrders().filter(o => o.userId !== currentUserId);
    setOrders(activeOrders);
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, [currentUserId]);

  const handleAcceptOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const confirmed = window.confirm('Принять эту заявку? Заказчик получит уведомление.');
    if (!confirmed) return;

    const updatedOrder = {
      ...order,
      status: 'accepted' as const,
      acceptedBy: {
        userId: currentUserId,
        userName: currentUserName,
        userPhone: currentUserId,
        acceptedAt: new Date().toISOString()
      }
    };

    saveOrder(updatedOrder);

    addNotification({
      id: crypto.randomUUID(),
      userId: order.userId,
      type: 'order-accepted',
      orderId: order.id,
      message: `${currentUserName} хочет принять вашу заявку`,
      read: false,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
    });

    onOrderAccept(orderId);
    loadOrders();
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Активна';
      case 'accepted': return 'Принята';
      case 'in-progress': return 'В процессе';
      case 'completed': return 'Завершена';
      case 'cancelled': return 'Отменена';
      default: return status;
    }
  };

  return (
    <>
      <div className={`fixed right-0 top-16 h-[calc(100vh-4rem)] w-full md:w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-2xl transition-all duration-300 z-40 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } overflow-hidden flex flex-col`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Icon name="ListFilter" size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Доступные заявки</h2>
              <p className="text-xs text-gray-500">Принимайте заказы</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {orders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Icon name="Inbox" size={48} className="mx-auto mb-3 opacity-50" />
              <p className="font-medium">Нет доступных заявок</p>
              <p className="text-sm">Новые заявки появятся здесь</p>
            </div>
          ) : (
            orders.map(order => (
              <div 
                key={order.id} 
                className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg transition-all bg-white dark:bg-gray-800"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      order.type === 'shipper' 
                        ? 'bg-blue-100 dark:bg-blue-900' 
                        : 'bg-green-100 dark:bg-green-900'
                    }`}>
                      <Icon 
                        name={order.type === 'shipper' ? 'Package' : 'Truck'} 
                        size={20}
                        className={order.type === 'shipper' ? 'text-blue-600' : 'text-green-600'}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">
                        {order.type === 'shipper' ? 'Отправка груза' : 'Перевозка груза'}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleString('ru-RU')}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    {getStatusText(order.status)}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  {order.type === 'shipper' && order.items.length > 0 && (
                    <>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Icon name="MapPin" size={14} />
                        <span className="truncate">{order.items[0]?.pickupAddress || 'Адрес не указан'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Icon name="Package" size={14} />
                        <span>Коробок: {order.items[0]?.boxQuantity || 0}, Паллет: {order.items[0]?.palletQuantity || 0}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Icon name="Calendar" size={14} />
                        <span>{new Date(order.items[0]?.pickupDate || '').toLocaleDateString('ru-RU')}</span>
                      </div>
                    </>
                  )}

                  {order.type === 'carrier' && order.vehicles.length > 0 && (
                    <>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Icon name="Truck" size={14} />
                        <span>{order.vehicles[0]?.carBrand} {order.vehicles[0]?.carModel}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Icon name="User" size={14} />
                        <span>{order.vehicles[0]?.driverName || 'Не указан'}</span>
                      </div>
                    </>
                  )}
                </div>

                <Button 
                  onClick={() => handleAcceptOrder(order.id)} 
                  className="w-full mt-4 gap-2"
                  size="sm"
                >
                  <Icon name="CheckCircle" size={16} />
                  Принять заявку
                </Button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-950">
          <div className="flex items-start gap-2 text-xs text-blue-600 dark:text-blue-400">
            <Icon name="Info" size={14} className="flex-shrink-0 mt-0.5" />
            <p>
              При принятии заявки заказчик получит уведомление. У него есть 1 час на подтверждение.
            </p>
          </div>
        </div>
      </div>

      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed right-4 top-20 z-30 shadow-lg transition-all ${
          isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        size="sm"
      >
        <Icon name="ListFilter" size={18} className="mr-2" />
        Заявки
        {orders.length > 0 && (
          <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
            {orders.length}
          </span>
        )}
      </Button>
    </>
  );
};
