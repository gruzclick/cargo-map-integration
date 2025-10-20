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

  const [showSidebar, setShowSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'search' | 'filters'>('stats');

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

      {/* Кнопка показа/скрытия боковой панели */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="absolute top-4 left-4 z-20 w-12 h-12 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 shadow-2xl rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
        title={showSidebar ? 'Скрыть панель' : 'Показать панель'}
      >
        <Icon name={showSidebar ? 'PanelLeftClose' : 'PanelLeftOpen'} size={20} className="text-gray-900 dark:text-white" />
      </button>

      {/* Кнопка геолокации */}
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
        className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 shadow-2xl rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
        title="Моё местоположение"
      >
        <Icon name="Crosshair" size={20} className="text-gray-900 dark:text-white" />
      </button>

      {/* Боковая панель слева */}
      {showSidebar && (
        <div className="absolute top-0 left-0 bottom-0 w-full md:w-[420px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-white/20 dark:border-gray-700/20 shadow-2xl z-10 overflow-hidden animate-slide-in-left flex flex-col">
          {/* Табы */}
          <div className="flex border-b border-gray-200/30 dark:border-gray-700/30 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20">
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 px-4 py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'stats'
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-800/50'
              }`}
            >
              <Icon name="BarChart3" size={18} />
              Статистика
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 px-4 py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'search'
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-800/50'
              }`}
            >
              <Icon name="Search" size={18} />
              Поиск
            </button>
            {!isPublic && (
              <button
                onClick={() => setActiveTab('filters')}
                className={`flex-1 px-4 py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'filters'
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-800/50'
                }`}
              >
                <Icon name="Filter" size={18} />
                Фильтры
              </button>
            )}
          </div>

          {/* Контент табов */}
          <div className="flex-1 overflow-y-auto p-5">
            {/* Таб статистики */}
            {activeTab === 'stats' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Статистика карты</h2>
                
                {!isPublic && (
                  <>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-5 border border-blue-200/50 dark:border-blue-700/30">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Icon name="Package" size={24} className="text-white" />
                        </div>
                        <div>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white">{cargoCount}</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">Всего грузов</p>
                        </div>
                      </div>
                      <StatusSelector 
                        userType="client"
                        status={cargoStatus}
                        onStatusChange={setCargoStatus}
                      />
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-5 border border-green-200/50 dark:border-green-700/30">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Icon name="Truck" size={24} className="text-white" />
                        </div>
                        <div>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white">{driverCount}</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">Перевозчиков</p>
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

            {/* Таб поиска */}
            {activeTab === 'search' && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Поиск маршрутов</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Найдите грузы и перевозчиков на нужном маршруте</p>
                  
                  <RouteSearchPanel 
                    routeSearch={routeSearch} 
                    onRouteChange={setRouteSearch}
                    onLocationDetected={setUserLocation}
                  />
                </div>
                
                <div className="border-t border-gray-200/30 dark:border-gray-700/30 pt-5">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Типы грузов и транспорта</h3>
                  <CargoVehicleSelector 
                    filters={filters}
                    onCargoTypeClick={handleCargoTypeClick}
                    onVehicleTypeClick={handleVehicleTypeClick}
                  />
                </div>
              </div>
            )}

            {/* Таб фильтров */}
            {activeTab === 'filters' && !isPublic && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Фильтры карты</h2>
                <MapFilters onFilterChange={handleFilterChange} />
              </div>
            )}
          </div>
        </div>
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