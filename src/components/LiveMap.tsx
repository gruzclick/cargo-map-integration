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
  vehicleStatus?: 'free' | 'has_space' | 'full';
  rating?: number;
  capacity?: number;
  freeSpace?: number;
  destinationWarehouse?: string;
  phone?: string;
  readyStatus?: string;
  readyTime?: string;
  quantity?: number;
  weight?: number;
  clientAddress?: string;
  clientRating?: number;
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
    script.src = 'https://api-maps.yandex.ru/2.1/?apikey=&lang=ru_RU&theme=dark';
    script.async = true;
    script.onload = () => {
      setMapLoaded(true);
      initMap();
    };
    document.body.appendChild(script);

    const style = document.createElement('style');
    style.textContent = `
      ymaps[class*="ground-pane"] {
        filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
      }
      ymaps[class*="places-pane"],
      ymaps[class*="events-pane"] {
        filter: invert(100%) hue-rotate(180deg);
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.body.removeChild(script);
      document.head.removeChild(style);
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
          controls: ['zoomControl', 'fullscreenControl'],
          options: {
            copyrightLogoVisible: false,
            copyrightProvidersVisible: false,
            copyrightUaVisible: false
          }
        });

        map.behaviors.disable('scrollZoom');

        (mapRef.current as any).yandexMap = map;
        updateMarkers();
      });
    }
  };

  const getCargoIcon = (cargoType?: string) => {
    if (cargoType === 'pallet') {
      return '<svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1.5"><path d="M8 4 L8 20 L16 20 L16 4 Z M8 4 L10 2 L14 2 L16 4 M8 20 L10 22 L14 22 L16 20" stroke-linejoin="round"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="16" x2="16" y2="16"/></svg>';
    }
    return '<svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1.5"><rect x="7" y="7" width="10" height="10" rx="1"/></svg>';
  };

  const getVehicleIcon = (vehicleCategory?: string, vehicleStatus?: string) => {
    let color = '#22c55e';
    if (vehicleStatus === 'has_space') color = '#eab308';
    if (vehicleStatus === 'full') color = '#ef4444';
    
    if (vehicleCategory === 'truck') {
      return `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><rect x="1" y="6" width="15" height="12" rx="1"/><path d="M16 8h3l3 3v5h-3"/><circle cx="5.5" cy="18.5" r="2.5" fill="${color}"/><circle cx="18.5" cy="18.5" r="2.5" fill="${color}"/></svg>`;
    } else if (vehicleCategory === 'semi') {
      return `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><rect x="1" y="6" width="10" height="10" rx="1"/><path d="M11 8h4l4 4v4h-2"/><rect x="15" y="14" width="8" height="4" rx="1"/><circle cx="5" cy="18" r="2" fill="${color}"/><circle cx="15" cy="18" r="2" fill="${color}"/><circle cx="20" cy="18" r="2" fill="${color}"/></svg>`;
    }
    return `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V14a2 2 0 0 0 2 2h2"/><circle cx="6.5" cy="16.5" r="2.5" fill="${color}"/><circle cx="16.5" cy="16.5" r="2.5" fill="${color}"/></svg>`;
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
      } else {
        iconSvg = getVehicleIcon(marker.vehicleCategory, (marker as any).vehicleStatus || 'free');
        
        const iconContent = `<div style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.25));">${iconSvg}</div>`;
        
        const placemark = new (window as any).ymaps.Placemark(
          [marker.lat, marker.lng],
          {
            hintContent: marker.name,
            balloonContent: `<div style="padding: 8px;"><strong>${marker.name}</strong><br/>${marker.details}<br/><span>${marker.status}</span></div>`
          },
          {
            iconLayout: 'default#imageWithContent',
            iconImageHref: '',
            iconImageSize: [50, 50],
            iconImageOffset: [-25, -25],
            iconContentLayout: (window as any).ymaps.templateLayoutFactory.createClass(iconContent)
          }
        );

        placemark.events.add('click', () => {
          setSelectedMarker(marker);
        });

        map.geoObjects.add(placemark);
      }
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

            {selectedMarker.type === 'driver' ? (
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Icon name="Star" size={18} className="text-yellow-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Рейтинг</p>
                      <p className="font-semibold">{selectedMarker.rating?.toFixed(1) || '5.0'} / 5.0</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Icon name="Activity" size={18} className="text-green-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Статус</p>
                      <p className="font-semibold">{selectedMarker.status || 'Доступен'}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Icon name="Weight" size={18} className="text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Вместимость</p>
                      <p className="font-semibold">{selectedMarker.capacity || 0} кг</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Icon name="Package" size={18} className="text-purple-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Свободно</p>
                      <p className="font-semibold">{selectedMarker.freeSpace?.toFixed(0) || 0} кг</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/50">
                  <div className="flex items-start gap-3">
                    <Icon name="MapPin" size={18} className="text-red-500 mt-1" />
                    <div>
                      <p className="text-xs text-muted-foreground">Склад назначения</p>
                      <p className="font-medium text-sm">{selectedMarker.destinationWarehouse || 'Не указан'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Icon name="Clock" size={18} className="text-orange-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Статус готовности</p>
                      <p className="font-semibold">{selectedMarker.readyStatus === 'ready' ? 'Готов к отгрузке' : 'Запланировано'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Icon name="Calendar" size={18} className="text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Время готовности</p>
                      <p className="font-semibold text-sm">
                        {selectedMarker.readyTime ? new Date(selectedMarker.readyTime).toLocaleString('ru-RU', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }) : 'Сейчас'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Icon name="Package" size={18} className="text-purple-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Количество</p>
                      <p className="font-semibold">{selectedMarker.quantity || 0} шт</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Icon name="Weight" size={18} className="text-green-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Вес</p>
                      <p className="font-semibold">{selectedMarker.weight || 0} кг</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Icon name="Star" size={18} className="text-yellow-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Рейтинг клиента</p>
                      <p className="font-semibold">{selectedMarker.clientRating?.toFixed(1) || '5.0'} / 5.0</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Icon name="MapPin" size={18} className="text-red-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Склад</p>
                      <p className="font-semibold text-sm">{selectedMarker.destinationWarehouse?.split('(')[0] || 'Не указан'}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/50">
                  <div className="flex items-start gap-3">
                    <Icon name="Home" size={18} className="text-indigo-500 mt-1" />
                    <div>
                      <p className="text-xs text-muted-foreground">Адрес клиента</p>
                      <p className="font-medium text-sm">{selectedMarker.clientAddress || 'Не указан'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
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