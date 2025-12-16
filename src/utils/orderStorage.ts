import { Order, OrderShipper, OrderCarrier, Notification } from '@/types/order';

const ORDERS_KEY = 'cargo_orders';
const NOTIFICATIONS_KEY = 'cargo_notifications';
const USER_DEFAULTS_KEY = 'user_defaults';

export interface UserDefaults {
  shipper?: {
    senderName: string;
    contactPhone: string;
    pickupAddress: string;
    pickupInstructions: string;
  };
  carrier?: {
    driverName: string;
    driverPhone: string;
    driverLicenseNumber: string;
    carBrand: string;
    carModel: string;
    carNumber: string;
  };
}

// Orders Management
export const getOrders = (): Order[] => {
  try {
    const stored = localStorage.getItem(ORDERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveOrder = (order: Order): void => {
  const orders = getOrders();
  const existingIndex = orders.findIndex(o => o.id === order.id);
  
  if (existingIndex >= 0) {
    orders[existingIndex] = order;
  } else {
    orders.push(order);
  }
  
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
};

export const deleteOrder = (orderId: string): void => {
  const orders = getOrders().filter(o => o.id !== orderId);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
};

export const getUserOrders = (userId: string): Order[] => {
  return getOrders().filter(o => o.userId === userId);
};

export const getActiveOrders = (): Order[] => {
  return getOrders().filter(o => o.status === 'active');
};

// Notifications Management
export const getNotifications = (userId: string): Notification[] => {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    const all: Notification[] = stored ? JSON.parse(stored) : [];
    return all.filter(n => n.userId === userId);
  } catch {
    return [];
  }
};

export const addNotification = (notification: Notification): void => {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    const notifications: Notification[] = stored ? JSON.parse(stored) : [];
    notifications.push(notification);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  } catch {
    console.error('Failed to save notification');
  }
};

export const markNotificationRead = (notificationId: string): void => {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    const notifications: Notification[] = stored ? JSON.parse(stored) : [];
    const updated = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  } catch {
    console.error('Failed to update notification');
  }
};

// User Defaults Management
export const getUserDefaults = (userId: string): UserDefaults => {
  try {
    const stored = localStorage.getItem(`${USER_DEFAULTS_KEY}_${userId}`);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

export const saveUserDefaults = (userId: string, defaults: UserDefaults): void => {
  try {
    localStorage.setItem(`${USER_DEFAULTS_KEY}_${userId}`, JSON.stringify(defaults));
  } catch {
    console.error('Failed to save user defaults');
  }
};

export const updateShipperDefaults = (
  userId: string, 
  data: Partial<UserDefaults['shipper']>
): void => {
  const defaults = getUserDefaults(userId);
  saveUserDefaults(userId, {
    ...defaults,
    shipper: { ...defaults.shipper, ...data } as UserDefaults['shipper']
  });
};

export const updateCarrierDefaults = (
  userId: string,
  data: Partial<UserDefaults['carrier']>
): void => {
  const defaults = getUserDefaults(userId);
  saveUserDefaults(userId, {
    ...defaults,
    carrier: { ...defaults.carrier, ...data } as UserDefaults['carrier']
  });
};
