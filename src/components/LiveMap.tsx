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
import AIAssistant from './AIAssistant';
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
  const [activeTab, setActiveTab] = useState<'stats' | 'search'>('stats');

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
    <div className="relative w-full h-screen overflow-hidden">
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

      {/* Кнопка показа/скрытия боковой панели - Apple Style */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="absolute top-3 left-3 z-20 w-10 h-10 bg-white/30 dark:bg-gray-900/30 backdrop-blur-2xl border border-white/40 dark:border-gray-700/40 shadow-xl rounded-full flex items-center justify-center hover:bg-white/40 dark:hover:bg-gray-900/40 active:scale-95 transition-all"
        title={showSidebar ? 'Скрыть панель' : 'Показать панель'}
      >
        <Icon name={showSidebar ? 'PanelLeftClose' : 'PanelLeftOpen'} size={18} className="text-gray-900 dark:text-white" />
      </button>

      {/* Кнопки справа вверху - разделены */}
      <div className="absolute top-3 right-3 z-10 flex gap-2">
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
          className="w-10 h-10 bg-white/30 dark:bg-gray-900/30 backdrop-blur-2xl border border-white/40 dark:border-gray-700/40 shadow-xl rounded-full flex items-center justify-center hover:bg-white/40 dark:hover:bg-gray-900/40 active:scale-95 transition-all"
          title="Моё местоположение"
        >
          <Icon name="Crosshair" size={18} className="text-gray-900 dark:text-white" />
        </button>
      </div>

      {/* Боковая панель слева - Apple Glass Style */}
      {showSidebar && (
        <div className="absolute top-3 left-3 max-h-[calc(100vh-1.5rem)] w-full md:w-80 bg-white/15 dark:bg-gray-900/15 backdrop-blur-3xl border border-white/40 dark:border-gray-700/40 shadow-2xl rounded-3xl z-10 overflow-hidden animate-slide-in-left flex flex-col">
          {/* Табы - компактные */}
          <div className="flex border-b border-white/20 dark:border-gray-700/20 p-2">
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'stats'
                  ? 'bg-white/60 dark:bg-gray-800/60 text-gray-900 dark:text-white shadow-md'
                  : 'text-gray-700 dark:text-gray-400 hover:bg-white/30 dark:hover:bg-gray-800/30'
              }`}
            >
              <Icon name="BarChart3" size={14} />
              Статистика
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ml-1 ${
                activeTab === 'search'
                  ? 'bg-white/60 dark:bg-gray-800/60 text-gray-900 dark:text-white shadow-md'
                  : 'text-gray-700 dark:text-gray-400 hover:bg-white/30 dark:hover:bg-gray-800/30'
              }`}
            >
              <Icon name="Search" size={14} />
              Поиск
            </button>
          </div>

          {/* Контент табов */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {/* Таб статистики */}
            {activeTab === 'stats' && (
              <div className="space-y-3">
                {!isPublic && (
                  <>
                    <div className="bg-gradient-to-br from-blue-50/50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-3 border border-blue-200/30 dark:border-blue-700/20 backdrop-blur-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Icon name="Package" size={20} className="text-white" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{cargoCount}</p>
                          <p className="text-xs text-gray-700 dark:text-gray-300">Грузов</p>
                        </div>
                      </div>
                      <StatusSelector 
                        userType="client"
                        status={cargoStatus}
                        onStatusChange={setCargoStatus}
                      />
                    </div>

                    <div className="bg-gradient-to-br from-green-50/50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-3 border border-green-200/30 dark:border-green-700/20 backdrop-blur-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
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
                  </>
                )}
              </div>
            )}

            {/* Таб поиска + фильтры */}
            {activeTab === 'search' && (
              <div className="space-y-3">
                {/* Фильтры */}
                {!isPublic && (
                  <div>
                    <MapFilters onFilterChange={handleFilterChange} />
                  </div>
                )}
                
                {/* Поиск маршрутов */}
                <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-3 border border-white/30 dark:border-gray-700/30">
                  <RouteSearchPanel 
                    routeSearch={routeSearch} 
                    onRouteChange={setRouteSearch}
                    onLocationDetected={setUserLocation}
                  />
                </div>
                
                {/* Типы грузов и транспорта */}
                <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-3 border border-white/30 dark:border-gray-700/30">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Типы</h3>
                  <CargoVehicleSelector 
                    filters={filters}
                    onCargoTypeClick={handleCargoTypeClick}
                    onVehicleTypeClick={handleVehicleTypeClick}
                  />
                </div>
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

      {/* AI Помощник */}
      <AIAssistant />
    </div>
  );
};

export default LiveMap;