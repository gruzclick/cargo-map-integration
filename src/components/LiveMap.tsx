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

      {/* Блоки поверх карты */}
      <div className="absolute top-3 left-3 right-3 z-10 space-y-2 pointer-events-none">
        <div className="flex flex-col md:flex-row gap-2 pointer-events-auto">
          {!isPublic && <MapFilters onFilterChange={handleFilterChange} className="md:w-[40%]" />}
          
          <div className="bg-white/15 dark:bg-gray-900/15 backdrop-blur-md border border-white/20 dark:border-gray-700/20 shadow-2xl animate-scale-in md:w-[30%] rounded-2xl">
            <div className="p-2.5 md:p-3">
              <div className="flex md:flex-col gap-1.5 md:gap-2">
                <div className="flex-1 md:flex-none flex items-center gap-2">
                  <div className="w-9 h-9 md:w-11 md:h-11 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                    <Icon name="Package" size={18} className="text-white md:w-6 md:h-6" />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{cargoCount}</p>
                    <p className="text-xs md:text-sm text-gray-700 dark:text-gray-200">Всего грузов</p>
                  </div>
                </div>
                {!isPublic && (
                  <div className="flex-1 md:flex-none">
                    <StatusSelector 
                      userType="client"
                      status={cargoStatus}
                      onStatusChange={setCargoStatus}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white/15 dark:bg-gray-900/15 backdrop-blur-md border border-white/20 dark:border-gray-700/20 shadow-2xl animate-scale-in md:w-[30%] rounded-2xl" style={{ animationDelay: '0.1s' }}>
            <div className="p-2.5 md:p-3">
              <div className="flex md:flex-col gap-1.5 md:gap-2">
                <div className="flex-1 md:flex-none flex items-center gap-2">
                  <div className="w-9 h-9 md:w-11 md:h-11 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                    <Icon name="Truck" size={18} className="text-white md:w-6 md:h-6" />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{driverCount}</p>
                    <p className="text-xs md:text-sm text-gray-700 dark:text-gray-200">Перевозчиков свободно</p>
                  </div>
                </div>
                {!isPublic && (
                  <div className="flex-1 md:flex-none">
                    <StatusSelector 
                      userType="driver"
                      status={driverStatus}
                      onStatusChange={setDriverStatus}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Панель поиска маршрутов внизу */}
      <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-auto">
        <Card className="border border-white/20 dark:border-gray-700/20 shadow-2xl bg-white/15 dark:bg-gray-900/15 backdrop-blur-md overflow-hidden animate-scale-in">
          <CardContent className="p-3 md:p-4">
            <RouteSearchPanel 
              routeSearch={routeSearch} 
              onRouteChange={setRouteSearch}
              onLocationDetected={setUserLocation}
            />

            <div className="border-t border-gray-200/30 dark:border-gray-700/30 my-2" />

            <CargoVehicleSelector 
              filters={filters}
              onCargoTypeClick={handleCargoTypeClick}
              onVehicleTypeClick={handleVehicleTypeClick}
            />
          </CardContent>
        </Card>
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