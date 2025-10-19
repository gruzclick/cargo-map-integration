import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

interface AdBanner {
  id: string;
  title: string;
  description: string;
  backgroundColor: string;
  textColor: string;
}

const DEMO_ADS: AdBanner[] = [
  {
    id: '1',
    title: 'Страхование грузов',
    description: 'Защитите ваш груз от рисков. Оформление за 5 минут!',
    backgroundColor: '#3B82F6',
    textColor: '#FFFFFF'
  },
  {
    id: '2',
    title: 'GPS-трекеры для транспорта',
    description: 'Отслеживайте груз в реальном времени. Скидка 20%!',
    backgroundColor: '#10B981',
    textColor: '#FFFFFF'
  },
  {
    id: '3',
    title: 'Топливные карты для водителей',
    description: 'Экономия до 15% на топливе по всей России',
    backgroundColor: '#F59E0B',
    textColor: '#FFFFFF'
  }
];

interface AdPreviewProps {
  variant?: 'desktop' | 'mobile';
}

export default function AdPreview({ variant = 'desktop' }: AdPreviewProps) {
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

  if (variant === 'mobile') {
    if (!isVisible) {
      return (
        <div className="w-full px-4 py-3 transition-opacity duration-500 opacity-0">
          <div className="h-16 bg-muted/20 rounded-lg animate-pulse"></div>
        </div>
      );
    }

    if (!showAd) {
      return (
        <div className="w-full px-4 py-3 transition-opacity duration-500">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg p-3 text-center border border-border">
            <h2 className="text-sm font-bold text-foreground">
              📦 Логистика Грузоперевозок
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Найдите грузы и водителей в одном месте
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full px-4 py-3 transition-opacity duration-500">
        <div
          className="rounded-lg p-4 transition-all duration-300 hover:shadow-lg border-2"
          style={{
            backgroundColor: currentAd.backgroundColor,
            borderColor: currentAd.backgroundColor
          }}
        >
          <div className="flex items-start gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: currentAd.textColor
              }}
            >
              <Icon name="Megaphone" size={20} />
            </div>
            <div className="flex-1 min-w-0" style={{ color: currentAd.textColor }}>
              <div className="text-sm font-bold mb-1">{currentAd.title}</div>
              <div className="text-xs opacity-90">{currentAd.description}</div>
              <div className="mt-2 flex items-center text-xs opacity-75">
                <span>Узнать подробнее</span>
                <Icon name="ChevronRight" size={14} className="ml-1" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop version
  if (!isVisible) {
    return (
      <div className="h-10 flex items-center justify-center transition-opacity duration-500 opacity-0">
        <div className="w-32 h-4 bg-muted/20 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!showAd) {
    return (
      <div className="h-10 flex items-center justify-center transition-opacity duration-500">
        <h1 className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
          <Icon name="Truck" size={18} />
          Логистика Грузоперевозок
        </h1>
      </div>
    );
  }

  return (
    <div
      className="h-10 px-4 rounded-lg transition-all duration-500 hover:scale-[1.02] hover:shadow-md cursor-pointer"
      style={{
        backgroundColor: currentAd.backgroundColor,
        color: currentAd.textColor
      }}
    >
      <div className="h-full flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Icon name="Megaphone" size={16} className="flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold truncate">
              {currentAd.title}
            </div>
            <div className="text-xs opacity-90 truncate hidden md:block">
              {currentAd.description}
            </div>
          </div>
        </div>
        <Icon name="ExternalLink" size={14} className="flex-shrink-0 opacity-70" />
      </div>
    </div>
  );
}
