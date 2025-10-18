export interface DemoOrder {
  id: string;
  clientId: string;
  clientName: string;
  from: string;
  to: string;
  cargoType: 'box' | 'pallet';
  weight: number;
  price: number;
  status: 'pending' | 'accepted' | 'in_transit' | 'delivered';
  coordinates: {
    from: [number, number];
    to: [number, number];
  };
  createdAt: Date;
  acceptedBy?: string;
}

export interface DemoDriver {
  id: string;
  name: string;
  vehicleType: 'car' | 'truck' | 'container';
  vehicleNumber: string;
  status: 'free' | 'has_space' | 'no_space';
  currentLocation: [number, number];
  route?: {
    from: string;
    to: string;
  };
  rating: number;
  completedOrders: number;
}

export const demoOrders: DemoOrder[] = [
  {
    id: 'order-1',
    clientId: 'client-1',
    clientName: 'ООО "Логистика Плюс"',
    from: 'Москва, Ленинградский проспект, 80',
    to: 'Санкт-Петербург, Невский проспект, 28',
    cargoType: 'box',
    weight: 450,
    price: 15000,
    status: 'pending',
    coordinates: {
      from: [55.7887, 37.5431],
      to: [59.9343, 30.3351]
    },
    createdAt: new Date('2025-10-18T08:30:00')
  },
  {
    id: 'order-2',
    clientId: 'client-2',
    clientName: 'ИП Иванов',
    from: 'Казань, улица Баумана, 58',
    to: 'Нижний Новгород, Большая Покровская, 12',
    cargoType: 'pallet',
    weight: 1200,
    price: 22000,
    status: 'pending',
    coordinates: {
      from: [55.7887, 49.1221],
      to: [56.3287, 44.0020]
    },
    createdAt: new Date('2025-10-18T09:15:00')
  },
  {
    id: 'order-3',
    clientId: 'client-3',
    clientName: 'ТД "СтройМаркет"',
    from: 'Екатеринбург, улица Малышева, 51',
    to: 'Челябинск, улица Кирова, 104',
    cargoType: 'box',
    weight: 800,
    price: 18000,
    status: 'accepted',
    acceptedBy: 'driver-2',
    coordinates: {
      from: [56.8389, 60.6057],
      to: [55.1644, 61.4368]
    },
    createdAt: new Date('2025-10-18T07:00:00')
  },
  {
    id: 'order-4',
    clientId: 'client-4',
    clientName: 'ООО "МегаТорг"',
    from: 'Новосибирск, Красный проспект, 35',
    to: 'Омск, улица Ленина, 22',
    cargoType: 'pallet',
    weight: 2500,
    price: 35000,
    status: 'pending',
    coordinates: {
      from: [55.0084, 82.9357],
      to: [54.9885, 73.3242]
    },
    createdAt: new Date('2025-10-18T10:00:00')
  },
  {
    id: 'order-5',
    clientId: 'client-5',
    clientName: 'Склад "Восток"',
    from: 'Владивосток, Океанский проспект, 17',
    to: 'Хабаровск, улица Муравьева-Амурского, 23',
    cargoType: 'box',
    weight: 650,
    price: 28000,
    status: 'in_transit',
    acceptedBy: 'driver-3',
    coordinates: {
      from: [43.1150, 131.8855],
      to: [48.4827, 135.0838]
    },
    createdAt: new Date('2025-10-17T14:00:00')
  }
];

export const demoDrivers: DemoDriver[] = [
  {
    id: 'driver-1',
    name: 'Петров Сергей',
    vehicleType: 'truck',
    vehicleNumber: 'А123БВ777',
    status: 'free',
    currentLocation: [55.7558, 37.6173],
    rating: 4.8,
    completedOrders: 142
  },
  {
    id: 'driver-2',
    name: 'Сидоров Михаил',
    vehicleType: 'container',
    vehicleNumber: 'К456МН199',
    status: 'no_space',
    currentLocation: [56.8389, 60.6057],
    route: {
      from: 'Екатеринбург',
      to: 'Челябинск'
    },
    rating: 4.9,
    completedOrders: 218
  },
  {
    id: 'driver-3',
    name: 'Козлов Алексей',
    vehicleType: 'truck',
    vehicleNumber: 'Т789ОП125',
    status: 'no_space',
    currentLocation: [46.2994, 140.0731],
    route: {
      from: 'Владивосток',
      to: 'Хабаровск'
    },
    rating: 4.7,
    completedOrders: 95
  },
  {
    id: 'driver-4',
    name: 'Смирнов Дмитрий',
    vehicleType: 'truck',
    vehicleNumber: 'Н234СТ177',
    status: 'has_space',
    currentLocation: [59.9311, 30.3609],
    route: {
      from: 'Санкт-Петербург',
      to: 'Москва'
    },
    rating: 4.6,
    completedOrders: 167
  },
  {
    id: 'driver-5',
    name: 'Морозов Иван',
    vehicleType: 'car',
    vehicleNumber: 'У567ХЦ197',
    status: 'free',
    currentLocation: [55.7887, 49.1221],
    rating: 4.5,
    completedOrders: 78
  }
];

export const getAvailableOrders = () => {
  return demoOrders.filter(order => order.status === 'pending');
};

export const getAcceptedOrders = () => {
  return demoOrders.filter(order => order.status === 'accepted' || order.status === 'in_transit');
};

export const getDriverById = (id: string) => {
  return demoDrivers.find(driver => driver.id === id);
};

export const acceptOrder = (orderId: string, driverId: string) => {
  const order = demoOrders.find(o => o.id === orderId);
  const driver = demoDrivers.find(d => d.id === driverId);
  
  if (order && driver) {
    order.status = 'accepted';
    order.acceptedBy = driverId;
    driver.status = 'no_space';
    return true;
  }
  return false;
};
