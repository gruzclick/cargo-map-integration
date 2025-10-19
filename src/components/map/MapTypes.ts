export interface MapMarker {
  id: string;
  type: 'cargo' | 'driver';
  lat: number;
  lng: number;
  name: string;
  details: string;
  status?: string;
  cargoType?: 'box' | 'pallet' | 'oversized';
  vehicleCategory?: 'car' | 'truck' | 'semi';
  vehicleStatus?: 'free' | 'has_space' | 'full';
  rating?: number;
  capacity?: number;
  freeSpace?: number;
  destinationWarehouse?: string;
  readyStatus?: string;
  readyTime?: string;
  quantity?: number;
  weight?: number;
  volume?: number;
  clientAddress?: string;
  clientRating?: number;
}

export interface CargoDetailsModal {
  type: 'box' | 'pallet' | 'oversized';
  isDriver: boolean;
}

export interface VehicleDetailsModal {
  type: 'car' | 'truck' | 'semi';
  isClient: boolean;
}

export interface LiveMapProps {
  isPublic?: boolean;
  onMarkerClick?: () => void;
}
