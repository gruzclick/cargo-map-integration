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

  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [statsExpanded, setStatsExpanded] = useState(false);

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

      {/* Компактная панель вверху */}
      <div className="absolute top-2 left-2 right-2 z-10 pointer-events-none">
        <div className="flex flex-wrap md:flex-nowrap gap-1.5 pointer-events-auto">
          {/* Фильтры компактно */}
          {!isPublic && (
            <button
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              className="bg-white/15 dark:bg-gray-900/15 backdrop-blur-md border border-white/20 dark:border-gray-700/20 shadow-lg rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 hover:bg-white/25 dark:hover:bg-gray-900/25 transition-all text-sm"
            >
              <Icon name="Filter" size={16} className="text-gray-900 dark:text-white" />
              <span className="hidden md:inline text-xs font-medium text-gray-900 dark:text-white">Фильтры</span>
            </button>
          )}
          
          {/* Грузы */}
          <button
            onClick={() => setStatsExpanded(!statsExpanded)}
            className="bg-white/15 dark:bg-gray-900/15 backdrop-blur-md border border-white/20 dark:border-gray-700/20 shadow-lg rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 hover:bg-white/25 dark:hover:bg-gray-900/25 transition-all"
          >
            <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded flex items-center justify-center">
              <Icon name="Package" size={12} className="text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-white">{cargoCount}</span>
          </button>

          {/* Перевозчики */}
          <button
            onClick={() => setStatsExpanded(!statsExpanded)}
            className="bg-white/15 dark:bg-gray-900/15 backdrop-blur-md border border-white/20 dark:border-gray-700/20 shadow-lg rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 hover:bg-white/25 dark:hover:bg-gray-900/25 transition-all"
          >
            <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded flex items-center justify-center">
              <Icon name="Truck" size={12} className="text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-white">{driverCount}</span>
          </button>

          {/* Моё местоположение */}
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
            className="bg-white/15 dark:bg-gray-900/15 backdrop-blur-md border border-white/20 dark:border-gray-700/20 shadow-lg rounded-lg p-1.5 flex items-center justify-center hover:bg-white/25 dark:hover:bg-gray-900/25 transition-all"
            title="Моё местоположение"
          >
            <Icon name="Crosshair" size={16} className="text-gray-900 dark:text-white" />
          </button>
        </div>
      </div>

      {/* Выдвижная панель фильтров */}
      {filtersExpanded && (
        <div className="absolute top-12 left-2 z-20 w-[calc(100%-1rem)] md:w-96 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 shadow-2xl rounded-xl p-3 animate-slide-in-down pointer-events-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Фильтры</h3>
            <button onClick={() => setFiltersExpanded(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
              <Icon name="X" size={16} />
            </button>
          </div>
          <MapFilters onFilterChange={handleFilterChange} />
        </div>
      )}

      {/* Выдвижная панель статистики */}
      {statsExpanded && (
        <div className="absolute top-12 left-2 z-20 w-[calc(100%-1rem)] md:w-96 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 shadow-2xl rounded-xl p-3 space-y-3 animate-slide-in-down pointer-events-auto">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Статистика</h3>
            <button onClick={() => setStatsExpanded(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
              <Icon name="X" size={16} />
            </button>
          </div>
          
          {!isPublic && (
            <>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-3 border border-blue-200/50 dark:border-blue-700/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded flex items-center justify-center">
                    <Icon name="Package" size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{cargoCount}</p>
                    <p className="text-xs text-gray-700 dark:text-gray-300">Всего грузов</p>
                  </div>
                </div>
                <StatusSelector 
                  userType="client"
                  status={cargoStatus}
                  onStatusChange={setCargoStatus}
                />
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-3 border border-green-200/50 dark:border-green-700/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded flex items-center justify-center">
                    <Icon name="Truck" size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{driverCount}</p>
                    <p className="text-xs text-gray-700 dark:text-gray-300">Перевозчиков</p>
                  </div>
                </div>
                <StatusSelector 
                  userType="driver"
                  status={driverStatus}
                  onStatusChange={setDriverStatus}
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Панель поиска внизу */}
      <div className="absolute bottom-2 left-2 right-2 z-10 pointer-events-auto">
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 shadow-2xl rounded-xl p-3">
          <RouteSearchPanel 
            routeSearch={routeSearch} 
            onRouteChange={setRouteSearch}
            onLocationDetected={setUserLocation}
          />
          
          <div className="mt-2 pt-2 border-t border-gray-200/30 dark:border-gray-700/30">
            <CargoVehicleSelector 
              filters={filters}
              onCargoTypeClick={handleCargoTypeClick}
              onVehicleTypeClick={handleVehicleTypeClick}
            />
          </div>
        </div>
      </div>

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