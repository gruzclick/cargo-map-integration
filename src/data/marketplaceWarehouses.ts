export interface MarketplaceWarehouse {
  marketplace: string;
  city: string;
  address: string;
  code?: string;
}

export const marketplaceWarehouses: MarketplaceWarehouse[] = [
  // Wildberries
  { marketplace: 'Wildberries', city: 'Москва', address: 'Московская область, г. Электросталь, Ногинское шоссе, 47', code: 'WB_MOW_1' },
  { marketplace: 'Wildberries', city: 'Москва', address: 'Московская область, г. Подольск, ул. Комсомольская, 1', code: 'WB_MOW_2' },
  { marketplace: 'Wildberries', city: 'Санкт-Петербург', address: 'Ленинградская область, г. Шушары, Московское шоссе, 15', code: 'WB_SPB_1' },
  { marketplace: 'Wildberries', city: 'Санкт-Петербург', address: 'Ленинградская область, Всеволожский район, д. Новосаратовка', code: 'WB_SPB_2' },
  { marketplace: 'Wildberries', city: 'Казань', address: 'Республика Татарстан, г. Казань, Дербышки, ул. Олимпийская, 1', code: 'WB_KZN' },
  { marketplace: 'Wildberries', city: 'Екатеринбург', address: 'Свердловская область, г. Екатеринбург, Кольцовский тракт, 16', code: 'WB_EKB' },
  { marketplace: 'Wildberries', city: 'Новосибирск', address: 'Новосибирская область, г. Новосибирск, ул. Станционная, 2а', code: 'WB_NSK' },
  { marketplace: 'Wildberries', city: 'Краснодар', address: 'Краснодарский край, г. Краснодар, ул. Дальняя, 39/3', code: 'WB_KRD' },
  { marketplace: 'Wildberries', city: 'Хабаровск', address: 'Хабаровский край, г. Хабаровск, ул. Краснореченская, 163', code: 'WB_HBR' },
  
  // Ozon
  { marketplace: 'Ozon', city: 'Москва', address: 'Московская область, г. Котельники, Дзержинское шоссе, 1', code: 'OZON_MOW_1' },
  { marketplace: 'Ozon', city: 'Москва', address: 'Московская область, г. Чехов, Симферопольское шоссе, 136', code: 'OZON_MOW_2' },
  { marketplace: 'Ozon', city: 'Санкт-Петербург', address: 'Ленинградская область, г. Всеволожск, Всеволожский пр., 114', code: 'OZON_SPB' },
  { marketplace: 'Ozon', city: 'Казань', address: 'Республика Татарстан, Верхнеуслонский район, с. Верхний Услон', code: 'OZON_KZN' },
  { marketplace: 'Ozon', city: 'Екатеринбург', address: 'Свердловская область, г. Екатеринбург, ул. Базовая, 61', code: 'OZON_EKB' },
  { marketplace: 'Ozon', city: 'Новосибирск', address: 'Новосибирская область, Новосибирский район, р.п. Кольцово', code: 'OZON_NSK' },
  { marketplace: 'Ozon', city: 'Краснодар', address: 'Краснодарский край, г. Краснодар, ул. Уральская, 77', code: 'OZON_KRD' },
  { marketplace: 'Ozon', city: 'Ростов-на-Дону', address: 'Ростовская область, Аксайский район, х. Ленина', code: 'OZON_RND' },
  
  // Яндекс Маркет
  { marketplace: 'Яндекс Маркет', city: 'Москва', address: 'Московская область, г. Софрино, ул. Новая, 1', code: 'YM_MOW_1' },
  { marketplace: 'Яндекс Маркет', city: 'Москва', address: 'Московская область, г. Томилино, ул. Гаршина, 11', code: 'YM_MOW_2' },
  { marketplace: 'Яндекс Маркет', city: 'Санкт-Петербург', address: 'Ленинградская область, г. Янино-1, ул. Шоссейная, 48', code: 'YM_SPB' },
  { marketplace: 'Яндекс Маркет', city: 'Екатеринбург', address: 'Свердловская область, г. Екатеринбург, ул. Монтажников, 5', code: 'YM_EKB' },
  { marketplace: 'Яндекс Маркет', city: 'Казань', address: 'Республика Татарстан, г. Казань, ул. Восстания, 100', code: 'YM_KZN' },
  { marketplace: 'Яндекс Маркет', city: 'Ростов-на-Дону', address: 'Ростовская область, г. Ростов-на-Дону, пр. Стачки, 245', code: 'YM_RND' },
  
  // AliExpress Россия
  { marketplace: 'AliExpress', city: 'Москва', address: 'Московская область, Солнечногорский район, дер. Есипово', code: 'ALI_MOW' },
  { marketplace: 'AliExpress', city: 'Санкт-Петербург', address: 'Ленинградская область, Гатчинский район, дер. Малое Верево', code: 'ALI_SPB' },
  { marketplace: 'AliExpress', city: 'Екатеринбург', address: 'Свердловская область, г. Екатеринбург, Кольцовский тракт, 2', code: 'ALI_EKB' },
  
  // Мегамаркет (Сбер)
  { marketplace: 'Мегамаркет', city: 'Москва', address: 'Московская область, г. Видное, Белокаменное шоссе, 1', code: 'MM_MOW' },
  { marketplace: 'Мегамаркет', city: 'Санкт-Петербург', address: 'Ленинградская область, г. Колпино, Заводской пр., 56', code: 'MM_SPB' },
  { marketplace: 'Мегамаркет', city: 'Казань', address: 'Республика Татарстан, г. Казань, ул. Складская, 12', code: 'MM_KZN' },
  
  // Lamoda
  { marketplace: 'Lamoda', city: 'Москва', address: 'Московская область, г. Балашиха, МКАД 75 км, вл. 26', code: 'LAM_MOW' },
  { marketplace: 'Lamoda', city: 'Санкт-Петербург', address: 'Ленинградская область, г. Пушкин, Кадетский бульвар, 22', code: 'LAM_SPB' },
];

export const getWarehousesByMarketplace = (marketplaceName: string): MarketplaceWarehouse[] => {
  return marketplaceWarehouses.filter(w => 
    w.marketplace.toLowerCase().includes(marketplaceName.toLowerCase())
  );
};

export const getWarehousesByCity = (cityName: string): MarketplaceWarehouse[] => {
  return marketplaceWarehouses.filter(w => 
    w.city.toLowerCase().includes(cityName.toLowerCase())
  );
};

export const searchWarehouses = (query: string): MarketplaceWarehouse[] => {
  const lowerQuery = query.toLowerCase();
  return marketplaceWarehouses.filter(w => 
    w.marketplace.toLowerCase().includes(lowerQuery) ||
    w.city.toLowerCase().includes(lowerQuery) ||
    w.address.toLowerCase().includes(lowerQuery)
  );
};
