export const CURRENCIES = {
  RUB: { symbol: '₽', name: 'Российский рубль', code: 'RUB' },
  KZT: { symbol: '₸', name: 'Казахский тенге', code: 'KZT' },
  BYN: { symbol: 'Br', name: 'Белорусский рубль', code: 'BYN' },
  UZS: { symbol: 'сўм', name: 'Узбекский сум', code: 'UZS' },
  KGS: { symbol: 'с', name: 'Киргизский сом', code: 'KGS' },
  TJS: { symbol: 'смн', name: 'Таджикский сомони', code: 'TJS' },
  USD: { symbol: '$', name: 'Доллар США', code: 'USD' },
  EUR: { symbol: '€', name: 'Евро', code: 'EUR' },
};

export const EXCHANGE_RATES: Record<string, Record<string, number>> = {
  RUB: {
    RUB: 1,
    KZT: 4.5,
    BYN: 0.03,
    UZS: 1150,
    KGS: 8.5,
    TJS: 1.05,
    USD: 0.011,
    EUR: 0.0095,
  },
  KZT: {
    RUB: 0.22,
    KZT: 1,
    BYN: 0.0067,
    UZS: 256,
    KGS: 1.89,
    TJS: 0.23,
    USD: 0.0024,
    EUR: 0.0021,
  },
  BYN: {
    RUB: 33.33,
    KZT: 150,
    BYN: 1,
    UZS: 38300,
    KGS: 283,
    TJS: 35,
    USD: 0.37,
    EUR: 0.32,
  },
  UZS: {
    RUB: 0.00087,
    KZT: 0.0039,
    BYN: 0.000026,
    UZS: 1,
    KGS: 0.0074,
    TJS: 0.00091,
    USD: 0.0000096,
    EUR: 0.0000083,
  },
  KGS: {
    RUB: 0.12,
    KZT: 0.53,
    BYN: 0.0035,
    UZS: 135,
    KGS: 1,
    TJS: 0.12,
    USD: 0.0013,
    EUR: 0.0011,
  },
  TJS: {
    RUB: 0.95,
    KZT: 4.35,
    BYN: 0.029,
    UZS: 1095,
    KGS: 8.13,
    TJS: 1,
    USD: 0.01,
    EUR: 0.009,
  },
  USD: {
    RUB: 91,
    KZT: 420,
    BYN: 2.7,
    UZS: 104500,
    KGS: 770,
    TJS: 95,
    USD: 1,
    EUR: 0.86,
  },
  EUR: {
    RUB: 105,
    KZT: 488,
    BYN: 3.14,
    UZS: 121500,
    KGS: 895,
    TJS: 110,
    USD: 1.16,
    EUR: 1,
  },
};

export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
  if (fromCurrency === toCurrency) return amount;
  
  const rate = EXCHANGE_RATES[fromCurrency]?.[toCurrency];
  if (!rate) {
    console.warn(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
    return amount;
  }
  
  return Math.round(amount * rate);
};

export const formatPrice = (amount: number, currency: string): string => {
  const currencyInfo = CURRENCIES[currency as keyof typeof CURRENCIES];
  if (!currencyInfo) return `${amount}`;
  
  return `${amount.toLocaleString('ru-RU')} ${currencyInfo.symbol}`;
};

export const detectCurrencyByCountry = (countryCode: string): string => {
  const countryToCurrency: Record<string, string> = {
    RU: 'RUB',
    KZ: 'KZT',
    BY: 'BYN',
    UZ: 'UZS',
    KG: 'KGS',
    TJ: 'TJS',
    US: 'USD',
    EU: 'EUR',
  };
  
  return countryToCurrency[countryCode] || 'RUB';
};
