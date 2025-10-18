interface CountryData {
  country: string;
  country_name: string;
  currency: string;
  currency_name: string;
  languages: string;
}

export const detectUserCountry = async (): Promise<CountryData | null> => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) throw new Error('Failed to fetch geo data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error detecting country:', error);
    return null;
  }
};

export const getCurrencyByCountry = (countryCode: string): string => {
  const currencyMap: Record<string, string> = {
    'RU': '₽',
    'KZ': '₸',
    'BY': 'Br',
    'UZ': 'сўм',
    'KG': 'с',
    'TJ': 'смн',
    'US': '$',
    'EU': '€',
  };
  return currencyMap[countryCode] || '₽';
};

export const getLanguageByCountry = (countryCode: string): string => {
  const languageMap: Record<string, string> = {
    'RU': 'ru',
    'KZ': 'kk',
    'BY': 'be',
    'UZ': 'uz',
    'KG': 'ky',
    'TJ': 'tg',
  };
  return languageMap[countryCode] || 'ru';
};
