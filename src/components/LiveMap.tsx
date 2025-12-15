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
  const [activeTab, setActiveTab] = useState<'stats' | 'search'>('search');
  const [cargoBlockExpanded, setCargoBlockExpanded] = useState(true);
  const [driverBlockExpanded, setDriverBlockExpanded] = useState(true);
  const [lastInteraction, setLastInteraction] = useState(Date.now());
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    fetchMarkers();
    detectUserLocation();
    const interval = setInterval(fetchMarkers, 5000);
    return () => clearInterval(interval);
  }, []);

  const detectUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('Ошибка определения геопозиции:', error);
        }
      );
    }
  };

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
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe && showSidebar) {
      setShowSidebar(false);
    } else if (isRightSwipe && !showSidebar) {
      setShowSidebar(true);
    }
  };

  const applyFilters = () => {
    let filtered = [...markers];
    
    if (filters.userType === 'client') {
      filtered = filtered.filter(m => {
        const role = (m as any).role || m.type;
        return role === 'carrier' || m.type === 'driver';
      });
      if (driverStatus) {
        filtered = filtered.filter(m => {
          const carrierStatus = (m as any).carrierStatus || m.vehicleStatus;
          return carrierStatus === driverStatus;
        });
      }
    } else if (filters.userType === 'carrier') {
      filtered = filtered.filter(m => {
        const role = (m as any).role || m.type;
        return role === 'client' || m.type === 'cargo';
      });
      if (cargoStatus) {
        filtered = filtered.filter(m => {
          const clientStatus = (m as any).clientStatus;
          if (cargoStatus === 'ready') return clientStatus === 'ready_now' || m.readyStatus === 'ready';
          if (cargoStatus === 'scheduled') return clientStatus === 'ready_later' || m.readyStatus === 'scheduled';
          return true;
        });
      }
    } else if (filters.userType === 'all') {
      filtered = filtered.filter(m => {
        const role = (m as any).role || m.type;
        return role === 'logist';
      });
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
      const response = await fetch('https://functions.poehali.dev/e0c57b5b-aa36-4b28-8b31-c70ece513cae?path=/users');
      const data = await response.json();
      
      if (data.markers && data.markers.length > 0) {
        setMarkers(data.markers);
      } else {
        const { generateAllMockData } = await import('@/utils/mockData');
        const mockMarkers = generateAllMockData();
        setMarkers(mockMarkers);
      }
    } catch (error) {
      console.error('Failed to fetch real users, using mock data:', error);
      const { generateAllMockData } = await import('@/utils/mockData');
      const mockMarkers = generateAllMockData();
      setMarkers(mockMarkers);
    }
  };

  const handleCargoTypeClick = (type: 'box' | 'pallet' | 'oversized', isDriver: boolean) => {
    console.log('Cargo type clicked:', type, 'isDriver:', isDriver);
  };

  const handleVehicleTypeClick = (type: 'car' | 'truck' | 'semi', isClient: boolean) => {
    console.log('Vehicle type clicked:', type, 'isClient:', isClient);
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
          userLocation={userLocation}
        />
      </div>

      {/* Кнопка разворачивания боковой панели - зафиксирована */}
      {!showSidebar && (
        <button
          onClick={() => setShowSidebar(true)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="fixed top-20 left-4 z-[60] w-12 h-12 bg-white/90 dark:bg-gray-800/90 backdrop-blur-3xl border border-gray-300 dark:border-gray-600 shadow-2xl rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 active:scale-95 transition-all"
          title="Открыть панель (свайп вправо)"
        >
          <Icon name="Menu" size={20} className="text-gray-900 dark:text-white" />
        </button>
      )}


      {/* Боковая панель слева - ультра компактная */}
      {showSidebar && (
        <div 
          onClick={() => setLastInteraction(Date.now())}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="absolute top-20 left-1/2 md:left-3 md:top-20 -translate-x-1/2 md:translate-x-0 max-h-[calc(100vh-5.5rem)] w-[calc(100%-1.5rem)] md:w-56 bg-white/10 dark:bg-gray-900/10 backdrop-blur-3xl border border-white/30 dark:border-gray-700/30 shadow-2xl rounded-2xl z-10 overflow-hidden animate-slide-in-left flex flex-col touch-pan-y overscroll-contain">
          {/* Табы и Поиск/Статистика */}
          <div className="flex items-center justify-between p-2 gap-2">
            <div className="flex items-center gap-2 flex-1">
              <button
                onClick={() => setActiveTab('search')}
                className={`flex-1 px-3 py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'search'
                    ? 'bg-white/60 dark:bg-gray-800/60 text-gray-900 dark:text-white shadow-md'
                    : 'text-gray-700 dark:text-gray-400 hover:bg-white/30 dark:hover:bg-gray-800/30'
                }`}
              >
                <Icon name="Search" size={14} />
                <span>Поиск</span>
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`flex-1 px-3 py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'stats'
                    ? 'bg-white/60 dark:bg-gray-800/60 text-gray-900 dark:text-white shadow-md'
                    : 'text-gray-700 dark:text-gray-400 hover:bg-white/30 dark:hover:bg-gray-800/30'
                }`}
              >
                <Icon name="BarChart3" size={14} />
                <span>Статистика</span>
              </button>
            </div>
            <button
              onClick={() => setShowSidebar(false)}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-400 hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all"
              title="Свернуть"
            >
              <Icon name="ChevronLeft" size={16} />
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
                          <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                            <Icon name="Package" size={12} className="text-white" />
                          </div>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{cargoCount} грузов</span>
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
                          <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center">
                            <Icon name="Truck" size={12} className="text-white" />
                          </div>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{driverCount} водителей</span>
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
                  <MapFilters onFilterChange={handleFilterChange} />
                )}
                
                {/* Типы грузов и транспорта */}
                {filters.userType !== 'all' && (
                  <div className="p-2">
                    <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-1.5">Показать</h3>
                    <CargoVehicleSelector 
                      filters={filters}
                      onCargoTypeClick={handleCargoTypeClick}
                      onVehicleTypeClick={handleVehicleTypeClick}
                    />
                  </div>
                )}
                
                {/* Поиск маршрутов */}
                <div className="p-2">
                  <RouteSearchPanel 
                    routeSearch={routeSearch} 
                    onRouteChange={setRouteSearch}
                    onLocationDetected={setUserLocation}
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