// База данных городов России (топ-100 по населению)
export const russianCities = [
  'Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань',
  'Нижний Новгород', 'Челябинск', 'Самара', 'Омск', 'Ростов-на-Дону',
  'Уфа', 'Красноярск', 'Воронеж', 'Пермь', 'Волгоград',
  'Краснодар', 'Саратов', 'Тюмень', 'Тольятти', 'Ижевск',
  'Барнаул', 'Ульяновск', 'Иркутск', 'Хабаровск', 'Ярославль',
  'Владивосток', 'Махачкала', 'Томск', 'Оренбург', 'Кемерово',
  'Новокузнецк', 'Рязань', 'Астрахань', 'Набережные Челны', 'Пенза',
  'Липецк', 'Киров', 'Чебоксары', 'Калининград', 'Тула',
  'Курск', 'Ставрополь', 'Сочи', 'Улан-Удэ', 'Тверь',
  'Магнитогорск', 'Иваново', 'Брянск', 'Белгород', 'Сургут',
  'Владимир', 'Архангельск', 'Чита', 'Калуга', 'Смоленск',
  'Волжский', 'Курган', 'Орёл', 'Череповец', 'Владикавказ',
  'Мурманск', 'Вологда', 'Саранск', 'Тамбов', 'Стерлитамак',
  'Грозный', 'Якутск', 'Кострома', 'Комсомольск-на-Амуре', 'Петрозаводск',
  'Таганрог', 'Нижневартовск', 'Йошкар-Ола', 'Братск', 'Новороссийск',
  'Дзержинск', 'Шахты', 'Нижнекамск', 'Орск', 'Ангарск',
  'Старый Оскол', 'Великий Новгород', 'Благовещенск', 'Прокопьевск', 'Бийск',
  'Псков', 'Энгельс', 'Рыбинск', 'Балаково', 'Армавир',
  'Подольск', 'Королёв', 'Мытищи', 'Люберцы', 'Красногорск'
];

// Популярные склады и логистические центры
export const warehouses = [
  // Wildberries
  'Склад Wildberries Подольск',
  'Склад Wildberries Электросталь',
  'Склад Wildberries Коледино',
  'Склад Wildberries Санкт-Петербург',
  'Склад Wildberries Казань',
  'Склад Wildberries Новосибирск',
  'Склад Wildberries Екатеринбург',
  'Склад Wildberries Краснодар',
  
  // Ozon
  'Склад Ozon Твер',
  'Склад Ozon Софьино',
  'Склад Ozon Подольск',
  'Склад Ozon Санкт-Петербург',
  'Склад Ozon Казань',
  'Склад Ozon Екатеринбург',
  'Склад Ozon Новосибирск',
  
  // Яндекс.Маркет
  'Склад Яндекс.Маркет Софьино',
  'Склад Яндекс.Маркет Томилино',
  'Склад Яндекс.Маркет Ростов-на-Дону',
  
  // AliExpress
  'Склад AliExpress Подольск',
  'Склад AliExpress Электросталь',
  
  // Другие логистические центры
  'ЛЦ ПЭК Москва',
  'ЛЦ ПЭК Санкт-Петербург',
  'ЛЦ Деловые Линии Москва',
  'ЛЦ Деловые Линии Санкт-Петербург',
  'ЛЦ СДЭК Москва',
  'ЛЦ СДЭК Новосибирск',
  'ЛЦ Байкал Сервис Иркутск',
  'Склад Леруа Мерлен Котельники',
  'Склад ИКЕА Химки',
  'Склад Metro Москва',
  'Терминал Почта России Москва',
  'Терминал Почта России Санкт-Петербург'
];

// Популярные адреса и объекты
export const popularAddresses = [
  'Москва, МКАД',
  'Москва, Садовое кольцо',
  'Москва, Третье транспортное кольцо',
  'Санкт-Петербург, КАД',
  'Аэропорт Шереметьево',
  'Аэропорт Домодедово',
  'Аэропорт Внуково',
  'Аэропорт Пулково',
  'Морской порт Новороссийск',
  'Морской порт Владивосток',
  'Морской порт Санкт-Петербург'
];

// Функция автодополнения
export function getAddressSuggestions(input: string, limit: number = 10): string[] {
  if (!input || input.length < 2) return [];
  
  const searchTerm = input.toLowerCase().trim();
  const suggestions: string[] = [];
  
  // Поиск по городам
  const matchingCities = russianCities
    .filter(city => city.toLowerCase().includes(searchTerm))
    .slice(0, 5);
  suggestions.push(...matchingCities);
  
  // Поиск по складам
  const matchingWarehouses = warehouses
    .filter(warehouse => warehouse.toLowerCase().includes(searchTerm))
    .slice(0, 3);
  suggestions.push(...matchingWarehouses);
  
  // Поиск по популярным адресам
  const matchingAddresses = popularAddresses
    .filter(address => address.toLowerCase().includes(searchTerm))
    .slice(0, 2);
  suggestions.push(...matchingAddresses);
  
  return suggestions.slice(0, limit);
}

// Категории для группировки
export function getCategorizedSuggestions(input: string) {
  if (!input || input.length < 2) return { cities: [], warehouses: [], addresses: [] };
  
  const searchTerm = input.toLowerCase().trim();
  
  return {
    cities: russianCities.filter(city => city.toLowerCase().includes(searchTerm)).slice(0, 5),
    warehouses: warehouses.filter(warehouse => warehouse.toLowerCase().includes(searchTerm)).slice(0, 5),
    addresses: popularAddresses.filter(address => address.toLowerCase().includes(searchTerm)).slice(0, 3)
  };
}
