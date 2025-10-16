import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import MapLegend from './MapLegend';

interface MapMarker {
  id: string;
  type: 'cargo' | 'driver';
  lat: number;
  lng: number;
  name: string;
  details: string;
  status?: string;
  cargoType?: 'box' | 'pallet';
  vehicleCategory?: 'car' | 'truck' | 'semi';
}

const LiveMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    fetchMarkers();
    const interval = setInterval(fetchMarkers, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchMarkers = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/e0c57b5b-aa36-4b28-8b31-c70ece513cae');
      const data = await response.json();
      setMarkers(data.markers || []);
    } catch (error) {
      console.error('Error fetching markers:', error);
    }
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://api-maps.yandex.ru/2.1/?apikey=&lang=ru_RU';
    script.async = true;
    script.onload = () => {
      setMapLoaded(true);
      initMap();
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (mapLoaded) {
      updateMarkers();
    }
  }, [markers, mapLoaded]);

  const initMap = () => {
    if (typeof window !== 'undefined' && (window as any).ymaps && mapRef.current) {
      (window as any).ymaps.ready(() => {
        const map = new (window as any).ymaps.Map(mapRef.current, {
          center: [55.7558, 37.6173],
          zoom: 13,
          controls: ['zoomControl', 'fullscreenControl']
        });

        (mapRef.current as any).yandexMap = map;
        updateMarkers();
      });
    }
  };

  const getCargoIcon = (cargoType?: string) => {
    if (cargoType === 'pallet') {
      return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>';
    }
    return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>';
  };

  const getVehicleIcon = (vehicleCategory?: string) => {
    if (vehicleCategory === 'truck') {
      return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"></path><circle cx="6.5" cy="16.5" r="2.5"></circle><circle cx="16.5" cy="16.5" r="2.5"></circle></svg>';
    } else if (vehicleCategory === 'semi') {
      return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M16 3h3l3 4v5h-2m-4 0H3m0 0h2m14 0v3M5 12v3m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm14 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"></path><rect x="3" y="6" width="10" height="6"></rect></svg>';
    }
    return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M19 17h2l.64-2.54c.24-.959.24-1.962 0-2.92l-1.07-4.27A3 3 0 0 0 17.66 5H4a2 2 0 0 0-2 2v10h2"></path><circle cx="7" cy="17" r="2"></circle><path d="M9 17h6"></path><circle cx="17" cy="17" r="2"></circle></svg>';
  };

  const updateMarkers = () => {
    if (!mapRef.current || !(mapRef.current as any).yandexMap) return;

    const map = (mapRef.current as any).yandexMap;
    map.geoObjects.removeAll();

    markers.forEach((marker) => {
      let iconSvg = '';
      let bgColor = '';
      
      if (marker.type === 'cargo') {
        iconSvg = getCargoIcon(marker.cargoType);
        bgColor = '#0EA5E9';
      } else {
        iconSvg = getVehicleIcon(marker.vehicleCategory);
        bgColor = '#1A1A1A';
      }
      
      const iconContent = `<div style="width: 44px; height: 44px; background: ${bgColor}; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">${iconSvg}</div>`;

      const placemark = new (window as any).ymaps.Placemark(
        [marker.lat, marker.lng],
        {
          hintContent: marker.name,
          balloonContent: `<div style="padding: 8px;"><strong>${marker.name}</strong><br/>${marker.details}<br/><span style="color: ${bgColor};">${marker.status}</span></div>`
        },
        {
          iconLayout: 'default#imageWithContent',
          iconImageHref: '',
          iconImageSize: [44, 44],
          iconImageOffset: [-22, -22],
          iconContentLayout: (window as any).ymaps.templateLayoutFactory.createClass(iconContent)
        }
      );

      placemark.events.add('click', () => {
        setSelectedMarker(marker);
      });

      map.geoObjects.add(placemark);
    });
  };

  const cargoCount = markers.filter(m => m.type === 'cargo').length;
  const driverCount = markers.filter(m => m.type === 'driver').length;

  return (
    <div className="space-y-5">
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-md rounded-2xl bg-card">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                <Icon name="Package" size={22} className="text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Грузов ожидает</p>
                <p className="text-3xl font-semibold tracking-tight">{cargoCount}</p>
              </div>
            </div>
            <Badge className="bg-accent/10 text-accent hover:bg-accent/20 border-0">Активно</Badge>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md rounded-2xl bg-card">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Icon name="Truck" size={22} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Водителей свободно</p>
                <p className="text-3xl font-semibold tracking-tight">{driverCount}</p>
              </div>
            </div>
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0">Онлайн</Badge>
          </CardContent>
        </Card>

        <MapLegend />
      </div>

      <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
        <CardContent className="p-0">
          <div 
            ref={mapRef} 
            className="w-full h-[600px]"
            style={{ minHeight: '600px' }}
          />
        </CardContent>
      </Card>

      {selectedMarker && (
        <Card className="border-0 shadow-lg rounded-2xl animate-fade-in">
          <CardContent className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  selectedMarker.type === 'cargo' ? 'bg-accent/10' : 'bg-primary/10'
                }`}>
                  <Icon 
                    name={selectedMarker.type === 'cargo' ? 'Package' : 'Truck'} 
                    size={26} 
                    className={selectedMarker.type === 'cargo' ? 'text-accent' : 'text-primary'}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-lg tracking-tight">{selectedMarker.name}</h3>
                  <p className="text-sm text-muted-foreground font-light">{selectedMarker.details}</p>
                </div>
              </div>
              <Badge className={`${selectedMarker.type === 'cargo' ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'} border-0`}>
                {selectedMarker.status}
              </Badge>
            </div>
            
            <div className="flex gap-3">
              {selectedMarker.type === 'cargo' ? (
                <>
                  <button className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-all">
                    Принять заказ
                  </button>
                  <button className="px-4 py-3 border border-border/50 rounded-xl hover:bg-secondary/50 transition-all">
                    <Icon name="Phone" size={20} />
                  </button>
                </>
              ) : (
                <>
                  <button className="flex-1 bg-accent text-accent-foreground px-6 py-3 rounded-xl font-medium hover:bg-accent/90 transition-all">
                    Связаться
                  </button>
                  <button className="px-4 py-3 border border-border/50 rounded-xl hover:bg-secondary/50 transition-all">
                    <Icon name="MapPin" size={20} />
                  </button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-6 text-xs text-muted-foreground font-medium">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-accent rounded-full" />
          <span>Грузы</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary rounded-full" />
          <span>Водители</span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>Обновление в реальном времени</span>
        </div>
      </div>
    </div>
  );
};

export default LiveMap;