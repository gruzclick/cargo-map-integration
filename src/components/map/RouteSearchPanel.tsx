import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getRouteHistory, addToRouteHistory, removeFromRouteHistory, clearRouteHistory, RouteHistoryItem } from '@/utils/routeHistory';
import { exportRouteHistoryToExcel } from '@/utils/excelExport';

interface RouteSearchPanelProps {
  routeSearch: { from: string; to: string };
  onRouteChange: (route: { from: string; to: string }) => void;
  onLocationDetected?: (coords: { lat: number; lng: number }) => void;
}

interface SavedRoute {
  id: string;
  from: string;
  to: string;
  name: string;
}

const RouteSearchPanel = ({ routeSearch, onRouteChange, onLocationDetected }: RouteSearchPanelProps) => {
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  const [routeName, setRouteName] = useState('');
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [routeHistory, setRouteHistory] = useState<RouteHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  useEffect(() => {
    const saved = localStorage.getItem('savedRoutes');
    if (saved) {
      setSavedRoutes(JSON.parse(saved));
    }
    setRouteHistory(getRouteHistory());
  }, []);

  const saveRoute = () => {
    if (!routeSearch.from || !routeSearch.to || !routeName) return;

    const newRoute: SavedRoute = {
      id: Date.now().toString(),
      from: routeSearch.from,
      to: routeSearch.to,
      name: routeName
    };

    const updated = [...savedRoutes, newRoute];
    setSavedRoutes(updated);
    localStorage.setItem('savedRoutes', JSON.stringify(updated));
    setRouteName('');
  };

  const loadRoute = (routeId: string) => {
    const route = savedRoutes.find(r => r.id === routeId);
    if (route) {
      onRouteChange({ from: route.from, to: route.to });
    }
  };

  const deleteRoute = (routeId: string) => {
    const updated = savedRoutes.filter(r => r.id !== routeId);
    setSavedRoutes(updated);
    localStorage.setItem('savedRoutes', JSON.stringify(updated));
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert('Геолокация не поддерживается вашим браузером');
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onLocationDetected?.({ lat: latitude, lng: longitude });
        setDetectingLocation(false);
      },
      (error) => {
        console.error('Ошибка геолокации:', error);
        alert('Не удалось определить местоположение');
        setDetectingLocation(false);
      }
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold flex items-center gap-1.5 text-gray-900 dark:text-white">
          <Icon name="Route" size={14} />
          Поиск по маршруту
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={detectLocation}
          disabled={detectingLocation}
          className="text-xs h-7 px-2"
        >
          <Icon name={detectingLocation ? "Loader2" : "MapPin"} size={12} className={`mr-1 ${detectingLocation ? 'animate-spin' : ''}`} />
          <span className="hidden md:inline">Моя геопозиция</span>
        </Button>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <AddressAutocomplete
            value={routeSearch.from}
            onChange={(value) => onRouteChange({ ...routeSearch, from: value })}
            placeholder="Откуда (город, адрес, склад)"
            className="text-xs md:text-sm"
          />
          <AddressAutocomplete
            value={routeSearch.to}
            onChange={(value) => onRouteChange({ ...routeSearch, to: value })}
            placeholder="Куда (город, адрес, склад)"
            className="text-xs md:text-sm"
          />
        </div>

        {(routeSearch.from || routeSearch.to) && (
          <Button 
            className="w-full" 
            size="sm"
            onClick={() => {
              if (routeSearch.from && routeSearch.to) {
                addToRouteHistory(routeSearch.from, routeSearch.to);
                setRouteHistory(getRouteHistory());
                console.log('Поиск маршрута:', routeSearch);
              }
            }}
          >
            <Icon name="Search" size={16} className="mr-2" />
            Найти маршрут
          </Button>
        )}
      </div>

      {routeHistory.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex-1 flex items-center justify-between text-xs font-medium text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              <div className="flex items-center gap-1.5">
                <Icon name="History" size={14} />
                История поиска ({routeHistory.length})
              </div>
              <Icon name={showHistory ? "ChevronUp" : "ChevronDown"} size={14} />
            </button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportRouteHistoryToExcel(routeHistory)}
              className="h-7 px-2 text-xs"
              title="Экспорт в Excel"
            >
              <Icon name="Download" size={14} className="mr-1" />
              Excel
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm('Очистить всю историю поиска?')) {
                  clearRouteHistory();
                  setRouteHistory([]);
                }
              }}
              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
              title="Очистить историю"
            >
              <Icon name="Trash2" size={14} />
            </Button>
          </div>

          {showHistory && (
            <>
              <div className="flex gap-1.5 mb-2">
                <Button
                  variant={dateFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDateFilter('all')}
                  className="flex-1 h-7 text-[10px]"
                >
                  Все
                </Button>
                <Button
                  variant={dateFilter === 'today' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDateFilter('today')}
                  className="flex-1 h-7 text-[10px]"
                >
                  Сегодня
                </Button>
                <Button
                  variant={dateFilter === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDateFilter('week')}
                  className="flex-1 h-7 text-[10px]"
                >
                  Неделя
                </Button>
                <Button
                  variant={dateFilter === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDateFilter('month')}
                  className="flex-1 h-7 text-[10px]"
                >
                  Месяц
                </Button>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {routeHistory.filter(item => {
                  const itemDate = new Date(item.timestamp);
                  const now = new Date();
                  
                  if (dateFilter === 'today') {
                    return itemDate.toDateString() === now.toDateString();
                  }
                  if (dateFilter === 'week') {
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    return itemDate >= weekAgo;
                  }
                  if (dateFilter === 'month') {
                    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    return itemDate >= monthAgo;
                  }
                  return true;
                }).map((item) => (
                <div
                  key={item.id}
                  className="group flex items-center gap-2 p-2 bg-muted/50 hover:bg-muted rounded-md transition-colors cursor-pointer"
                  onClick={() => onRouteChange({ from: item.from, to: item.to })}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{item.from}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Icon name="ArrowRight" size={10} />
                      <span className="truncate">{item.to}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {new Date(item.timestamp).toLocaleDateString('ru-RU', { 
                        day: 'numeric', 
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromRouteHistory(item.id);
                      setRouteHistory(getRouteHistory());
                    }}
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Icon name="X" size={12} />
                  </Button>
                </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {savedRoutes.length > 0 && (
        <div className="flex items-center gap-2">
          <Select onValueChange={loadRoute}>
            <SelectTrigger className="flex-1 h-8 text-xs">
              <SelectValue placeholder="Избранные маршруты" />
            </SelectTrigger>
            <SelectContent>
              {savedRoutes.map((route) => (
                <SelectItem key={route.id} value={route.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{route.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteRoute(route.id);
                      }}
                      className="h-5 w-5 p-0 ml-2"
                    >
                      <Icon name="X" size={12} />
                    </Button>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}


    </div>
  );
};

export default RouteSearchPanel;