import { useEffect } from 'react';
import { MapMarker } from '@/components/map/MapTypes';
import { FilterState } from '@/components/MapFilters';
import { getOrderMarkers } from '@/utils/orderMapIntegration';

interface UseMapLogicProps {
  markers: MapMarker[];
  setMarkers: (markers: MapMarker[] | ((prev: MapMarker[]) => MapMarker[])) => void;
  setFilteredMarkers: (markers: MapMarker[]) => void;
  filters: FilterState;
  routeSearch: { from: string; to: string };
  driverStatus: string;
  cargoStatus: string;
  userLocation: { lat: number; lng: number } | null;
  setUserLocation: (location: { lat: number; lng: number } | null) => void;
  setCargoBlockExpanded: (expanded: boolean) => void;
  setDriverBlockExpanded: (expanded: boolean) => void;
  lastInteraction: number;
}

export const useMapLogic = ({
  markers,
  setMarkers,
  setFilteredMarkers,
  filters,
  routeSearch,
  driverStatus,
  cargoStatus,
  userLocation,
  setUserLocation,
  setCargoBlockExpanded,
  setDriverBlockExpanded,
  lastInteraction,
}: UseMapLogicProps) => {
  
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

  const loadUserActiveOrder = async () => {
    try {
      const userData = localStorage.getItem('user_data');
      if (!userData) return;

      const user = JSON.parse(userData);
      const userType = user.role;
      
      let activeOrders = [];
      
      if (userType === 'client') {
        const response = await fetch('https://functions.poehali.dev/6b12a65e-1dc2-4374-a1b0-0260cc1a1c95', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id })
        });
        const data = await response.json();
        activeOrders = data.orders || [];
      } else if (userType === 'carrier') {
        const response = await fetch('https://functions.poehali.dev/1bf7c6c6-3e8d-4aed-a063-32efaf0118a4', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id })
        });
        const data = await response.json();
        if (data.order) activeOrders = [data.order];
      }

      if (activeOrders.length > 0 && userLocation) {
        const userMarkers: MapMarker[] = activeOrders.map((order: any) => ({
          id: `user-${order.id}`,
          lat: order.lat || userLocation.lat,
          lng: order.lng || userLocation.lng,
          type: userType === 'client' ? 'cargo' : 'driver',
          role: userType,
          name: user.name || 'Вы',
          phone: user.phone,
          details: order.details || '',
          cargoType: order.cargo_type,
          vehicleCategory: order.vehicle_type,
          isCurrentUser: true
        }));

        setMarkers(prev => {
          const filtered = prev.filter(m => !m.id.startsWith('user-'));
          return [...filtered, ...userMarkers];
        });
      }
    } catch (error) {
      console.error('Error loading user active order:', error);
    }
  };

  const fetchMarkers = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/e0c57b5b-aa36-4b28-8b31-c70ece513cae?path=/users');
      const data = await response.json();
      
      const orderMarkers = getOrderMarkers();
      
      const orderMapMarkers = orderMarkers.map(om => ({
        id: om.id,
        lat: om.lat,
        lng: om.lng,
        type: om.type === 'order-pickup' ? 'cargo' : 'cargo',
        name: om.title,
        details: om.details,
        phone: om.order.contactPhone || '',
        cargoType: 'box' as const,
        vehicleCategory: undefined,
        carrierStatus: undefined,
        clientStatus: om.order.status === 'active' ? 'ready_now' : undefined,
        vehicleStatus: undefined,
        readyStatus: om.order.status === 'active' ? 'ready' : 'scheduled',
        isCurrentUser: false,
        role: undefined
      }));
      
      if (data.markers && data.markers.length > 0) {
        setMarkers(prev => {
          const userMarkers = prev.filter(m => m.id.startsWith('user-'));
          return [...data.markers, ...orderMapMarkers, ...userMarkers];
        });
      } else {
        const { generateAllMockData } = await import('@/utils/mockData');
        const mockMarkers = generateAllMockData();
        setMarkers(prev => {
          const userMarkers = prev.filter(m => m.id.startsWith('user-'));
          return [...mockMarkers, ...orderMapMarkers, ...userMarkers];
        });
      }
    } catch (error) {
      console.error('Failed to fetch real users, using mock data:', error);
      const { generateAllMockData } = await import('@/utils/mockData');
      const mockMarkers = generateAllMockData();
      
      const orderMarkers = getOrderMarkers();
      const orderMapMarkers = orderMarkers.map(om => ({
        id: om.id,
        lat: om.lat,
        lng: om.lng,
        type: om.type === 'order-pickup' ? 'cargo' : 'cargo',
        name: om.title,
        details: om.details,
        phone: om.order.contactPhone || '',
        cargoType: 'box' as const,
        vehicleCategory: undefined,
        carrierStatus: undefined,
        clientStatus: om.order.status === 'active' ? 'ready_now' : undefined,
        vehicleStatus: undefined,
        readyStatus: om.order.status === 'active' ? 'ready' : 'scheduled',
        isCurrentUser: false,
        role: undefined
      }));
      
      setMarkers(prev => {
        const userMarkers = prev.filter(m => m.id.startsWith('user-'));
        return [...mockMarkers, ...orderMapMarkers, ...userMarkers];
      });
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

  useEffect(() => {
    fetchMarkers();
    const hasDetectedLocation = sessionStorage.getItem('location_detected');
    if (!hasDetectedLocation) {
      detectUserLocation();
      sessionStorage.setItem('location_detected', 'true');
    }
    loadUserActiveOrder();
    const interval = setInterval(() => {
      fetchMarkers();
      loadUserActiveOrder();
    }, 5000);
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

  return {
    detectUserLocation,
    fetchMarkers,
    applyFilters,
  };
};
