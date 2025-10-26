import funcUrls from '../../backend/func2url.json';

const API_BASE_URL = funcUrls['map-data'];

export interface UserStats {
  total: number;
  drivers: number;
  clients: number;
  logists: number;
  verified: number;
}

export const getUserStats = async (): Promise<UserStats> => {
  const response = await fetch(`${API_BASE_URL}?path=/stats`, {
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
