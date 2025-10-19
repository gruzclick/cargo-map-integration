import { useState, useEffect } from 'react';
import YandexMapContainer from './YandexMapContainer';
import OpenStreetMapContainer from './OpenStreetMapContainer';
import { MapMarker } from './MapTypes';
import Icon from '@/components/ui/icon';

interface AdaptiveMapContainerProps {
  filteredMarkers: MapMarker[];
  isPublic: boolean;
  onMarkerClick?: (marker: MapMarker) => void;
  onMapLoaded: (loaded: boolean) => void;
}

export default function AdaptiveMapContainer(props: AdaptiveMapContainerProps) {
  const [useOpenStreetMap, setUseOpenStreetMap] = useState(false);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [yandexFailed, setYandexFailed] = useState(false);

  useEffect(() => {
    setYandexFailed(false);
    setUseOpenStreetMap(false);
    setShowSwitcher(true);
  }, []);

  const handleMapLoadError = () => {
    console.warn('Яндекс.Карты: ошибка загрузки, переключаюсь на OpenStreetMap');
    setYandexFailed(true);
    setUseOpenStreetMap(true);
  };

  return (
    <div className="relative">
      {useOpenStreetMap ? (
        <OpenStreetMapContainer {...props} />
      ) : (
        <YandexMapContainer {...props} />
      )}

      {/* Кнопка переключения карт */}
      <div className="absolute top-3 right-3 z-[1000]">
        {!yandexFailed && (
          <button
            onClick={() => setUseOpenStreetMap(!useOpenStreetMap)}
            className="bg-white/95 dark:bg-gray-800/95 hover:bg-white dark:hover:bg-gray-800 backdrop-blur-sm px-2.5 py-1.5 rounded-lg shadow-lg text-[11px] font-semibold transition-all hover:shadow-xl flex items-center gap-1.5 border border-gray-200/50 dark:border-gray-700/50"
            title={useOpenStreetMap ? 'Переключить на Яндекс.Карты' : 'Переключить на OpenStreetMap'}
          >
            <Icon name="Map" size={14} className="text-gray-600 dark:text-gray-400" />
            <span className="text-gray-900 dark:text-gray-100">
              {useOpenStreetMap ? 'Яндекс' : 'OSM'}
            </span>
          </button>
        )}
      </div>

      {/* Подсказка про API ключ */}
      {yandexFailed && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Icon name="Info" size={20} className="text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">
                Используется OpenStreetMap
              </h3>
              <p className="text-sm text-blue-700 mb-2">
                Яндекс.Карты временно недоступны. Для их активации добавьте API ключ в секреты проекта.
              </p>
              <a
                href="https://developer.tech.yandex.ru/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1"
              >
                Получить API ключ Яндекс.Карт
                <Icon name="ExternalLink" size={14} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}