import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapMarker } from './MapTypes';

// Исправление иконок Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Кастомные иконки для грузов и водителей
const createCustomIcon = (type: 'cargo' | 'driver', color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        font-size: 18px;
      ">
        ${type === 'cargo' ? '📦' : '🚚'}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

interface OpenStreetMapContainerProps {
  filteredMarkers: MapMarker[];
  isPublic?: boolean;
  onMarkerClick?: (marker: MapMarker) => void;
  onMapLoaded?: (loaded: boolean) => void;
}

const MapUpdater = ({ markers }: { markers: MapMarker[] }) => {
  const map = useMap();
  
  useEffect(() => {
    if (markers.length > 0) {
      const bounds = markers.map(m => [m.lat, m.lng] as [number, number]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [markers, map]);
  
  return null;
};

export default function OpenStreetMapContainer({ 
  filteredMarkers, 
  isPublic = false, 
  onMarkerClick,
  onMapLoaded 
}: OpenStreetMapContainerProps) {
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (onMapLoaded) {
      onMapLoaded(true);
    }
  }, [onMapLoaded]);

  const defaultCenter: [number, number] = [55.7558, 37.6173]; // Москва
  const defaultZoom = 10;

  return (
    <div className="relative w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapUpdater markers={filteredMarkers} />
        
        {filteredMarkers.map((marker) => {
          const icon = createCustomIcon(
            marker.type,
            marker.type === 'cargo' ? '#3B82F6' : '#10B981'
          );
          
          return (
            <Marker
              key={marker.id}
              position={[marker.lat, marker.lng]}
              icon={icon}
              eventHandlers={{
                click: () => onMarkerClick?.(marker)
              }}
            >
              <Popup>
                <div className="p-2">
                  <div className="font-bold text-sm mb-1">
                    {marker.type === 'cargo' ? '📦 Груз' : '🚚 Водитель'}
                  </div>
                  <div className="text-xs text-gray-600">
                    {marker.details || 'Нет описания'}
                  </div>
                  {marker.vehicleCategory && (
                    <div className="text-xs text-gray-500 mt-1">
                      Транспорт: {marker.vehicleCategory}
                    </div>
                  )}
                  {marker.cargoType && (
                    <div className="text-xs text-gray-500 mt-1">
                      Тип груза: {marker.cargoType}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg text-xs text-gray-600 z-[1000]">
        🗺️ OpenStreetMap (без API ключа)
      </div>
    </div>
  );
}
