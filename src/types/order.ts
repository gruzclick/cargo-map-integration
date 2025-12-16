export type OrderStatus = 'active' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';

export type OrderType = 'shipper' | 'carrier';

export interface OrderShipper {
  id: string;
  type: 'shipper';
  userId: string;
  userName: string;
  userPhone: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  
  // Shipper-specific data
  items: Array<{
    id: string;
    boxQuantity: number;
    palletQuantity: number;
    warehouse: {
      marketplace: string;
      city: string;
      address: string;
      code: string;
    };
    pickupAddress: string;
    pickupInstructions: string;
    pickupDate: string;
    pickupTime: string;
    contactPhone: string;
    senderName: string;
    photo: File | null;
  }>;
  
  // Acceptor info (when accepted)
  acceptedBy?: {
    userId: string;
    userName: string;
    userPhone: string;
    acceptedAt: string;
  };
  
  // When shipper confirms carrier
  confirmedCarrier?: {
    userId: string;
    userName: string;
    confirmedAt: string;
  };
}

export interface OrderCarrier {
  id: string;
  type: 'carrier';
  userId: string;
  userName: string;
  userPhone: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  
  // Carrier-specific data
  vehicles: Array<{
    id: string;
    driverName: string;
    driverPhone: string;
    driverLicenseNumber: string;
    carBrand: string;
    carModel: string;
    carNumber: string;
    warehouse: {
      marketplace: string;
      city: string;
      address: string;
      code: string;
    } | null;
    capacity: {
      boxes: number;
      pallets: number;
    };
    carNumberPhoto: File | null;
    carNumberReadable: boolean | null;
  }>;
  
  // Acceptor info (when accepted)
  acceptedBy?: {
    userId: string;
    userName: string;
    userPhone: string;
    acceptedAt: string;
  };
  
  // When carrier confirms shipper
  confirmedShipper?: {
    userId: string;
    userName: string;
    confirmedAt: string;
  };
}

export type Order = OrderShipper | OrderCarrier;

export interface Notification {
  id: string;
  userId: string;
  type: 'order-accepted' | 'order-confirmed' | 'order-completed' | 'order-cancelled';
  orderId: string;
  message: string;
  read: boolean;
  createdAt: string;
  expiresAt?: string;
}