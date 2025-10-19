import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface RoutePoint {
  address: string;
  lat: number | null;
  lng: number | null;
}

interface RouteBuilderProps {
  onRouteCalculated?: (route: RoutePoint[]) => void;
}

export default function RouteBuilder({ onRouteCalculated }: RouteBuilderProps) {
  const [points, setPoints] = useState<RoutePoint[]>([
    { address: '', lat: null, lng: null },
    { address: '', lat: null, lng: null },
  ]);
  const [calculating, setCalculating] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{
    distance: number;
    duration: number;
    path: [number, number][];
  } | null>(null);

  const addPoint = () => {
    if (points.length < 10) {
      setPoints([...points, { address: '', lat: null, lng: null }]);
    }
  };

  const removePoint = (index: number) => {
    if (points.length > 2) {
      setPoints(points.filter((_, i) => i !== index));
    }
  };

  const updatePoint = (index: number, address: string) => {
    const newPoints = [...points];
    newPoints[index].address = address;
    setPoints(newPoints);
  };

  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      // Используем бесплатный Nominatim API для геокодирования
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  const calculateRoute = async () => {
    setCalculating(true);
    setRouteInfo(null);

    try {
      // Геокодируем все адреса
      const geocodedPoints = await Promise.all(
        points.map(async (point) => {
          if (!point.address.trim()) return null;
          const coords = await geocodeAddress(point.address);
          return coords ? { ...point, ...coords } : null;
        })
      );

      const validPoints = geocodedPoints.filter((p): p is RoutePoint & { lat: number; lng: number } => 
        p !== null && p.lat !== null && p.lng !== null
      );

      if (validPoints.length < 2) {
        alert('Не удалось найти адреса. Проверьте правильность ввода.');
        setCalculating(false);
        return;
      }

      // Используем OSRM для построения маршрута
      const coords = validPoints.map(p => `${p.lng},${p.lat}`).join(';');
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`
      );
      const data = await response.json();

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const distance = (route.distance / 1000).toFixed(1); // км
        const duration = Math.round(route.duration / 60); // минуты
        const path = route.geometry.coordinates.map((coord: [number, number]) => 
          [coord[1], coord[0]] as [number, number]
        );

        setRouteInfo({
          distance: parseFloat(distance),
          duration,
          path,
        });

        if (onRouteCalculated) {
          onRouteCalculated(validPoints);
        }
      } else {
        alert('Не удалось построить маршрут между указанными точками.');
      }
    } catch (error) {
      console.error('Route calculation error:', error);
      alert('Ошибка при построении маршрута. Попробуйте еще раз.');
    } finally {
      setCalculating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Route" size={20} />
          Построение маршрута
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {points.map((point, index) => (
            <div key={index} className="flex gap-2 items-start">
              <div className="flex-1 space-y-1">
                <Label className="text-xs text-gray-600">
                  Точка {index + 1} {index === 0 && '(Откуда)'} {index === points.length - 1 && '(Куда)'}
                </Label>
                <Input
                  placeholder="Введите адрес (например: Москва, Красная площадь)"
                  value={point.address}
                  onChange={(e) => updatePoint(index, e.target.value)}
                />
              </div>
              {points.length > 2 && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removePoint(index)}
                  className="mt-6"
                >
                  <Icon name="X" size={16} />
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={addPoint}
            disabled={points.length >= 10}
            className="flex-1"
          >
            <Icon name="Plus" size={16} className="mr-2" />
            Добавить точку
          </Button>
          <Button
            onClick={calculateRoute}
            disabled={calculating || points.some(p => !p.address.trim())}
            className="flex-1"
          >
            {calculating ? (
              <>
                <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                Строю маршрут...
              </>
            ) : (
              <>
                <Icon name="Navigation" size={16} className="mr-2" />
                Построить маршрут
              </>
            )}
          </Button>
        </div>

        {routeInfo && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg space-y-2">
            <div className="font-semibold text-lg mb-2">Информация о маршруте:</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/60 backdrop-blur-sm p-3 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Расстояние</div>
                <div className="text-2xl font-bold text-blue-600">
                  {routeInfo.distance} км
                </div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm p-3 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Время в пути</div>
                <div className="text-2xl font-bold text-purple-600">
                  {Math.floor(routeInfo.duration / 60)}ч {routeInfo.duration % 60}м
                </div>
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm p-3 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">Точек маршрута</div>
              <div className="text-sm font-medium">{routeInfo.path.length} координат</div>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <Icon name="Info" size={14} className="inline mr-1" />
          Маршрут строится с использованием OpenStreetMap. Для точности укажите полные адреса.
        </div>
      </CardContent>
    </Card>
  );
}
