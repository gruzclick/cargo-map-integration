import { useEffect, useRef } from 'react';
import { MapMarker } from './MapTypes';
import { getCargoIcon, getVehicleIcon } from './MapIconUtils';

interface YandexMapContainerProps {
  filteredMarkers: MapMarker[];
  isPublic: boolean;
  onMarkerClick?: (marker: MapMarker) => void;
  onMapLoaded: (loaded: boolean) => void;
}

const YandexMapContainer = ({ filteredMarkers, isPublic, onMarkerClick, onMapLoaded }: YandexMapContainerProps) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_YANDEX_MAPS_API_KEY || '';
    
    const script = document.createElement('script');
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
    script.async = true;
    script.onload = () => {
      onMapLoaded(true);
      initMap();
    };
    script.onerror = () => {
      console.error('Ошибка загрузки Яндекс.Карт');
      onMapLoaded(false);
    };
    document.body.appendChild(script);

    // Тёмная тема для Яндекс.Карт (применяется всегда)
    const style = document.createElement('style');
    style.id = 'yandex-map-dark-theme';
    style.textContent = `
      ymaps[class*="ground-pane"] {
        filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
      }
      ymaps[class*="places-pane"],
      ymaps[class*="events-pane"] {
        filter: invert(100%) hue-rotate(180deg);
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (script.parentNode) document.body.removeChild(script);
      const existingStyle = document.getElementById('yandex-map-dark-theme');
      if (existingStyle) document.head.removeChild(existingStyle);
    };
  }, []);

  useEffect(() => {
    updateMarkers();
  }, [filteredMarkers]);

  const initMap = () => {
    if (typeof window !== 'undefined' && (window as any).ymaps && mapRef.current) {
      (window as any).ymaps.ready(() => {
        const map = new (window as any).ymaps.Map(mapRef.current, {
          center: [55.7558, 37.6173],
          zoom: 13,
          controls: ['zoomControl', 'fullscreenControl'],
          options: {
            copyrightLogoVisible: false,
            copyrightProvidersVisible: false,
            copyrightUaVisible: false
          }
        });

        map.behaviors.disable('scrollZoom');

        (mapRef.current as any).yandexMap = map;
        updateMarkers();
      });
    }
  };

  const updateMarkers = () => {
    if (!mapRef.current || !(mapRef.current as any).yandexMap) return;

    const map = (mapRef.current as any).yandexMap;
    map.geoObjects.removeAll();

    filteredMarkers.forEach((marker) => {
      let iconSvg = '';
      let bgColor = '';
      
      if (marker.type === 'cargo') {
        if (marker.status === 'accepted' || marker.status === 'in_transit' || marker.status === 'delivered') {
          return;
        }
        
        iconSvg = getCargoIcon(marker.cargoType);
        bgColor = '#0EA5E9';
        const iconContent = `<div style="width: 44px; height: 44px; background: ${bgColor}; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">${iconSvg}</div>`;
        
        const placemark = new (window as any).ymaps.Placemark(
          [marker.lat, marker.lng],
          {
            hintContent: marker.name,
            balloonContent: `<div style="padding: 8px;"><strong>${marker.name}</strong><br/>${marker.details}<br/><span style="color: ${bgColor};">${marker.status}</span></div>`
          },
          {
            iconLayout: 'default#imageWithContent',
            iconImageHref: '',
            iconImageSize: [44, 44],
            iconImageOffset: [-22, -22],
            iconContentLayout: (window as any).ymaps.templateLayoutFactory.createClass(iconContent)
          }
        );

        placemark.events.add('click', () => {
          if (onMarkerClick) {
            onMarkerClick(marker);
          }
        });

        map.geoObjects.add(placemark);
      } else {
        iconSvg = getVehicleIcon(marker.vehicleCategory, (marker as any).vehicleStatus || 'free');
        
        const iconContent = `<div style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.25));">${iconSvg}</div>`;
        
        const placemark = new (window as any).ymaps.Placemark(
          [marker.lat, marker.lng],
          {
            hintContent: marker.name,
            balloonContent: `<div style="padding: 8px;"><strong>${marker.name}</strong><br/>${marker.details}<br/><span>${marker.status}</span></div>`
          },
          {
            iconLayout: 'default#imageWithContent',
            iconImageHref: '',
            iconImageSize: [50, 50],
            iconImageOffset: [-25, -25],
            iconContentLayout: (window as any).ymaps.templateLayoutFactory.createClass(iconContent)
          }
        );

        placemark.events.add('click', () => {
          if (onMarkerClick) {
            onMarkerClick(marker);
          }
        });

        map.geoObjects.add(placemark);
      }
    });
  };

  return (
    <div 
      ref={mapRef} 
      className="w-full rounded-xl overflow-hidden border border-gray-200/30 dark:border-gray-700/40 shadow-lg"
      style={{ height: '400px' }}
    />
  );
};

export default YandexMapContainer;