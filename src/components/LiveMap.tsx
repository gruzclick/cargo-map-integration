import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import MapFilters, { FilterState } from './MapFilters';
import MapStats from './map/MapStats';
import RouteSearchPanel from './map/RouteSearchPanel';
import CargoVehicleSelector from './map/CargoVehicleSelector';
import AdaptiveMapContainer from './map/AdaptiveMapContainer';
import MarkerDetailsModal from './map/MarkerDetailsModal';
import CargoDetailsModal from './map/CargoDetailsModal';
import VehicleDetailsModal from './map/VehicleDetailsModal';
import StatusSelector from './map/StatusSelector';
import NearbyCargoNotification from './map/NearbyCargoNotification';
import { MapMarker, CargoDetailsModal as CargoDetailsModalType, VehicleDetailsModal as VehicleDetailsModalType, LiveMapProps } from './map/MapTypes';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

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

      {/* Плавающие кнопки справа */}
      <div className="absolute right-4 top-4 z-10 flex flex-col gap-3">
        {/* Кнопка статистики */}
        <button
          onClick={() => setShowStatsModal(true)}
          className="w-14 h-14 rounded-full bg-white/15 dark:bg-gray-900/15 backdrop-blur-md border border-white/20 dark:border-gray-700/20 shadow-2xl flex items-center justify-center hover:bg-white/25 dark:hover:bg-gray-900/25 transition-all hover:scale-110 active:scale-95"
        >
          <div className="relative">
            <Icon name="BarChart3" size={24} className="text-gray-900 dark:text-white" />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">{cargoCount}</span>
            </div>
          </div>
        </button>

        {/* Кнопка фильтров */}
        {!isPublic && (
          <button
            onClick={() => setShowFiltersModal(true)}
            className="w-14 h-14 rounded-full bg-white/15 dark:bg-gray-900/15 backdrop-blur-md border border-white/20 dark:border-gray-700/20 shadow-2xl flex items-center justify-center hover:bg-white/25 dark:hover:bg-gray-900/25 transition-all hover:scale-110 active:scale-95"
          >
            <Icon name="Filter" size={24} className="text-gray-900 dark:text-white" />
          </button>
        )}

        {/* Кнопка поиска */}
        <button
          onClick={() => setShowSearchModal(true)}
          className="w-14 h-14 rounded-full bg-white/15 dark:bg-gray-900/15 backdrop-blur-md border border-white/20 dark:border-gray-700/20 shadow-2xl flex items-center justify-center hover:bg-white/25 dark:hover:bg-gray-900/25 transition-all hover:scale-110 active:scale-95"
        >
          <Icon name="Search" size={24} className="text-gray-900 dark:text-white" />
        </button>
      </div>

      {/* Модальное окно статистики */}
      <Dialog open={showStatsModal} onOpenChange={setShowStatsModal}>
        <DialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-white/20 dark:border-gray-700/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="BarChart3" size={20} />
              Статистика
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-700/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Icon name="Package" size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{cargoCount}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Всего грузов</p>
                </div>
              </div>
              {!isPublic && (
                <div className="mt-3">
                  <StatusSelector 
                    userType="client"
                    status={cargoStatus}
                    onStatusChange={setCargoStatus}
                  />
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200/50 dark:border-green-700/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Icon name="Truck" size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{driverCount}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Перевозчиков свободно</p>
                </div>
              </div>
              {!isPublic && (
                <div className="mt-3">
                  <StatusSelector 
                    userType="driver"
                    status={driverStatus}
                    onStatusChange={setDriverStatus}
                  />
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Модальное окно фильтров */}
      {!isPublic && (
        <Dialog open={showFiltersModal} onOpenChange={setShowFiltersModal}>
          <DialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-white/20 dark:border-gray-700/20 max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Icon name="Filter" size={20} />
                Фильтры
              </DialogTitle>
            </DialogHeader>
            <MapFilters onFilterChange={handleFilterChange} />
          </DialogContent>
        </Dialog>
      )}

      {/* Модальное окно поиска */}
      <Dialog open={showSearchModal} onOpenChange={setShowSearchModal}>
        <DialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-white/20 dark:border-gray-700/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Search" size={20} />
              Поиск маршрутов
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <RouteSearchPanel 
              routeSearch={routeSearch} 
              onRouteChange={setRouteSearch}
              onLocationDetected={setUserLocation}
            />

            <div className="border-t border-gray-200/30 dark:border-gray-700/30 pt-4" />

            <CargoVehicleSelector 
              filters={filters}
              onCargoTypeClick={handleCargoTypeClick}
              onVehicleTypeClick={handleVehicleTypeClick}
            />
          </div>
        </DialogContent>
      </Dialog>

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
