import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

interface AdBanner {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  linkUrl: string;
  backgroundColor: string;
  textColor: string;
}

const DEMO_ADS: AdBanner[] = [
  {
    id: '1',
    title: 'Страхование грузов',
    description: 'Защитите ваш груз от рисков. Оформление за 5 минут!',
    linkUrl: 'https://example.com/insurance',
    backgroundColor: '#3B82F6',
    textColor: '#FFFFFF'
  },
  {
    id: '2',
    title: 'GPS-трекеры для транспорта',
    description: 'Отслеживайте груз в реальном времени. Скидка 20%!',
    linkUrl: 'https://example.com/gps',
    backgroundColor: '#10B981',
    textColor: '#FFFFFF'
  },
  {
    id: '3',
    title: 'Топливные карты для водителей',
    description: 'Экономия до 15% на топливе по всей России',
    linkUrl: 'https://example.com/fuel',
    backgroundColor: '#F59E0B',
    textColor: '#FFFFFF'
  }
];

export default function RotatingAdBanner() {
  const [showAd, setShowAd] = useState(true);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setShowAd(prev => !prev);
        
        if (showAd) {
          setCurrentAdIndex(prev => (prev + 1) % DEMO_ADS.length);
        }
        
        setIsVisible(true);
      }, 500);
    }, 10000);

    return () => clearInterval(interval);
  }, [showAd]);

  const currentAd = DEMO_ADS[currentAdIndex];

  if (!isVisible) {
    return (
      <div className="h-8 md:h-10 flex items-center justify-center transition-opacity duration-500 opacity-0">
        <div className="w-32 h-4 bg-muted/20 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!showAd) {
    return (
      <div className="h-8 md:h-10 flex items-center justify-center transition-opacity duration-500">
        <h1 className="text-base md:text-lg font-semibold tracking-tight text-foreground">
          Логистика Грузоперевозок
        </h1>
      </div>
    );
  }

  return (
    <a
      href={currentAd.linkUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block h-8 md:h-10 px-3 md:px-4 rounded-lg transition-all duration-500 hover:scale-[1.02] hover:shadow-md"
      style={{
        backgroundColor: currentAd.backgroundColor,
        color: currentAd.textColor
      }}
    >
      <div className="h-full flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Icon name="Megaphone" size={16} className="flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-xs md:text-sm font-semibold truncate">
              {currentAd.title}
            </div>
            <div className="text-[10px] md:text-xs opacity-90 truncate hidden md:block">
              {currentAd.description}
            </div>
          </div>
        </div>
        <Icon name="ExternalLink" size={14} className="flex-shrink-0 opacity-70" />
      </div>
    </a>
  );
}
