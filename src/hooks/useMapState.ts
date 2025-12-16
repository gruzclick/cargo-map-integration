import { useState } from 'react';
import { MapMarker, CargoDetailsModal, VehicleDetailsModal } from '@/components/map/MapTypes';
import { FilterState } from '@/components/MapFilters';

export const useMapState = () => {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [filteredMarkers, setFilteredMarkers] = useState<MapMarker[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ userType: 'all' });
  const [routeSearch, setRouteSearch] = useState({ from: '', to: '' });
  const [driverStatus, setDriverStatus] = useState('free');
  const [cargoStatus, setCargoStatus] = useState('ready');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  const [cargoDetailsModal, setCargoDetailsModal] = useState<CargoDetailsModal | null>(null);
  const [cargoDetails, setCargoDetails] = useState({ quantity: '', weight: '', volume: '' });
  
  const [vehicleDetailsModal, setVehicleDetailsModal] = useState<VehicleDetailsModal | null>(null);
  const [vehicleDetails, setVehicleDetails] = useState({ boxCount: '', palletCount: '', oversizedCount: '', volume: '' });

  const [showSidebar, setShowSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'search'>('search');
  const [cargoBlockExpanded, setCargoBlockExpanded] = useState(true);
  const [driverBlockExpanded, setDriverBlockExpanded] = useState(true);
  const [lastInteraction, setLastInteraction] = useState(Date.now());
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  return {
    markers,
    setMarkers,
    filteredMarkers,
    setFilteredMarkers,
    selectedMarker,
    setSelectedMarker,
    mapLoaded,
    setMapLoaded,
    filters,
    setFilters,
    routeSearch,
    setRouteSearch,
    driverStatus,
    setDriverStatus,
    cargoStatus,
    setCargoStatus,
    userLocation,
    setUserLocation,
    cargoDetailsModal,
    setCargoDetailsModal,
    cargoDetails,
    setCargoDetails,
    vehicleDetailsModal,
    setVehicleDetailsModal,
    vehicleDetails,
    setVehicleDetails,
    showSidebar,
    setShowSidebar,
    activeTab,
    setActiveTab,
    cargoBlockExpanded,
    setCargoBlockExpanded,
    driverBlockExpanded,
    setDriverBlockExpanded,
    lastInteraction,
    setLastInteraction,
    touchStart,
    setTouchStart,
    touchEnd,
    setTouchEnd,
  };
};
