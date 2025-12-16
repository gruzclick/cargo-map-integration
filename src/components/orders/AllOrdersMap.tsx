import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Order } from '@/types/order';
import { getActiveOrders, saveOrder, addNotification } from '@/utils/orderStorage';

interface AllOrdersMapProps {
  currentUserId: string;
  currentUserName: string;
  onOrderAccept: (orderId: string) => void;
}

export const AllOrdersMap = ({ currentUserId, currentUserName, onOrderAccept }: AllOrdersMapProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const loadOrders = () => {
      const active = getActiveOrders().filter(o => o.userId !== currentUserId);
      setOrders(active);
    };

    loadOrders();
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, [currentUserId]);

  const handleAcceptOrder = (order: Order) => {
    const updatedOrder: Order = {
      ...order,
      status: 'accepted',
      acceptedBy: {
        userId: currentUserId,
        userName: currentUserName,
        userPhone: '',
        acceptedAt: new Date().toISOString()
      },
      updatedAt: new Date().toISOString()
    };

    saveOrder(updatedOrder);

    addNotification({
      id: crypto.randomUUID(),
      userId: order.userId,
      type: 'order-accepted',
      orderId: order.id,
      message: `Пользователь ${currentUserName} принял вашу заявку`,
      read: false,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600000).toISOString()
    });

    onOrderAccept(order.id);
    setSelectedOrder(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Доступные заявки</h3>
        <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded-full text-sm">
          {orders.length}
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Icon name="Inbox" size={48} className="mx-auto mb-3 opacity-50" />
          <p>Нет доступных заявок</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {orders.map(order => (
            <div
              key={order.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
              onClick={() => setSelectedOrder(order)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    order.type === 'shipper' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-green-100 dark:bg-green-900'
                  }`}>
                    <Icon 
                      name={order.type === 'shipper' ? 'Package' : 'Truck'} 
                      size={20}
                      className={order.type === 'shipper' ? 'text-blue-600' : 'text-green-600'}
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold">
                      {order.type === 'shipper' ? 'Нужна перевозка' : 'Ищет груз'}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleString('ru-RU')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm mb-3">
                {order.type === 'shipper' && (
                  <>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Icon name="Package" size={14} />
                      <span>
                        {order.items.reduce((sum, item) => sum + item.boxQuantity + item.palletQuantity, 0)} мест
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Icon name="MapPin" size={14} />
                      <span>{order.items[0]?.warehouse?.city || 'Не указан'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Icon name="Calendar" size={14} />
                      <span>{new Date(order.items[0]?.pickupDate).toLocaleDateString('ru-RU')}</span>
                    </div>
                  </>
                )}
                
                {order.type === 'carrier' && (
                  <>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Icon name="Truck" size={14} />
                      <span>
                        {order.vehicles[0]?.carBrand} {order.vehicles[0]?.carModel}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Icon name="Package" size={14} />
                      <span>
                        До {order.vehicles[0]?.capacity.boxes} коробов, {order.vehicles[0]?.capacity.pallets} паллет
                      </span>
                    </div>
                  </>
                )}
              </div>

              <Button
                variant="default"
                size="sm"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAcceptOrder(order);
                }}
              >
                <Icon name="Check" size={16} className="mr-2" />
                Принять заявку
              </Button>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Детали заявки</h3>
              <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}>
                <Icon name="X" size={20} />
              </Button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Телефон будет доступен после подтверждения заказчиком
              </p>

              <Button
                variant="default"
                className="w-full"
                onClick={() => handleAcceptOrder(selectedOrder)}
              >
                <Icon name="Check" size={16} className="mr-2" />
                Принять заявку
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
