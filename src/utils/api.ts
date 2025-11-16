import funcUrls from '../../backend/func2url.json';

const ADMIN_API_URL = funcUrls['admin-auth'];

export interface UserStats {
  total: number;
  drivers: number;
  clients: number;
  logists: number;
  verified: number;
}

export const getUserStats = async (): Promise<UserStats> => {
  const response = await fetch(`${ADMIN_API_URL}?path=/api/stats/public`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user statistics');
  }

  return response.json();
};