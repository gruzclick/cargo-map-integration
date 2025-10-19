export interface RouteHistoryItem {
  id: string;
  from: string;
  to: string;
  timestamp: number;
  cargoType?: string;
  weight?: string;
}

const STORAGE_KEY = 'route_search_history';
const MAX_HISTORY_ITEMS = 10;

export function getRouteHistory(): RouteHistoryItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as RouteHistoryItem[];
  } catch {
    return [];
  }
}

export function addToRouteHistory(from: string, to: string, cargoType?: string, weight?: string): void {
  if (!from.trim() || !to.trim()) return;
  
  const history = getRouteHistory();
  
  const isDuplicate = history.some(
    item => item.from === from && item.to === to
  );
  
  if (isDuplicate) return;
  
  const newItem: RouteHistoryItem = {
    id: Date.now().toString(),
    from,
    to,
    timestamp: Date.now(),
    cargoType,
    weight
  };
  
  const updatedHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (e) {
    console.error('Failed to save route history:', e);
  }
}

export function clearRouteHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear route history:', e);
  }
}

export function removeFromRouteHistory(id: string): void {
  const history = getRouteHistory();
  const updated = history.filter(item => item.id !== id);
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to remove from route history:', e);
  }
}
