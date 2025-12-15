import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface RouteSearchPanelProps {
  routeSearch: { from: string; to: string };
  onRouteChange: (route: { from: string; to: string }) => void;
  onLocationDetected?: (coords: { lat: number; lng: number }) => void;
}

const RouteSearchPanel = ({ routeSearch, onRouteChange, onLocationDetected }: RouteSearchPanelProps) => {
  const [detectingLocation, setDetectingLocation] = useState(false);

  const detectLocation = async () => {
    if (!navigator.geolocation) {
      alert('Геолокация не поддерживается вашим браузером');
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
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
      <Button
        variant="outline"
        size="sm"
        onClick={detectLocation}
        disabled={detectingLocation}
        className="text-xs h-8 w-full"
      >
        <Icon name={detectingLocation ? "Loader2" : "MapPin"} size={14} className={`mr-2 ${detectingLocation ? 'animate-spin' : ''}`} />
        Моя геопозиция
      </Button>
    </div>
  );
};

export default RouteSearchPanel;
