import { useEffect, useRef } from 'react';
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
  const emoji = type === 'cargo' ? '📦' : '🚚';
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: ${color};
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        font-size: 20px;
      ">
        ${emoji}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

interface OpenStreetMapContainerProps {
  filteredMarkers: MapMarker[];
  isPublic?: boolean;
  onMarkerClick?: (marker: MapMarker) => void;
  onMapLoaded?: (loaded: boolean) => void;
  routePath?: [number, number][];
  userLocation?: { lat: number; lng: number } | null;
}

export default function OpenStreetMapContainer({ 
  filteredMarkers, 
  isPublic = false, 
  onMarkerClick,
  onMapLoaded,
  routePath,
  userLocation 
}: OpenStreetMapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);

  // Инициализация карты
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false
    }).setView([55.7558, 37.6173], 10);
    
    // Добавляем зум-контрол в правый нижний угол
    L.control.zoom({
      position: 'bottomright'
    }).addTo(map);

    // Определяем тему (светлая/тёмная)
    const isDark = document.documentElement.classList.contains('dark');
    
    // Выбираем стиль карты в зависимости от темы
    const tileLayerUrl = isDark 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

    const tileLayer = L.tileLayer(tileLayerUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Слушаем изменения темы
    const observer = new MutationObserver(() => {
      const isDarkNow = document.documentElement.classList.contains('dark');
      const newUrl = isDarkNow
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
      
      tileLayer.setUrl(newUrl);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    const markersLayer = L.layerGroup().addTo(map);
    
    mapInstanceRef.current = map;
    markersLayerRef.current = markersLayer;

    if (onMapLoaded) {
      onMapLoaded(true);
    }

    return () => {
      observer.disconnect();
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
    };
  }, [onMapLoaded]);

  // Обновление маркеров
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;

    // Очищаем старые маркеры
    markersLayer.clearLayers();

    // Добавляем новые маркеры
    const bounds: L.LatLngExpression[] = [];

    filteredMarkers.forEach((marker, index) => {
      const icon = createCustomIcon(
        marker.type,
        marker.type === 'cargo' ? '#3B82F6' : '#10B981'
      );

      const leafletMarker = L.marker([marker.lat, marker.lng], { 
        icon,
        opacity: 0
      });

      // Popup содержимое
      const popupContent = `
        <div style="padding: 8px; min-width: 200px;">
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">
            ${marker.type === 'cargo' ? '📦 Груз' : '🚚 Водитель'}
          </div>
          <div style="font-size: 12px; color: #666; margin-bottom: 8px;">
            ${marker.details || 'Нет описания'}
          </div>
          ${marker.vehicleCategory ? `
            <div style="font-size: 11px; color: #888; margin-top: 4px;">
              Транспорт: ${marker.vehicleCategory}
            </div>
          ` : ''}
          ${marker.cargoType ? `
            <div style="font-size: 11px; color: #888; margin-top: 4px;">
              Тип груза: ${marker.cargoType}
            </div>
          ` : ''}
        </div>
      `;

      leafletMarker.bindPopup(popupContent);

      // Обработчик клика
      if (onMarkerClick) {
        leafletMarker.on('click', () => {
          onMarkerClick(marker);
        });
      }

      leafletMarker.addTo(markersLayer);
      
      // Анимация появления
      setTimeout(() => {
        leafletMarker.setOpacity(1);
      }, index * 30);
      
      bounds.push([marker.lat, marker.lng]);
    });

    // Добавляем маркер текущей геопозиции пользователя
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background: #10B981;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          ">
            <div style="width: 12px; height: 12px; background: white; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20],
      });

      const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .bindPopup('<div style="padding: 8px;"><strong>Вы здесь</strong></div>')
        .addTo(markersLayer);

      // Центрировать карту на пользователя при первом определении геопозиции
      map.setView([userLocation.lat, userLocation.lng], 14);
    } else {
      // Подгоняем карту под маркеры
      if (bounds.length > 0 && !routePath) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
      }
    }
  }, [filteredMarkers, onMarkerClick, routePath, userLocation]);

  // Отображение маршрута
  useEffect(() => {
    if (!mapInstanceRef.current || !routePath || routePath.length === 0) {
      // Удаляем старый маршрут если его нет
      if (routeLayerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
      }
      return;
    }

    const map = mapInstanceRef.current;

    // Удаляем старый маршрут
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
    }

    // Создаем новую линию маршрута
    const polyline = L.polyline(routePath, {
      color: '#8B5CF6',
      weight: 5,
      opacity: 0.7,
      smoothFactor: 1,
    }).addTo(map);

    routeLayerRef.current = polyline;

    // Подгоняем карту под маршрут
    map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
  }, [routePath]);

  return (
    <div className="relative w-full h-[800px] rounded-lg overflow-hidden">
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg text-xs text-gray-600 z-[1000] pointer-events-none">
        🗺️ OpenStreetMap
      </div>
    </div>
  );
}