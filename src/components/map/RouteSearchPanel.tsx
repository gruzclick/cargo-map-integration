import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  useEffect(() => {
    const saved = localStorage.getItem('savedRoutes');
    if (saved) {
      setSavedRoutes(JSON.parse(saved));
    }
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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm md:text-base font-semibold flex items-center gap-2">
          <Icon name="Route" size={16} className="text-primary" />
          Поиск по маршруту
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={detectLocation}
          disabled={detectingLocation}
          className="text-xs h-7 md:h-8"
        >
          <Icon name={detectingLocation ? "Loader2" : "MapPin"} size={14} className={`mr-1 ${detectingLocation ? 'animate-spin' : ''}`} />
          Моя геопозиция
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Input
          placeholder="Откуда"
          value={routeSearch.from}
          onChange={(e) => onRouteChange({ ...routeSearch, from: e.target.value })}
          className="text-xs md:text-sm"
        />
        <Input
          placeholder="Куда"
          value={routeSearch.to}
          onChange={(e) => onRouteChange({ ...routeSearch, to: e.target.value })}
          className="text-xs md:text-sm"
        />
      </div>

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

      {routeSearch.from && routeSearch.to && (
        <div className="flex gap-2">
          <Input
            placeholder="Название маршрута"
            value={routeName}
            onChange={(e) => setRouteName(e.target.value)}
            className="text-xs flex-1 h-8"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={saveRoute}
            disabled={!routeName}
            className="text-xs h-8"
          >
            <Icon name="Star" size={14} className="mr-1" />
            Сохранить
          </Button>
        </div>
      )}
    </div>
  );
};

export default RouteSearchPanel;