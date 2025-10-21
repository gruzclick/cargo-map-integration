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
  const [cargoBlockExpanded, setCargoBlockExpanded] = useState(true);
  const [driverBlockExpanded, setDriverBlockExpanded] = useState(true);
  const [lastInteraction, setLastInteraction] = useState(Date.now());
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    fetchMarkers();
    const interval = setInterval(fetchMarkers, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [markers, filters, routeSearch, driverStatus, cargoStatus]);

  useEffect(() => {
    const autoCollapseTimer = setInterval(() => {
      if (Date.now() - lastInteraction > 10000) {
        setCargoBlockExpanded(false);
        setDriverBlockExpanded(false);
      }
    }, 5000);
    return () => clearInterval(autoCollapseTimer);
  }, [lastInteraction]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    if (isLeftSwipe) {
      setShowSidebar(false);
    }
  };

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
    <div className="relative w-full h-screen overflow-hidden touch-pan-y">
      <NearbyCargoNotification 
        markers={markers}
        userLocation={userLocation}
        radiusKm={50}
      />

      {/* Карта на весь экран без свободного места */}
      <div className="absolute inset-0 z-0">
        <AdaptiveMapContainer 
          filteredMarkers={filteredMarkers}
          isPublic={isPublic}
          onMarkerClick={handleMapMarkerClick}
          onMapLoaded={setMapLoaded}
        />
      </div>

      {/* Кнопка разворачивания боковой панели */}
      {!showSidebar && (
        <button
          onClick={() => setShowSidebar(true)}
          className="fixed top-3 left-3 z-10 w-10 h-10 bg-white/20 dark:bg-gray-900/20 backdrop-blur-3xl border border-white/40 dark:border-gray-700/40 shadow-2xl rounded-full flex items-center justify-center hover:bg-white/30 dark:hover:bg-gray-900/30 active:scale-95 transition-all"
          title="Открыть панель"
        >
          <Icon name="ChevronRight" size={20} className="text-gray-900 dark:text-white" />
        </button>
      )}

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

      {/* Кнопка скачивания приложения - внизу слева */}
      <a
        href="https://play.google.com/store"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 left-4 z-20 flex items-center gap-2 px-3 py-2 bg-white/15 dark:bg-gray-900/15 backdrop-blur-3xl border border-white/40 dark:border-gray-700/40 shadow-2xl rounded-full hover:bg-white/25 dark:hover:bg-gray-900/25 active:scale-95 transition-all"
      >
        <Icon name="Smartphone" size={16} className="text-gray-900 dark:text-white" />
        <span className="text-xs font-medium text-gray-900 dark:text-white">Скачать</span>
      </a>

      {/* Боковая панель слева - компактная */}
      {showSidebar && (
        <div 
          onClick={() => setLastInteraction(Date.now())}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="absolute top-3 left-1/2 md:left-3 -translate-x-1/2 md:translate-x-0 max-h-[calc(100vh-1.5rem)] w-[calc(100%-1.5rem)] md:w-72 bg-white/15 dark:bg-gray-900/15 backdrop-blur-3xl border border-white/40 dark:border-gray-700/40 shadow-2xl rounded-2xl z-10 overflow-hidden animate-slide-in-left flex flex-col touch-pan-y overscroll-contain">
          {/* Табы - компактные + кнопка сворачивания */}
          <div className="flex items-center border-b border-white/20 dark:border-gray-700/20 p-1.5">
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 px-2 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${
                activeTab === 'stats'
                  ? 'bg-white/60 dark:bg-gray-800/60 text-gray-900 dark:text-white shadow-md'
                  : 'text-gray-700 dark:text-gray-400 hover:bg-white/30 dark:hover:bg-gray-800/30'
              }`}
            >
              <Icon name="BarChart3" size={12} />
              <span className="hidden md:inline">Статистика</span>
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 px-2 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ml-1 ${
                activeTab === 'search'
                  ? 'bg-white/60 dark:bg-gray-800/60 text-gray-900 dark:text-white shadow-md'
                  : 'text-gray-700 dark:text-gray-400 hover:bg-white/30 dark:hover:bg-gray-800/30'
              }`}
            >
              <Icon name="Search" size={12} />
              <span className="hidden md:inline">Поиск</span>
            </button>
            <button
              onClick={() => setShowSidebar(false)}
              className="ml-1 p-1.5 rounded-lg text-gray-700 dark:text-gray-400 hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all"
              title="Свернуть"
            >
              <Icon name="ChevronLeft" size={14} />
            </button>
          </div>

          {/* Контент табов */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {/* Таб статистики */}
            {activeTab === 'stats' && (
              <div className="space-y-3">
                {!isPublic && (
                  <>
                    {/* Блок грузов */}
                    <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-3xl rounded-xl border border-white/30 dark:border-gray-700/30 overflow-hidden">
                      <div 
                        onClick={() => {
                          setCargoBlockExpanded(!cargoBlockExpanded);
                          setLastInteraction(Date.now());
                        }}
                        className="flex items-center justify-between p-2 cursor-pointer hover:bg-white/20 dark:hover:bg-gray-800/20 transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                            <Icon name="Package" size={14} className="text-white" />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-base font-bold text-gray-900 dark:text-white">{cargoCount}</p>
                            <p className="text-xs text-gray-700 dark:text-gray-300">Грузов</p>
                          </div>
                        </div>
                        <Icon name={cargoBlockExpanded ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-gray-600 dark:text-gray-400" />
                      </div>
                      {cargoBlockExpanded && (
                        <div className="px-2 pb-2">
                          <StatusSelector 
                            userType="client"
                            status={cargoStatus}
                            onStatusChange={setCargoStatus}
                          />
                        </div>
                      )}
                    </div>

                    {/* Блок перевозчиков */}
                    <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-3xl rounded-xl border border-white/30 dark:border-gray-700/30 overflow-hidden">
                      <div 
                        onClick={() => {
                          setDriverBlockExpanded(!driverBlockExpanded);
                          setLastInteraction(Date.now());
                        }}
                        className="flex items-center justify-between p-2 cursor-pointer hover:bg-white/20 dark:hover:bg-gray-800/20 transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                            <Icon name="Truck" size={14} className="text-white" />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-base font-bold text-gray-900 dark:text-white">{driverCount}</p>
                            <p className="text-xs text-gray-700 dark:text-gray-300">Перевозчиков</p>
                          </div>
                        </div>
                        <Icon name={driverBlockExpanded ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-gray-600 dark:text-gray-400" />
                      </div>
                      {driverBlockExpanded && (
                        <div className="px-2 pb-2">
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
              <div className="space-y-2">
                {/* Фильтры */}
                {!isPublic && (
                  <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-3xl rounded-xl p-2 border border-white/30 dark:border-gray-700/30">
                    <MapFilters onFilterChange={handleFilterChange} />
                  </div>
                )}
                
                {/* Поиск маршрутов */}
                <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-3xl rounded-xl p-2 border border-white/30 dark:border-gray-700/30">
                  <RouteSearchPanel 
                    routeSearch={routeSearch} 
                    onRouteChange={setRouteSearch}
                    onLocationDetected={setUserLocation}
                  />
                </div>
                
                {/* Типы грузов и транспорта */}
                <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-3xl rounded-xl p-2 border border-white/30 dark:border-gray-700/30">
                  <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-1.5">Показать</h3>
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