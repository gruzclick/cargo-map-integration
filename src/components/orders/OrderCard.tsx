import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Order } from '@/types/order';
import { openYandexNavigator, openYandexMaps } from '@/utils/navigation';

interface OrderCardProps {
  order: Order;
  onEdit: () => void;
  onClose: () => void;
  onCancel: () => void;
  onCardClick?: () => void;
}

export const OrderCard = ({ order, onEdit, onClose, onCancel, onCardClick }: OrderCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'accepted': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'in-progress': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'cancelled': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-700';
    }
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
    <div 
      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onCardClick}
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
            <h3 className="font-semibold">
              {order.type === 'shipper' ? 'Отправка груза' : 'Перевозка груза'}
            </h3>
            <p className="text-xs text-gray-500">
              {new Date(order.createdAt).toLocaleString('ru-RU')}
            </p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
          {getStatusText(order.status)}
        </span>
      </div>

      <div className="space-y-2 mb-3 text-sm">
        {order.type === 'shipper' && (
          <>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Icon name="Package" size={14} />
              <span>Грузов: {order.items.length}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Icon name="MapPin" size={14} />
              <span>Склад назначения: {order.items[0]?.warehouse?.marketplace || 'Не указан'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Icon name="Navigation" size={14} />
              <span className="truncate">{order.items[0]?.pickupAddress || 'Адрес не указан'}</span>
            </div>
          </>
        )}
        
        {order.type === 'carrier' && (
          <>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Icon name="Truck" size={14} />
              <span>Автомобилей: {order.vehicles.length}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Icon name="User" size={14} />
              <span>{order.vehicles[0]?.driverName || 'Не указан'}</span>
            </div>
            {order.vehicles[0]?.warehouse && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Icon name="MapPin" size={14} />
                <span>Склад: {order.vehicles[0].warehouse.marketplace}</span>
              </div>
            )}
          </>
        )}

        {order.acceptedBy && (
          <div className="flex items-center gap-2 text-green-600">
            <Icon name="CheckCircle" size={14} />
            <span>Принята: {order.acceptedBy.userName}</span>
          </div>
        )}
      </div>

      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
        {order.status === 'active' && (
          <>
            <Button variant="outline" size="sm" onClick={onEdit} className="flex-1">
              <Icon name="Edit" size={14} className="mr-1" />
              Редактировать
            </Button>
            <Button variant="outline" size="sm" onClick={onCancel} className="text-red-600">
              <Icon name="X" size={14} className="mr-1" />
              Отменить
            </Button>
          </>
        )}
        
        {(order.status === 'accepted' || order.status === 'in-progress') && (
          <>
            <Button variant="default" size="sm" onClick={onClose} className="flex-1">
              <Icon name="CheckCircle" size={14} className="mr-1" />
              Закрыть заявку
            </Button>
          </>
        )}
        
        {order.status === 'completed' && order.type === 'shipper' && order.confirmedCarrier && (
          <div className="flex gap-2 w-full">
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={() => openYandexNavigator(order.items[0]?.pickupAddress || '')}
            >
              <Icon name="Navigation" size={14} className="mr-1" />
              Я.Навигатор
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => openYandexMaps(order.items[0]?.pickupAddress || '')}
            >
              <Icon name="Map" size={14} className="mr-1" />
              Я.Карты
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};