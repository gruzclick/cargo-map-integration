import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import MapLegend from './MapLegend';
import MapFilters, { FilterState } from './MapFilters';
import CargoTypeIcon from './CargoTypeIcon';

interface MapMarker {
  id: string;
  type: 'cargo' | 'driver';
  lat: number;
  lng: number;
  name: string;
  details: string;
  status?: string;
  cargoType?: 'box' | 'pallet' | 'oversized';
  vehicleCategory?: 'car' | 'truck' | 'semi';
  vehicleStatus?: 'free' | 'has_space' | 'full';
  rating?: number;
  capacity?: number;
  freeSpace?: number;
  destinationWarehouse?: string;
  readyStatus?: string;
  readyTime?: string;
  quantity?: number;
  weight?: number;
  volume?: number;
  clientAddress?: string;
  clientRating?: number;
}

interface CargoDetailsModal {
  type: 'box' | 'pallet' | 'oversized';
  isDriver: boolean;
}

interface VehicleDetailsModal {
  type: 'car' | 'truck' | 'semi';
  isClient: boolean;
}

interface LiveMapProps {
  isPublic?: boolean;
  onMarkerClick?: () => void;
}

const LiveMap = ({ isPublic = false, onMarkerClick }: LiveMapProps = {}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [filteredMarkers, setFilteredMarkers] = useState<MapMarker[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ userType: 'all' });
  const [routeSearch, setRouteSearch] = useState({ from: '', to: '' });
  
  const [cargoDetailsModal, setCargoDetailsModal] = useState<CargoDetailsModal | null>(null);
  const [cargoDetails, setCargoDetails] = useState({ quantity: '', weight: '', volume: '' });
  
  const [vehicleDetailsModal, setVehicleDetailsModal] = useState<VehicleDetailsModal | null>(null);
  const [vehicleDetails, setVehicleDetails] = useState({ boxCount: '', palletCount: '', oversizedCount: '', volume: '' });

  useEffect(() => {
    fetchMarkers();
    const interval = setInterval(fetchMarkers, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [markers, filters, routeSearch]);

  const applyFilters = () => {
    let filtered = [...markers];
    
    if (filters.userType === 'client') {
      filtered = filtered.filter(m => m.type === 'driver');
    } else if (filters.userType === 'carrier') {
      filtered = filtered.filter(m => m.type === 'cargo');
    }

    if (filters.cargoType && filters.cargoType !== 'all') {
      filtered = filtered.filter(m => m.cargoType === filters.cargoType);
    }

    if (filters.vehicleType && filters.vehicleType !== 'all') {
      filtered = filtered.filter(m => m.vehicleCategory === filters.vehicleType);
    }

    if (routeSearch.from && routeSearch.to) {
      filtered = filtered.filter(m => {
        const details = m.details?.toLowerCase() || '';
        return details.includes(routeSearch.from.toLowerCase()) || 
               details.includes(routeSearch.to.toLowerCase());
      });
    }

    setFilteredMarkers(filtered);
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

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
  }, [filteredMarkers, mapLoaded]);

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
    } else if (cargoType === 'oversized') {
      return '<text x="12" y="16" font-size="18" font-weight="bold" fill="white" text-anchor="middle" font-family="monospace">Н</text>';
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

    filteredMarkers.forEach((marker) => {
      let iconSvg = '';
      let bgColor = '';
      
      if (marker.type === 'cargo') {
        if (marker.status === 'accepted' || marker.status === 'in_transit' || marker.status === 'delivered') {
          return;
        }
        
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
          if (isPublic) {
            onMarkerClick?.();
          } else {
            setSelectedMarker(marker);
          }
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
          if (isPublic) {
            onMarkerClick?.();
          } else {
            setSelectedMarker(marker);
          }
        });

        map.geoObjects.add(placemark);
      }
    });
  };

  const handleCargoTypeClick = (type: 'box' | 'pallet' | 'oversized', isDriver: boolean) => {
    setCargoDetailsModal({ type, isDriver });
    setCargoDetails({ quantity: '', weight: '', volume: '' });
  };

  const handleVehicleTypeClick = (type: 'car' | 'truck' | 'semi', isClient: boolean) => {
    setVehicleDetailsModal({ type, isClient });
    setVehicleDetails({ boxCount: '', palletCount: '', oversizedCount: '', volume: '' });
  };

  const submitCargoDetails = () => {
    console.log('Cargo details submitted:', cargoDetailsModal, cargoDetails);
    setCargoDetailsModal(null);
    applyFilters();
  };

  const submitVehicleDetails = () => {
    console.log('Vehicle details submitted:', vehicleDetailsModal, vehicleDetails);
    setVehicleDetailsModal(null);
    applyFilters();
  };

  const cargoCount = filteredMarkers.filter(m => m.type === 'cargo').length;
  const driverCount = filteredMarkers.filter(m => m.type === 'driver').length;

  return (
    <div className="space-y-3 md:space-y-5">
      <div className="flex flex-col md:flex-row gap-3 items-stretch">
        <Card className="border border-gray-200/20 dark:border-gray-700/30 shadow-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl flex-1 animate-scale-in">
          <CardContent className="p-3 md:p-5">
            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
              <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-sky-400 to-sky-600 rounded-xl flex items-center justify-center shadow-lg">
                <Icon name="Package" size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] md:text-xs text-gray-600 dark:text-gray-400">Грузов ожидает</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">{cargoCount}</p>
                  <Badge variant="secondary" className="text-[9px] md:text-[10px] px-1.5 py-0">в сети</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200/20 dark:border-gray-700/30 shadow-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl flex-1 animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <CardContent className="p-3 md:p-5">
            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
              <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Icon name="Truck" size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] md:text-xs text-gray-600 dark:text-gray-400">Водителей свободно</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">{driverCount}</p>
                  <Badge variant="secondary" className="text-[9px] md:text-[10px] px-1.5 py-0">активны</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-gray-200/20 dark:border-gray-700/30 shadow-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl overflow-hidden animate-scale-in" style={{ animationDelay: '0.2s' }}>
        <CardContent className="p-3 md:p-5">
          <div className="mb-3 md:mb-4">
            <h3 className="text-sm md:text-base font-semibold mb-2 flex items-center gap-2">
              <Icon name="Route" size={16} className="text-primary" />
              Поиск по маршруту
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Input
                placeholder="Откуда"
                value={routeSearch.from}
                onChange={(e) => setRouteSearch({ ...routeSearch, from: e.target.value })}
                className="text-xs md:text-sm"
              />
              <Input
                placeholder="Куда"
                value={routeSearch.to}
                onChange={(e) => setRouteSearch({ ...routeSearch, to: e.target.value })}
                className="text-xs md:text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-3 md:mb-4">
            <div>
              <h3 className="text-xs md:text-sm font-semibold mb-2 flex items-center gap-1.5">
                <Icon name="Package" size={14} className="text-sky-500" />
                Типы грузов
              </h3>
              <div className="grid grid-cols-1 gap-1.5 md:gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCargoTypeClick('box', filters.userType === 'carrier')}
                  className="justify-start text-xs h-8 md:h-9"
                >
                  <Icon name="Package" size={14} className="mr-1.5 text-sky-500 shrink-0" />
                  <span className="truncate">Коробки</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCargoTypeClick('pallet', filters.userType === 'carrier')}
                  className="justify-start text-xs h-8 md:h-9"
                >
                  <Icon name="Layers" size={14} className="mr-1.5 text-sky-500 shrink-0" />
                  <span className="truncate">Паллеты</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCargoTypeClick('oversized', filters.userType === 'carrier')}
                  className="justify-start text-xs h-8 md:h-9"
                >
                  <CargoTypeIcon type="oversized" size={14} className="mr-1.5 text-sky-500 shrink-0" />
                  <span className="truncate">Негабарит</span>
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-xs md:text-sm font-semibold mb-2 flex items-center gap-1.5">
                <Icon name="Truck" size={14} className="text-green-500" />
                Транспорт
              </h3>
              <div className="grid grid-cols-1 gap-1.5 md:gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleVehicleTypeClick('car', filters.userType === 'client')}
                  className="justify-start text-xs h-8 md:h-9"
                >
                  <Icon name="Car" size={14} className="mr-1.5 text-green-500 shrink-0" />
                  <span className="truncate">Легковой</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleVehicleTypeClick('truck', filters.userType === 'client')}
                  className="justify-start text-xs h-8 md:h-9"
                >
                  <Icon name="Truck" size={14} className="mr-1.5 text-green-500 shrink-0" />
                  <span className="truncate">Грузовой</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleVehicleTypeClick('semi', filters.userType === 'client')}
                  className="justify-start text-xs h-8 md:h-9"
                >
                  <Icon name="Container" size={14} className="mr-1.5 text-green-500 shrink-0" />
                  <span className="truncate">Тягач</span>
                </Button>
              </div>
            </div>
          </div>

          <div 
            ref={mapRef} 
            className="w-full rounded-xl overflow-hidden border border-gray-200/30 dark:border-gray-700/40 shadow-lg"
            style={{ height: '400px' }}
          />
        </CardContent>
      </Card>

      {!isPublic && <MapFilters onFilterChange={handleFilterChange} />}
      <MapLegend />

      {selectedMarker && !isPublic && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMarker(null)}
        >
          <Card 
            className="max-w-md w-full animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold">{selectedMarker.name}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMarker(null)}
                  className="h-8 w-8 p-0"
                >
                  <Icon name="X" size={18} />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{selectedMarker.details}</p>
              {selectedMarker.type === 'cargo' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon name="Package" size={16} className="text-sky-500" />
                    <span className="text-sm">Тип: {selectedMarker.cargoType === 'box' ? 'Коробки' : selectedMarker.cargoType === 'pallet' ? 'Паллеты' : 'Негабарит'}</span>
                  </div>
                  {selectedMarker.quantity && (
                    <div className="flex items-center gap-2">
                      <Icon name="Hash" size={16} />
                      <span className="text-sm">Количество: {selectedMarker.quantity}</span>
                    </div>
                  )}
                  {selectedMarker.weight && (
                    <div className="flex items-center gap-2">
                      <Icon name="Weight" size={16} />
                      <span className="text-sm">Вес: {selectedMarker.weight} кг</span>
                    </div>
                  )}
                </div>
              )}
              {selectedMarker.type === 'driver' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon name="Truck" size={16} className="text-green-500" />
                    <span className="text-sm">Транспорт: {selectedMarker.vehicleCategory === 'car' ? 'Легковой' : selectedMarker.vehicleCategory === 'truck' ? 'Грузовой' : 'Тягач'}</span>
                  </div>
                  {selectedMarker.capacity && (
                    <div className="flex items-center gap-2">
                      <Icon name="Weight" size={16} />
                      <span className="text-sm">Грузоподъемность: {selectedMarker.capacity} кг</span>
                    </div>
                  )}
                  {selectedMarker.rating && (
                    <div className="flex items-center gap-2">
                      <Icon name="Star" size={16} className="text-yellow-500" />
                      <span className="text-sm">Рейтинг: {selectedMarker.rating}/5</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {cargoDetailsModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setCargoDetailsModal(null)}
        >
          <Card 
            className="max-w-sm w-full animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <CargoTypeIcon type={cargoDetailsModal.type} size={20} />
                {cargoDetailsModal.type === 'box' ? 'Коробки' : cargoDetailsModal.type === 'pallet' ? 'Паллеты' : 'Негабарит'}
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Количество</label>
                  <Input
                    type="number"
                    placeholder="Введите количество"
                    value={cargoDetails.quantity}
                    onChange={(e) => setCargoDetails({ ...cargoDetails, quantity: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Вес (кг)</label>
                  <Input
                    type="number"
                    placeholder="Введите вес"
                    value={cargoDetails.weight}
                    onChange={(e) => setCargoDetails({ ...cargoDetails, weight: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Объем (м³)</label>
                  <Input
                    type="number"
                    placeholder="Введите объем"
                    value={cargoDetails.volume}
                    onChange={(e) => setCargoDetails({ ...cargoDetails, volume: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={submitCargoDetails} className="flex-1">
                  Применить
                </Button>
                <Button variant="outline" onClick={() => setCargoDetailsModal(null)} className="flex-1">
                  Отмена
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {vehicleDetailsModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setVehicleDetailsModal(null)}
        >
          <Card 
            className="max-w-sm w-full animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Icon name={vehicleDetailsModal.type === 'car' ? 'Car' : vehicleDetailsModal.type === 'truck' ? 'Truck' : 'Container'} size={20} />
                {vehicleDetailsModal.type === 'car' ? 'Легковой' : vehicleDetailsModal.type === 'truck' ? 'Грузовой' : 'Тягач'}
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Количество коробок</label>
                  <Input
                    type="number"
                    placeholder="Введите количество"
                    value={vehicleDetails.boxCount}
                    onChange={(e) => setVehicleDetails({ ...vehicleDetails, boxCount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Количество паллет</label>
                  <Input
                    type="number"
                    placeholder="Введите количество"
                    value={vehicleDetails.palletCount}
                    onChange={(e) => setVehicleDetails({ ...vehicleDetails, palletCount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Негабаритных паллет</label>
                  <Input
                    type="number"
                    placeholder="Введите количество"
                    value={vehicleDetails.oversizedCount}
                    onChange={(e) => setVehicleDetails({ ...vehicleDetails, oversizedCount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Объем груза (м³)</label>
                  <Input
                    type="number"
                    placeholder="Введите объем"
                    value={vehicleDetails.volume}
                    onChange={(e) => setVehicleDetails({ ...vehicleDetails, volume: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={submitVehicleDetails} className="flex-1">
                  Найти
                </Button>
                <Button variant="outline" onClick={() => setVehicleDetailsModal(null)} className="flex-1">
                  Отмена
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default LiveMap;
