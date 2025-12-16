import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { Order, OrderStatus } from '@/types/order';
import { getActiveOrders } from '@/utils/orderStorage';

interface OrdersHistoryTabProps {
  userId: string;
}

export const OrdersHistoryTab = ({ userId }: OrdersHistoryTabProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'shipper' | 'carrier'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  useEffect(() => {
    loadOrders();
  }, [userId]);

  useEffect(() => {
    applyFilters();
  }, [orders, searchTerm, statusFilter, typeFilter, dateFilter]);

  const loadOrders = () => {
    const allOrders = getActiveOrders();
    const userOrders = allOrders.filter(
      o => o.userId === userId || o.acceptedBy?.userId === userId
    );
    const archivedKey = `cargo_orders_archive`;
    const archived = JSON.parse(localStorage.getItem(archivedKey) || '[]');
    const archivedUserOrders = archived.filter(
      (o: Order) => o.userId === userId || o.acceptedBy?.userId === userId
    );
    
    const combined = [...userOrders, ...archivedUserOrders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    setOrders(combined);
  };

  const applyFilters = () => {
    let filtered = [...orders];

    // Фильтр по поиску
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order => {
        const orderId = order.id.toLowerCase();
        const userName = order.userName.toLowerCase();
        return orderId.includes(term) || userName.includes(term);
      });
    }

    // Фильтр по статусу
    if (statusFilter !== 'all') {
      filtered = filtered.filter(o => o.status === statusFilter);
    }

    // Фильтр по типу
    if (typeFilter !== 'all') {
      filtered = filtered.filter(o => o.type === typeFilter);
    }

    // Фильтр по дате
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        
        if (dateFilter === 'today') {
          return orderDate.toDateString() === now.toDateString();
        }
        
        if (dateFilter === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return orderDate >= weekAgo;
        }
        
        if (dateFilter === 'month') {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return orderDate >= monthAgo;
        }
        
        return true;
      });
    }

    setFilteredOrders(filtered);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'accepted':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'in-progress':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case 'active':
        return 'Активна';
      case 'accepted':
        return 'Принята';
      case 'in-progress':
        return 'В процессе';
      case 'completed':
        return 'Завершена';
      case 'cancelled':
        return 'Отменена';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-4">
      {/* Фильтры */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Поиск */}
          <div className="relative">
            <Icon
              name="Search"
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Поиск по ID или имени"
              className="pl-10"
            />
          </div>

          {/* Статус */}
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as OrderStatus | 'all')}>
            <SelectTrigger>
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="active">Активна</SelectItem>
              <SelectItem value="accepted">Принята</SelectItem>
              <SelectItem value="in-progress">В процессе</SelectItem>
              <SelectItem value="completed">Завершена</SelectItem>
              <SelectItem value="cancelled">Отменена</SelectItem>
            </SelectContent>
          </Select>

          {/* Тип */}
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as 'all' | 'shipper' | 'carrier')}>
            <SelectTrigger>
              <SelectValue placeholder="Тип" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все типы</SelectItem>
              <SelectItem value="shipper">Отправка груза</SelectItem>
              <SelectItem value="carrier">Перевозка груза</SelectItem>
            </SelectContent>
          </Select>

          {/* Дата */}
          <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as typeof dateFilter)}>
            <SelectTrigger>
              <SelectValue placeholder="Период" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Весь период</SelectItem>
              <SelectItem value="today">Сегодня</SelectItem>
              <SelectItem value="week">Неделя</SelectItem>
              <SelectItem value="month">Месяц</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500">
            Найдено заявок: <span className="font-medium text-gray-900 dark:text-white">{filteredOrders.length}</span>
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setTypeFilter('all');
              setDateFilter('all');
            }}
          >
            <Icon name="X" size={16} className="mr-1" />
            Сбросить фильтры
          </Button>
        </div>
      </div>

      {/* Список заявок */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
            <Icon name="Inbox" size={64} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-semibold mb-2">Заявки не найдены</h3>
            <p className="text-sm text-gray-500">
              Попробуйте изменить параметры фильтров
            </p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div
              key={order.id}
              className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    order.type === 'shipper'
                      ? 'bg-blue-100 dark:bg-blue-900'
                      : 'bg-green-100 dark:bg-green-900'
                  }`}>
                    <Icon
                      name={order.type === 'shipper' ? 'Package' : 'Truck'}
                      size={24}
                      className={order.type === 'shipper' ? 'text-blue-600' : 'text-green-600'}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {order.type === 'shipper' ? 'Отправка груза' : 'Перевозка груза'}
                    </h3>
                    <p className="text-xs text-gray-500">ID: {order.id.slice(0, 12)}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Icon name="Calendar" size={14} />
                  <span>{new Date(order.createdAt).toLocaleDateString('ru-RU')}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Icon name="User" size={14} />
                  <span>{order.userName}</span>
                </div>
              </div>

              {order.deliveryReport && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                    <Icon name="CheckCircle" size={12} />
                    Отчет о доставке
                  </p>
                  <div className="flex gap-2">
                    <img
                      src={order.deliveryReport.photoUrl}
                      alt="Delivery"
                      className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition"
                      onClick={() => window.open(order.deliveryReport?.photoUrl, '_blank')}
                    />
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      <p>Госномер: {order.deliveryReport.vehiclePlate}</p>
                      {order.deliveryReport.warehouseNumber && (
                        <p>Ворота: {order.deliveryReport.warehouseNumber}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrdersHistoryTab;
