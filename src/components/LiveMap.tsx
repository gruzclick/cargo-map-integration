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
  const [statsExpanded, setStatsExpanded] = useState(true);
  const [cargoBlockExpanded, setCargoBlockExpanded] = useState(true);
  const [driverBlockExpanded, setDriverBlockExpanded] = useState(true);

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
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <NearbyCargoNotification 
        markers={markers}
        userLocation={userLocation}
        radiusKm={50}
      />

      {/* Карта за границы экрана */}
      <div className="absolute -inset-4 z-0">
        <AdaptiveMapContainer 
          filteredMarkers={filteredMarkers}
          isPublic={isPublic}
          onMarkerClick={handleMapMarkerClick}
          onMapLoaded={setMapLoaded}
        />
      </div>

      {/* Кнопка показа/скрытия боковой панели - перенесена вниз */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="fixed bottom-24 left-4 z-20 w-12 h-12 bg-white/20 dark:bg-gray-900/20 backdrop-blur-3xl border border-white/40 dark:border-gray-700/40 shadow-2xl rounded-full flex items-center justify-center hover:bg-white/30 dark:hover:bg-gray-900/30 active:scale-95 transition-all"
        title={showSidebar ? 'Скрыть панель' : 'Показать панель'}
      >
        <Icon name={showSidebar ? 'PanelLeftClose' : 'PanelLeftOpen'} size={20} className="text-gray-900 dark:text-white" />
      </button>

      {/* Кнопка геолокации справа вверху */}
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
        className="fixed top-20 right-4 z-10 w-12 h-12 bg-white/20 dark:bg-gray-900/20 backdrop-blur-3xl border border-white/40 dark:border-gray-700/40 shadow-2xl rounded-full flex items-center justify-center hover:bg-white/30 dark:hover:bg-gray-900/30 active:scale-95 transition-all"
        title="Моё местоположение"
      >
        <Icon name="Crosshair" size={20} className="text-gray-900 dark:text-white" />
      </button>

      {/* Кнопки скачивания приложения - внизу слева */}
      <div className="fixed bottom-4 left-4 z-20 flex flex-col gap-2">
        <div className="bg-white/20 dark:bg-gray-900/20 backdrop-blur-3xl border border-white/40 dark:border-gray-700/40 shadow-2xl rounded-2xl p-3">
          <p className="text-xs font-semibold text-gray-900 dark:text-white mb-2">Скачать приложение</p>
          <div className="flex gap-2">
            <a
              href="https://play.google.com/store"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/40 dark:border-gray-700/40 shadow-lg rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
              title="Android"
            >
              <Icon name="Smartphone" size={18} className="text-green-600 dark:text-green-400" />
            </a>
            <a
              href="https://apps.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/40 dark:border-gray-700/40 shadow-lg rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
              title="iOS"
            >
              <Icon name="Apple" size={18} className="text-gray-900 dark:text-white" />
            </a>
            <a
              href="#"
              className="w-10 h-10 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/40 dark:border-gray-700/40 shadow-lg rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
              title="Desktop"
            >
              <Icon name="Monitor" size={18} className="text-blue-600 dark:text-blue-400" />
            </a>
          </div>
        </div>
      </div>

      {/* Боковая панель слева - Apple Glass Style */}
      {showSidebar && (
        <div className="absolute top-3 left-1/2 md:left-3 -translate-x-1/2 md:translate-x-0 max-h-[calc(100vh-1.5rem)] w-[calc(100%-1.5rem)] md:w-80 bg-white/8 dark:bg-gray-900/8 backdrop-blur-3xl border border-white/40 dark:border-gray-700/40 shadow-2xl rounded-3xl z-10 overflow-hidden animate-slide-in-left flex flex-col">
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
                    {/* Блок грузов */}
                    <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-2xl rounded-2xl border border-white/30 dark:border-gray-700/30 overflow-hidden">
                      <div 
                        onClick={() => setCargoBlockExpanded(!cargoBlockExpanded)}
                        className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/20 dark:hover:bg-gray-800/20 transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Icon name="Package" size={16} className="text-white" />
                          </div>
                          <div>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">{cargoCount}</p>
                            <p className="text-xs text-gray-700 dark:text-gray-300">Грузов</p>
                          </div>
                        </div>
                        <Icon name={cargoBlockExpanded ? 'ChevronUp' : 'ChevronDown'} size={18} className="text-gray-600 dark:text-gray-400" />
                      </div>
                      {cargoBlockExpanded && (
                        <div className="px-3 pb-3">
                          <StatusSelector 
                            userType="client"
                            status={cargoStatus}
                            onStatusChange={setCargoStatus}
                          />
                        </div>
                      )}
                    </div>

                    {/* Блок перевозчиков */}
                    <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-2xl rounded-2xl border border-white/30 dark:border-gray-700/30 overflow-hidden">
                      <div 
                        onClick={() => setDriverBlockExpanded(!driverBlockExpanded)}
                        className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/20 dark:hover:bg-gray-800/20 transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Icon name="Truck" size={16} className="text-white" />
                          </div>
                          <div>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">{driverCount}</p>
                            <p className="text-xs text-gray-700 dark:text-gray-300">Перевозчиков</p>
                          </div>
                        </div>
                        <Icon name={driverBlockExpanded ? 'ChevronUp' : 'ChevronDown'} size={18} className="text-gray-600 dark:text-gray-400" />
                      </div>
                      {driverBlockExpanded && (
                        <div className="px-3 pb-3">
                          <StatusSelector 
                            userType="driver"
                            status={driverStatus}
                            onStatusChange={setDriverStatus}
                          />
                        </div>
                      )}
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
                  <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-3xl rounded-2xl p-3 border border-white/30 dark:border-gray-700/30">
                    <MapFilters onFilterChange={handleFilterChange} />
                  </div>
                )}
                
                {/* Поиск маршрутов */}
                <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-3xl rounded-2xl p-3 border border-white/30 dark:border-gray-700/30">
                  <RouteSearchPanel 
                    routeSearch={routeSearch} 
                    onRouteChange={setRouteSearch}
                    onLocationDetected={setUserLocation}
                  />
                </div>
                
                {/* Типы грузов и транспорта */}
                <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-3xl rounded-2xl p-3 border border-white/30 dark:border-gray-700/30">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Показать</h3>
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