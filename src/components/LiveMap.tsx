import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import MapFilters, { FilterState } from './MapFilters';
import RouteSearchPanel from './map/RouteSearchPanel';
import CargoVehicleSelector from './map/CargoVehicleSelector';
import AdaptiveMapContainer from './map/AdaptiveMapContainer';
import MarkerDetailsModal from './map/MarkerDetailsModal';
import CargoDetailsModal from './map/CargoDetailsModal';
import VehicleDetailsModal from './map/VehicleDetailsModal';
import StatusSelector from './map/StatusSelector';
import NearbyCargoNotification from './map/NearbyCargoNotification';
import { MapMarker, CargoDetailsModal as CargoDetailsModalType, VehicleDetailsModal as VehicleDetailsModalType, LiveMapProps } from './map/MapTypes';


const LiveMap = ({ isPublic = false, onMarkerClick }: LiveMapProps = {}) => {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [filteredMarkers, setFilteredMarkers] = useState<MapMarker[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ userType: 'all' });
  const [routeSearch, setRouteSearch] = useState({ from: '', to: '' });
  const [driverStatus, setDriverStatus] = useState('free');
  const [cargoStatus, setCargoStatus] = useState('ready');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  const [cargoDetailsModal, setCargoDetailsModal] = useState<CargoDetailsModalType | null>(null);
  const [cargoDetails, setCargoDetails] = useState({ quantity: '', weight: '', volume: '' });
  
  const [vehicleDetailsModal, setVehicleDetailsModal] = useState<VehicleDetailsModalType | null>(null);
  const [vehicleDetails, setVehicleDetails] = useState({ boxCount: '', palletCount: '', oversizedCount: '', volume: '' });

  const [showSearchPanel, setShowSearchPanel] = useState(false);

  useEffect(() => {
    fetchMarkers();
    const interval = setInterval(fetchMarkers, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [markers, filters, routeSearch, driverStatus, cargoStatus]);

  const applyFilters = () => {
    let filtered = [...markers];
    
    if (filters.userType === 'client') {
      filtered = filtered.filter(m => m.type === 'driver');
      if (driverStatus) {
        filtered = filtered.filter(m => m.vehicleStatus === driverStatus);
      }
    } else if (filters.userType === 'carrier') {
      filtered = filtered.filter(m => m.type === 'cargo');
      if (cargoStatus) {
        filtered = filtered.filter(m => {
          if (cargoStatus === 'ready') return m.readyStatus === 'ready';
          if (cargoStatus === 'scheduled') return m.readyStatus === 'scheduled';
          return true;
        });
      }
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
    const { generateAllMockData } = await import('@/utils/mockData');
    const mockMarkers = generateAllMockData();
    setMarkers(mockMarkers);
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

  const handleMapMarkerClick = (marker: MapMarker) => {
    if (isPublic) {
      onMarkerClick?.();
    } else {
      setSelectedMarker(marker);
    }
  };

  const cargoCount = filteredMarkers.filter(m => m.type === 'cargo').length;
  const driverCount = filteredMarkers.filter(m => m.type === 'driver').length;

  return (
    <div className="relative w-full h-[calc(100vh-80px)]">
      <NearbyCargoNotification 
        markers={markers}
        userLocation={userLocation}
        radiusKm={50}
      />

      {/* Карта на весь экран */}
      <div className="absolute inset-0 z-0">
        <AdaptiveMapContainer 
          filteredMarkers={filteredMarkers}
          isPublic={isPublic}
          onMarkerClick={handleMapMarkerClick}
          onMapLoaded={setMapLoaded}
        />
      </div>

      {/* Блоки статистики вверху */}
      <div className="absolute top-3 left-3 right-3 z-10 flex gap-2 pointer-events-none">
        <div className="flex gap-2 pointer-events-auto">
          {!isPublic && <MapFilters onFilterChange={handleFilterChange} className="md:w-auto" />}
          
          <div className="bg-white/15 dark:bg-gray-900/15 backdrop-blur-md border border-white/20 dark:border-gray-700/20 shadow-lg rounded-xl px-3 py-2 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
              <Icon name="Package" size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">{cargoCount}</span>
          </div>

          <div className="bg-white/15 dark:bg-gray-900/15 backdrop-blur-md border border-white/20 dark:border-gray-700/20 shadow-lg rounded-xl px-3 py-2 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
              <Icon name="Truck" size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">{driverCount}</span>
          </div>
        </div>
      </div>

      {/* Плавающие кнопки справа внизу */}
      <div className="absolute right-4 bottom-4 z-10 flex flex-col gap-3">
        {/* Кнопка поиска */}
        <button
          onClick={() => setShowSearchPanel(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
          title="Поиск"
        >
          <Icon name="Search" size={24} className="text-white" />
        </button>

        {/* Кнопка моё местоположение */}
        <button
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                  });
                },
                (error) => {
                  console.error('Ошибка геолокации:', error);
                  alert('Не удалось определить местоположение');
                }
              );
            }
          }}
          className="w-14 h-14 rounded-full bg-white/15 dark:bg-gray-900/15 backdrop-blur-md border border-white/20 dark:border-gray-700/20 shadow-lg flex items-center justify-center hover:bg-white/25 dark:hover:bg-gray-900/25 transition-all hover:scale-110 active:scale-95"
          title="Моё местоположение"
        >
          <Icon name="Crosshair" size={20} className="text-gray-900 dark:text-white" />
        </button>
      </div>

      {/* Боковая панель поиска */}
      {showSearchPanel && (
        <>
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm z-20 animate-fade-in"
            onClick={() => setShowSearchPanel(false)}
          />
          
          <div className="absolute top-0 right-0 bottom-0 w-full md:w-[420px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-l border-white/20 dark:border-gray-700/20 shadow-2xl z-30 overflow-y-auto animate-slide-in-right">
            <div className="p-5 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Icon name="Search" size={28} />
                  Поиск
                </h2>
                <button
                  onClick={() => setShowSearchPanel(false)}
                  className="rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Icon name="X" size={24} />
                </button>
              </div>

              {/* Статистика */}
              {!isPublic && (
                <div className="space-y-3">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-700/30">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                        <Icon name="Package" size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{cargoCount}</p>
                        <p className="text-xs text-gray-700 dark:text-gray-300">Всего грузов</p>
                      </div>
                    </div>
                    <StatusSelector 
                      userType="client"
                      status={cargoStatus}
                      onStatusChange={setCargoStatus}
                    />
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200/50 dark:border-green-700/30">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                        <Icon name="Truck" size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{driverCount}</p>
                        <p className="text-xs text-gray-700 dark:text-gray-300">Перевозчиков</p>
                      </div>
                    </div>
                    <StatusSelector 
                      userType="driver"
                      status={driverStatus}
                      onStatusChange={setDriverStatus}
                    />
                  </div>
                </div>
              )}

              {/* Поиск маршрутов */}
              <div className="border-t border-gray-200/30 dark:border-gray-700/30 pt-5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Icon name="MapPin" size={20} />
                  Поиск маршрутов
                </h3>
                <RouteSearchPanel 
                  routeSearch={routeSearch} 
                  onRouteChange={setRouteSearch}
                  onLocationDetected={setUserLocation}
                />
              </div>

              {/* Типы грузов/транспорта */}
              <div className="border-t border-gray-200/30 dark:border-gray-700/30 pt-5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Icon name="Package2" size={20} />
                  Типы грузов и транспорта
                </h3>
                <CargoVehicleSelector 
                  filters={filters}
                  onCargoTypeClick={handleCargoTypeClick}
                  onVehicleTypeClick={handleVehicleTypeClick}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {!isPublic && (
        <MarkerDetailsModal 
          marker={selectedMarker}
          onClose={() => setSelectedMarker(null)}
        />
      )}

      <CargoDetailsModal 
        modal={cargoDetailsModal}
        details={cargoDetails}
        onDetailsChange={setCargoDetails}
        onSubmit={submitCargoDetails}
        onClose={() => setCargoDetailsModal(null)}
      />

      <VehicleDetailsModal 
        modal={vehicleDetailsModal}
        details={vehicleDetails}
        onDetailsChange={setVehicleDetails}
        onSubmit={submitVehicleDetails}
        onClose={() => setVehicleDetailsModal(null)}
      />
    </div>
  );
};

export default LiveMap;