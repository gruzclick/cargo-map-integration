export const TELEGRAM_BLOCKED_COUNTRIES = [
  'CN',
  'IR',
  'KP',
  'TM'
];

export interface CountryInfo {
  countryCode: string;
  countryName: string;
  isTelegramBlocked: boolean;
}

export const detectUserCountry = async (): Promise<CountryInfo> => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    const countryCode = data.country_code || 'US';
    const countryName = data.country_name || 'Unknown';
    const isTelegramBlocked = TELEGRAM_BLOCKED_COUNTRIES.includes(countryCode);

    return {
      countryCode,
      countryName,
      isTelegramBlocked
    };
  } catch (error) {
    console.error('Error detecting country:', error);
    return {
      countryCode: 'US',
      countryName: 'Unknown',
      isTelegramBlocked: false
    };
  }
};

export const shouldUseEmailAuth = (countryCode: string): boolean => {
  return TELEGRAM_BLOCKED_COUNTRIES.includes(countryCode);
};