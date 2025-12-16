import { getActiveOrders } from './orderStorage';
import type { Order } from '@/types/order';

export interface OrderMarker {
  id: string;
  lat: number;
  lng: number;
  type: 'order-pickup' | 'order-delivery';
  order: Order;
  title: string;
  details: string;
  icon: string;
  color: string;
}

/**
 * Преобразует заявки в маркеры для карты
 */
export const getOrderMarkers = (): OrderMarker[] => {
  const orders = getActiveOrders();
  const markers: OrderMarker[] = [];

  orders.forEach(order => {
    // Проверяем наличие координат
    if (!order.fromLat || !order.fromLng) return;

    // Маркер точки погрузки
    const pickupMarker: OrderMarker = {
      id: `order-pickup-${order.id}`,
      lat: order.fromLat,
      lng: order.fromLng,
      type: 'order-pickup',
      order,
      title: order.type === 'shipper' ? 'Погрузка груза' : 'Забор груза',
      details: `${order.fromAddress} → ${order.toAddress}`,
      icon: order.type === 'shipper' ? 'Package' : 'Truck',
      color: order.status === 'active' ? '#3b82f6' : '#10b981'
    };
    markers.push(pickupMarker);

    // Маркер точки доставки (если есть координаты)
    if (order.toLat && order.toLng) {
      const deliveryMarker: OrderMarker = {
        id: `order-delivery-${order.id}`,
        lat: order.toLat,
        lng: order.toLng,
        type: 'order-delivery',
        order,
        title: 'Доставка',
        details: order.toAddress,
        icon: 'MapPin',
        color: order.status === 'completed' ? '#10b981' : '#f59e0b'
      };
      markers.push(deliveryMarker);
    }
  });

  return markers;
};

/**
 * Вычисляет расстояние между двумя точками (в км)
 * Использует формулу гаверсинусов
 */
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Радиус Земли в км
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Округляем до 0.1 км
};

const toRad = (deg: number): number => {
  return (deg * Math.PI) / 180;
};

/**
 * Находит ближайшие заявки к заданной точке
 */
export const findNearbyOrders = (
  userLat: number,
  userLng: number,
  maxDistance: number = 50
): Array<Order & { distance: number }> => {
  const orders = getActiveOrders();
  
  return orders
    .filter(order => order.fromLat && order.fromLng && order.status === 'active')
    .map(order => ({
      ...order,
      distance: calculateDistance(userLat, userLng, order.fromLat!, order.fromLng!)
    }))
    .filter(order => order.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance);
};
