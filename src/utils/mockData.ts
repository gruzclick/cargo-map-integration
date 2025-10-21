import { MapMarker } from '@/components/map/MapTypes';

const cities = [
  { name: 'Москва', lat: 55.7558, lng: 37.6173 },
  { name: 'Санкт-Петербург', lat: 59.9343, lng: 30.3351 },
  { name: 'Новосибирск', lat: 55.0084, lng: 82.9357 },
  { name: 'Екатеринбург', lat: 56.8389, lng: 60.6057 },
  { name: 'Казань', lat: 55.8304, lng: 49.0661 },
  { name: 'Нижний Новгород', lat: 56.2965, lng: 43.9361 },
  { name: 'Челябинск', lat: 55.1644, lng: 61.4368 },
  { name: 'Самара', lat: 53.1959, lng: 50.1002 },
  { name: 'Ростов-на-Дону', lat: 47.2357, lng: 39.7015 },
  { name: 'Уфа', lat: 54.7388, lng: 55.9721 },
  { name: 'Красноярск', lat: 56.0153, lng: 92.8932 },
  { name: 'Воронеж', lat: 51.6720, lng: 39.1843 },
  { name: 'Пермь', lat: 58.0105, lng: 56.2502 },
  { name: 'Волгоград', lat: 48.7080, lng: 44.5133 },
  { name: 'Краснодар', lat: 45.0448, lng: 38.9760 },
  { name: 'Саратов', lat: 51.5924, lng: 46.0348 },
  { name: 'Тюмень', lat: 57.1531, lng: 65.5343 },
  { name: 'Владивосток', lat: 43.1155, lng: 131.8855 },
  { name: 'Иркутск', lat: 52.2869, lng: 104.3050 },
  { name: 'Хабаровск', lat: 48.4827, lng: 135.0838 }
];

const cargoTypes = ['box', 'pallet', 'oversized'] as const;
const vehicleCategories = ['car', 'truck', 'semi'] as const;
const vehicleStatuses = ['free', 'busy', 'on_route'] as const;
const readyStatuses = ['ready', 'scheduled'] as const;

const cargoDescriptions = [
  'Стройматериалы',
  'Мебель офисная',
  'Бытовая техника',
  'Продукты питания',
  'Одежда и текстиль',
  'Электроника',
  'Косметика и парфюмерия',
  'Автозапчасти',
  'Детские товары',
  'Спортивное оборудование',
  'Книги и канцтовары',
  'Бытовая химия',
  'Медикаменты',
  'Стекло и зеркала',
  'Металлоконструкции',
  'Пластиковые изделия',
  'Сантехника',
  'Инструменты',
  'Садовый инвентарь',
  'Упаковочные материалы'
];

const vehicleDescriptions = [
  'Газель, 1.5 тонны',
  'Фура 20 тонн',
  'Изотермический фургон',
  'Рефрижератор 10 тонн',
  'Бортовой автомобиль',
  'Тентованный грузовик',
  'Манипулятор 5 тонн',
  'Самосвал 15 тонн',
  'Цельнометаллический фургон',
  'Микроавтобус для грузов'
];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePhone(): string {
  return `+7 (9${getRandomNumber(10, 99)}) ${getRandomNumber(100, 999)}-${getRandomNumber(10, 99)}-${getRandomNumber(10, 99)}`;
}

export function generateMockCargos(count: number = 30): MapMarker[] {
  // Test mode disabled - return empty array
  // Uncomment below to enable test data generation
  /*
  const cargos: MapMarker[] = [];
  
  for (let i = 0; i < count; i++) {
    const from = getRandomElement(cities);
    let to = getRandomElement(cities);
    while (to.name === from.name) {
      to = getRandomElement(cities);
    }
    
    const cargoType = getRandomElement(cargoTypes);
    const weight = getRandomNumber(100, 5000);
    const volume = getRandomNumber(1, 40);
    const distance = getRandomNumber(100, 3000);
    const price = Math.round(distance * getRandomNumber(30, 60));
    
    cargos.push({
      id: `cargo-${i + 1}`,
      type: 'cargo',
      lat: from.lat + (Math.random() - 0.5) * 0.5,
      lng: from.lng + (Math.random() - 0.5) * 0.5,
      from: from.name,
      to: to.name,
      cargoType,
      distance,
      price,
      weight,
      volume,
      status: 'waiting',
      readyStatus: getRandomElement(readyStatuses),
      details: `${getRandomElement(cargoDescriptions)}, ${weight} кг, ${volume} м³`,
      contact: generatePhone()
    });
  }
  
  return cargos;
  */
  return [];
}

export function generateMockDrivers(count: number = 30): MapMarker[] {
  // Test mode disabled - return empty array
  // Uncomment below to enable test data generation
  /*
  const drivers: MapMarker[] = [];
  
  for (let i = 0; i < count; i++) {
    const city = getRandomElement(cities);
    const vehicleCategory = getRandomElement(vehicleCategories);
    const vehicleStatus = getRandomElement(vehicleStatuses);
    const capacity = vehicleCategory === 'car' ? getRandomNumber(1, 2) :
                     vehicleCategory === 'truck' ? getRandomNumber(3, 10) :
                     getRandomNumber(15, 25);
    
    const statusText = vehicleStatus === 'free' ? 'Свободен' :
                       vehicleStatus === 'busy' ? 'Занят' : 'В пути';
    
    drivers.push({
      id: `driver-${i + 1}`,
      type: 'driver',
      lat: city.lat + (Math.random() - 0.5) * 0.5,
      lng: city.lng + (Math.random() - 0.5) * 0.5,
      from: `${city.name} (${statusText})`,
      to: vehicleStatus === 'free' ? 'Любой маршрут' : getRandomElement(cities).name,
      vehicleCategory,
      capacity,
      distance: 0,
      price: 0,
      vehicleStatus,
      details: getRandomElement(vehicleDescriptions) + `, ${capacity} тонн`,
      contact: generatePhone()
    });
  }
  
  return drivers;
  */
  return [];
}

export function generateAllMockData(): MapMarker[] {
  return [
    ...generateMockCargos(30),
    ...generateMockDrivers(30)
  ];
}