import func2url from '../../backend/func2url.json';

export const getBackendUrl = (functionName: keyof typeof func2url): string => {
  return func2url[functionName];
};

export const BACKEND_URLS = {
  TELEGRAM_REGISTER: getBackendUrl('telegram-register'),
  TELEGRAM_VERIFY: getBackendUrl('telegram-verify'),
  PROFILE: getBackendUrl('profile'),
  TELEGRAM_BROADCAST: getBackendUrl('telegram-broadcast'),
  ADMIN_AUTH: getBackendUrl('admin-auth'),
  AUTH: getBackendUrl('auth'),
  MAP_DATA: getBackendUrl('map-data'),
} as const;
