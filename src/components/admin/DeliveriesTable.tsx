import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface Delivery {
  id: string;
  user_id: string;
  driver_id: string;
  status: string;
  pickup_address: string;
  delivery_address: string;
  delivery_price: number;
  created_at: string;
}

interface DeliveriesTableProps {
  deliveries: Delivery[];
  loading: boolean;
  onUpdateStatus: (deliveryId: string, status: string) => void;
}

export const DeliveriesTable = ({ deliveries, loading, onUpdateStatus }: DeliveriesTableProps) => {
  const [deliverySearch, setDeliverySearch] = useState('');
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState('all');

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = deliverySearch === '' ||
      delivery.pickup_address.toLowerCase().includes(deliverySearch.toLowerCase()) ||
      delivery.delivery_address.toLowerCase().includes(deliverySearch.toLowerCase());
    
    const matchesStatus = deliveryStatusFilter === 'all' || delivery.status === deliveryStatusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">Управление заказами</CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">Просмотр и управление заказами</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4 flex-wrap">
          <Input
            placeholder="Поиск по адресам..."
            value={deliverySearch}
            onChange={(e) => setDeliverySearch(e.target.value)}
            className="max-w-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          <select
            value={deliveryStatusFilter}
            onChange={(e) => setDeliveryStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
          >
            <option value="all">Все статусы</option>
            <option value="pending">Ожидание</option>
            <option value="active">Активные</option>
            <option value="completed">Завершенные</option>
            <option value="cancelled">Отмененные</option>
          </select>
        </div>
        {loading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Загрузка...
          </div>
        ) : filteredDeliveries.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Icon name="Package" size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p>Нет заказов</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left p-3 text-gray-600 dark:text-gray-400">ID</th>
                  <th className="text-left p-3 text-gray-600 dark:text-gray-400">Откуда</th>
                  <th className="text-left p-3 text-gray-600 dark:text-gray-400">Куда</th>
                  <th className="text-left p-3 text-gray-600 dark:text-gray-400">Цена</th>
                  <th className="text-left p-3 text-gray-600 dark:text-gray-400">Статус</th>
                  <th className="text-left p-3 text-gray-600 dark:text-gray-400">Дата</th>
                  <th className="text-left p-3 text-gray-600 dark:text-gray-400">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeliveries.map((delivery) => (
                  <tr key={delivery.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="p-3 text-gray-900 dark:text-gray-100 font-mono text-xs">{delivery.id.slice(0, 8)}...</td>
                    <td className="p-3 text-gray-900 dark:text-gray-100">{delivery.pickup_address}</td>
                    <td className="p-3 text-gray-900 dark:text-gray-100">{delivery.delivery_address}</td>
                    <td className="p-3 text-gray-900 dark:text-gray-100">{delivery.delivery_price} ₽</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        delivery.status === 'completed' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                        delivery.status === 'active' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                        delivery.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                        'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                      }`}>
                        {delivery.status}
                      </span>
                    </td>
                    <td className="p-3 text-gray-900 dark:text-gray-100">{new Date(delivery.created_at).toLocaleDateString('ru-RU')}</td>
                    <td className="p-3">
                      <select 
                        value={delivery.status}
                        onChange={(e) => onUpdateStatus(delivery.id, e.target.value)}
                        className="text-xs border rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
                      >
                        <option value="pending">pending</option>
                        <option value="active">active</option>
                        <option value="completed">completed</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
