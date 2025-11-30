import { useEffect, useRef } from 'react';
import { MapMarker } from './MapTypes';
import { getCargoIcon, getVehicleIcon } from './MapIconUtils';

interface YandexMapContainerProps {
  filteredMarkers: MapMarker[];
  isPublic: boolean;
  onMarkerClick?: (marker: MapMarker) => void;
  onMapLoaded: (loaded: boolean) => void;
  userLocation?: { lat: number; lng: number } | null;
}

const YandexMapContainer = ({ filteredMarkers, isPublic, onMarkerClick, onMapLoaded, userLocation }: YandexMapContainerProps) => {
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
  }, [filteredMarkers, userLocation]);

  const initMap = () => {
    if (typeof window !== 'undefined' && (window as any).ymaps && mapRef.current) {
      (window as any).ymaps.ready(() => {
        const map = new (window as any).ymaps.Map(mapRef.current, {
          center: [55.7558, 37.6173],
          zoom: 13,
          controls: ['zoomControl'],
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
      
      const markerRole = (marker as any).role || marker.type;
      
      if (marker.type === 'cargo' || markerRole === 'client') {
        if (marker.status === 'accepted' || marker.status === 'in_transit' || marker.status === 'delivered') {
          return;
        }
        
        const clientStatus = (marker as any).clientStatus || 'ready_now';
        bgColor = clientStatus === 'ready_now' ? '#0EA5E9' : '#F59E0B';
        
        iconSvg = getCargoIcon(marker.cargoType || 'box');
        const iconContent = `<div style="width: 44px; height: 44px; background: ${bgColor}; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">${iconSvg}</div>`;
        
        const placemark = new (window as any).ymaps.Placemark(
          [marker.lat, marker.lng],
          {
            hintContent: marker.name,
            balloonContent: `<div style="padding: 8px;"><strong>${marker.name}</strong><br/>${marker.phone || ''}<br/><span style="color: ${bgColor};">${clientStatus === 'ready_now' ? 'Готов сейчас' : 'Будет готов позже'}</span></div>`
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
      } else if (marker.type === 'driver' || markerRole === 'carrier' || markerRole === 'logist') {
        const carrierStatus = (marker as any).carrierStatus || (marker as any).vehicleStatus || 'free';
        
        if (markerRole === 'logist') {
          bgColor = '#8B5CF6';
          iconSvg = `<svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`;
          const iconContent = `<div style="width: 44px; height: 44px; background: ${bgColor}; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">${iconSvg}</div>`;
          
          const placemark = new (window as any).ymaps.Placemark(
            [marker.lat, marker.lng],
            {
              hintContent: marker.name,
              balloonContent: `<div style="padding: 8px;"><strong>${marker.name}</strong><br/>${marker.phone || ''}<br/><span style="color: ${bgColor};">Логист</span></div>`
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
          iconSvg = getVehicleIcon(marker.vehicleCategory || 'car', carrierStatus);
          
          const iconContent = `<div style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.25));">${iconSvg}</div>`;
          
          const placemark = new (window as any).ymaps.Placemark(
            [marker.lat, marker.lng],
            {
              hintContent: marker.name,
              balloonContent: `<div style="padding: 8px;"><strong>${marker.name}</strong><br/>${marker.phone || marker.details || ''}<br/><span>${carrierStatus === 'free' ? 'Свободен' : 'Есть места'}</span></div>`
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
      }
    });

    // Добавление маркера текущей геопозиции пользователя
    if (userLocation) {
      const userIconContent = `<div style="width: 40px; height: 40px; background: #10B981; border: 3px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3);"><svg width="20" height="20" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="4"/></svg></div>`;
      
      const userPlacemark = new (window as any).ymaps.Placemark(
        [userLocation.lat, userLocation.lng],
        {
          hintContent: 'Ваше местоположение',
          balloonContent: '<div style="padding: 8px;"><strong>Вы здесь</strong></div>'
        },
        {
          iconLayout: 'default#imageWithContent',
          iconImageHref: '',
          iconImageSize: [40, 40],
          iconImageOffset: [-20, -20],
          iconContentLayout: (window as any).ymaps.templateLayoutFactory.createClass(userIconContent)
        }
      );

      map.geoObjects.add(userPlacemark);
      
      // Центрировать карту на пользователя при первом определении геопозиции
      map.setCenter([userLocation.lat, userLocation.lng], 14);
    }
  };

  return (
    <div 
      ref={mapRef} 
      className="w-full rounded-xl overflow-hidden border border-gray-200/30 dark:border-gray-700/40 shadow-lg"
      style={{ height: '800px' }}
    />
  );
};

export default YandexMapContainer;