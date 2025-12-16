import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { getActiveOrders, saveOrder } from '@/utils/orderStorage';
import { Order } from '@/types/order';
import { canCreateOrder } from '@/utils/ratingCheck';

interface UnifiedOrdersPanelProps {
  userId: string;
  userName: string;
  userRating?: number;
  onCreateOrder?: () => void;
}

export const UnifiedOrdersPanel = ({ 
  userId, 
  userName, 
  userRating = 0,
  onCreateOrder 
}: UnifiedOrdersPanelProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedSections, setExpandedSections] = useState({
    accepted: true,
    myOrders: true,
    available: true
  });

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  const loadOrders = () => {
    const allOrders = getActiveOrders();
    setOrders(allOrders);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Принятые заявки (которые я принял)
  const acceptedOrders = orders.filter(
    o => o.acceptedBy?.userId === userId && o.status !== 'completed' && o.status !== 'cancelled'
  );

  // Мои заявки (которые я создал)
  const myOrders = orders.filter(
    o => o.userId === userId && o.status !== 'completed' && o.status !== 'cancelled'
  );

  // Доступные заявки (активные, не мои, не принятые)
  const availableOrders = orders.filter(
    o => o.status === 'active' && 
        o.userId !== userId && 
        !o.acceptedBy
  );

  const handleAcceptOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const updatedOrder: Order = {
      ...order,
      status: 'accepted',
      acceptedBy: {
        userId,
        userName,
        acceptedAt: new Date().toISOString()
      }
    };

    saveOrder(updatedOrder);
    loadOrders();
  };

  const handleCancelOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    if (confirm('Отменить заявку?')) {
      const updatedOrder: Order = {
        ...order,
        status: 'cancelled',
        cancelledAt: new Date().toISOString()
      };
      saveOrder(updatedOrder);
      loadOrders();
    }
  };

  const handleCreateOrder = () => {
    const check = canCreateOrder(userRating);
    if (!check.allowed) {
      alert(check.message);
      return;
    }
    onCreateOrder?.();
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      accepted: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      'in-progress': 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      completed: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
    };
    return badges[status as keyof typeof badges] || badges.active;
  };

  const getStatusText = (status: string) => {
    const texts = {
      active: 'Активна',
      accepted: 'Принята',
      'in-progress': 'В процессе',
      completed: 'Завершена',
      cancelled: 'Отменена'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const renderOrderCard = (order: Order, showActions: 'accept' | 'cancel' | 'view') => (
    <div
      key={order.id}
      className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
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
            <h4 className="font-semibold text-sm">
              {order.type === 'shipper' ? 'Отправка груза' : 'Перевозка груза'}
            </h4>
            <p className="text-xs text-gray-500">{order.userName}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
          {getStatusText(order.status)}
        </span>
      </div>

      <div className="space-y-2 text-sm mb-3">
        <div className="flex items-start gap-2">
          <Icon name="MapPin" size={14} className="text-gray-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-gray-600 dark:text-gray-400">{order.fromAddress}</p>
            <Icon name="ArrowDown" size={12} className="text-gray-400 my-1" />
            <p className="text-gray-600 dark:text-gray-400">{order.toAddress}</p>
          </div>
        </div>
        
        {order.pickupDate && (
          <div className="flex items-center gap-2 text-gray-500">
            <Icon name="Calendar" size={14} />
            <span className="text-xs">
              {new Date(order.pickupDate).toLocaleDateString('ru-RU')}
              {order.pickupTime && ` в ${order.pickupTime}`}
            </span>
          </div>
        )}
      </div>

      {showActions === 'accept' && (
        <Button
          onClick={() => handleAcceptOrder(order.id)}
          size="sm"
          className="w-full"
        >
          <Icon name="Check" size={16} className="mr-2" />
          Принять заявку
        </Button>
      )}

      {showActions === 'cancel' && (
        <Button
          onClick={() => handleCancelOrder(order.id)}
          size="sm"
          variant="destructive"
          className="w-full"
        >
          <Icon name="X" size={16} className="mr-2" />
          Отменить
        </Button>
      )}
    </div>
  );

  return (
    <div className="fixed right-4 top-20 w-80 max-h-[calc(100vh-100px)] bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col z-40">
      {/* Заголовок */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Заявки</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {acceptedOrders.length + myOrders.length + availableOrders.length}
            </span>
          </div>
        </div>
        
        <Button
          onClick={handleCreateOrder}
          size="sm"
          className="w-full"
        >
          <Icon name="Plus" size={16} className="mr-2" />
          Создать заявку
        </Button>
      </div>

      {/* Контент с прокруткой */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Принятые заявки */}
        {acceptedOrders.length > 0 && (
          <div className="border border-yellow-200 dark:border-yellow-800 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('accepted')}
              className="w-full px-4 py-3 bg-yellow-50 dark:bg-yellow-950 flex items-center justify-between hover:bg-yellow-100 dark:hover:bg-yellow-900 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Icon name="CheckCircle" size={18} className="text-yellow-600" />
                <span className="font-semibold text-sm">Принятые мной</span>
                <span className="text-xs bg-yellow-200 dark:bg-yellow-800 px-2 py-0.5 rounded-full">
                  {acceptedOrders.length}
                </span>
              </div>
              <Icon
                name={expandedSections.accepted ? 'ChevronUp' : 'ChevronDown'}
                size={18}
                className="text-gray-500"
              />
            </button>
            
            {expandedSections.accepted && (
              <div className="p-3 space-y-2 bg-white dark:bg-gray-900">
                {acceptedOrders.map(order => renderOrderCard(order, 'view'))}
              </div>
            )}
          </div>
        )}

        {/* Мои заявки */}
        {myOrders.length > 0 && (
          <div className="border border-blue-200 dark:border-blue-800 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('myOrders')}
              className="w-full px-4 py-3 bg-blue-50 dark:bg-blue-950 flex items-center justify-between hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Icon name="User" size={18} className="text-blue-600" />
                <span className="font-semibold text-sm">Мои заявки</span>
                <span className="text-xs bg-blue-200 dark:bg-blue-800 px-2 py-0.5 rounded-full">
                  {myOrders.length}
                </span>
              </div>
              <Icon
                name={expandedSections.myOrders ? 'ChevronUp' : 'ChevronDown'}
                size={18}
                className="text-gray-500"
              />
            </button>
            
            {expandedSections.myOrders && (
              <div className="p-3 space-y-2 bg-white dark:bg-gray-900">
                {myOrders.map(order => renderOrderCard(order, 'cancel'))}
              </div>
            )}
          </div>
        )}

        {/* Доступные заявки */}
        {availableOrders.length > 0 && (
          <div className="border border-green-200 dark:border-green-800 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('available')}
              className="w-full px-4 py-3 bg-green-50 dark:bg-green-950 flex items-center justify-between hover:bg-green-100 dark:hover:bg-green-900 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Icon name="List" size={18} className="text-green-600" />
                <span className="font-semibold text-sm">Доступные</span>
                <span className="text-xs bg-green-200 dark:bg-green-800 px-2 py-0.5 rounded-full">
                  {availableOrders.length}
                </span>
              </div>
              <Icon
                name={expandedSections.available ? 'ChevronUp' : 'ChevronDown'}
                size={18}
                className="text-gray-500"
              />
            </button>
            
            {expandedSections.available && (
              <div className="p-3 space-y-2 bg-white dark:bg-gray-900">
                {availableOrders.map(order => renderOrderCard(order, 'accept'))}
              </div>
            )}
          </div>
        )}

        {acceptedOrders.length === 0 && myOrders.length === 0 && availableOrders.length === 0 && (
          <div className="text-center py-12">
            <Icon name="Inbox" size={48} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-500">Заявок пока нет</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedOrdersPanel;
