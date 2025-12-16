import AdaptiveMapContainer from './map/AdaptiveMapContainer';
import MarkerDetailsModal from './map/MarkerDetailsModal';
import CargoDetailsModal from './map/CargoDetailsModal';
import VehicleDetailsModal from './map/VehicleDetailsModal';
import NearbyCargoNotification from './map/NearbyCargoNotification';
import AIAssistant from './AIAssistant';
import MapSidebar from './map/MapSidebar';
import MapControls from './map/MapControls';
import { MapMarker, LiveMapProps } from './map/MapTypes';
import { FilterState } from './MapFilters';
import { useMapState } from '@/hooks/useMapState';
import { useMapLogic } from '@/hooks/useMapLogic';

const LiveMap = ({ isPublic = false, onMarkerClick }: LiveMapProps = {}) => {
  const state = useMapState();
  
  const { detectUserLocation } = useMapLogic({
    markers: state.markers,
    setMarkers: state.setMarkers,
    setFilteredMarkers: state.setFilteredMarkers,
    filters: state.filters,
    routeSearch: state.routeSearch,
    driverStatus: state.driverStatus,
    cargoStatus: state.cargoStatus,
    userLocation: state.userLocation,
    setUserLocation: state.setUserLocation,
    setCargoBlockExpanded: state.setCargoBlockExpanded,
    setDriverBlockExpanded: state.setDriverBlockExpanded,
    lastInteraction: state.lastInteraction,
  });

  const handleTouchStart = (e: React.TouchEvent) => {
    state.setTouchEnd(null);
    state.setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    state.setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!state.touchStart || !state.touchEnd) return;
    const distance = state.touchStart - state.touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe && state.showSidebar) {
      state.setShowSidebar(false);
    } else if (isRightSwipe && !state.showSidebar) {
      state.setShowSidebar(true);
    }
  };

  const handleFilterChange = (newFilters: FilterState) => {
    state.setFilters(newFilters);
  };

  const handleCargoTypeClick = (type: 'box' | 'pallet' | 'oversized', isDriver: boolean) => {
    console.log('Cargo type clicked:', type, 'isDriver:', isDriver);
  };

  const handleVehicleTypeClick = (type: 'car' | 'truck' | 'semi', isClient: boolean) => {
    console.log('Vehicle type clicked:', type, 'isClient:', isClient);
  };

  const submitCargoDetails = () => {
    console.log('Cargo details submitted:', state.cargoDetailsModal, state.cargoDetails);
    state.setCargoDetailsModal(null);
  };

  const submitVehicleDetails = () => {
    console.log('Vehicle details submitted:', state.vehicleDetailsModal, state.vehicleDetails);
    state.setVehicleDetailsModal(null);
  };

  const handleMapMarkerClick = (marker: MapMarker) => {
    if (isPublic) {
      onMarkerClick?.();
    } else {
      state.setSelectedMarker(marker);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden touch-pan-y">
      <NearbyCargoNotification 
        markers={state.markers}
        userLocation={state.userLocation}
        radiusKm={50}
      />

      <div className="absolute inset-0 z-0">
        <AdaptiveMapContainer 
          filteredMarkers={state.filteredMarkers}
          isPublic={isPublic}
          onMarkerClick={handleMapMarkerClick}
          onMapLoaded={state.setMapLoaded}
          userLocation={state.userLocation}
        />
      </div>

      <MapControls
        showSidebar={state.showSidebar}
        setShowSidebar={state.setShowSidebar}
        detectUserLocation={detectUserLocation}
        handleTouchStart={handleTouchStart}
        handleTouchMove={handleTouchMove}
        handleTouchEnd={handleTouchEnd}
      />

      <MapSidebar
        showSidebar={state.showSidebar}
        activeTab={state.activeTab}
        setActiveTab={state.setActiveTab}
        setShowSidebar={state.setShowSidebar}
        isPublic={isPublic}
        filters={state.filters}
        handleFilterChange={handleFilterChange}
        routeSearch={state.routeSearch}
        setRouteSearch={state.setRouteSearch}
        setUserLocation={state.setUserLocation}
        cargoBlockExpanded={state.cargoBlockExpanded}
        setCargoBlockExpanded={state.setCargoBlockExpanded}
        driverBlockExpanded={state.driverBlockExpanded}
        setDriverBlockExpanded={state.setDriverBlockExpanded}
        setLastInteraction={state.setLastInteraction}
        handleTouchStart={handleTouchStart}
        handleTouchMove={handleTouchMove}
        handleTouchEnd={handleTouchEnd}
        handleCargoTypeClick={handleCargoTypeClick}
        handleVehicleTypeClick={handleVehicleTypeClick}
        cargoStatus={state.cargoStatus}
        setCargoStatus={state.setCargoStatus}
        driverStatus={state.driverStatus}
        setDriverStatus={state.setDriverStatus}
        filteredMarkers={state.filteredMarkers}
      />

      {!isPublic && (
        <MarkerDetailsModal 
          marker={state.selectedMarker}
          onClose={() => state.setSelectedMarker(null)}
        />
      )}

      <CargoDetailsModal 
        modal={state.cargoDetailsModal}
        details={state.cargoDetails}
        onDetailsChange={state.setCargoDetails}
        onSubmit={submitCargoDetails}
        onClose={() => state.setCargoDetailsModal(null)}
      />

      <VehicleDetailsModal 
        modal={state.vehicleDetailsModal}
        details={state.vehicleDetails}
        onDetailsChange={state.setVehicleDetails}
        onSubmit={submitVehicleDetails}
        onClose={() => state.setVehicleDetailsModal(null)}
      />

      <AIAssistant />
    </div>
  );
};

export default LiveMap;
