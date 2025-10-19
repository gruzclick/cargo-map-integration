import { useState } from 'react';
import { Button } from '@/components/ui/button';
import RouteBuilder from '@/components/map/RouteBuilder';
import OpenStreetMapContainer from '@/components/map/OpenStreetMapContainer';
import Icon from '@/components/ui/icon';

interface RoutePoint {
  address: string;
  lat: number | null;
  lng: number | null;
}

export default function Routes() {
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);

  const handleRouteCalculated = async (points: RoutePoint[]) => {
    setRoutePoints(points);
    
    // Получаем маршрут через OSRM API
    const validPoints = points.filter(p => p.lat !== null && p.lng !== null);
    if (validPoints.length < 2) return;

    try {
      const coords = validPoints.map(p => `${p.lng},${p.lat}`).join(';');
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`
      );
      const data = await response.json();

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const path = data.routes[0].geometry.coordinates.map((coord: [number, number]) => 
          [coord[1], coord[0]] as [number, number]
        );
        setRoutePath(path);
      }
    } catch (error) {
      console.error('Error fetching route:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Построение маршрутов</h1>
          <p className="text-gray-600">Постройте оптимальный маршрут между несколькими точками</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <RouteBuilder onRouteCalculated={handleRouteCalculated} />
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Icon name="Map" size={20} />
                  Карта маршрута
                </h2>
                {routePath.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setRoutePath([]);
                      setRoutePoints([]);
                    }}
                  >
                    <Icon name="X" size={16} className="mr-2" />
                    Очистить
                  </Button>
                )}
              </div>
              
              <OpenStreetMapContainer
                filteredMarkers={[]}
                isPublic={false}
                onMapLoaded={() => {}}
                routePath={routePath.length > 0 ? routePath : undefined}
              />

              {routePoints.length > 0 && (
                <div className="mt-4 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                  <div className="font-semibold mb-2">Точки маршрута:</div>
                  <div className="space-y-2">
                    {routePoints.map((point, index) => (
                      <div key={index} className="flex items-start gap-2 bg-white/60 p-2 rounded">
                        <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1 text-sm">
                          {point.address}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            <Icon name="ArrowLeft" size={16} className="mr-2" />
            Вернуться на главную
          </Button>
        </div>
      </div>
    </div>
  );
}
