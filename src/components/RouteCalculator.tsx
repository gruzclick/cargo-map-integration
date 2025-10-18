import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface RouteCalculatorProps {
  origin: [number, number];
  destination: [number, number];
  onRouteCalculated?: (distance: number, duration: number, cost: number) => void;
}

export function RouteCalculator({ origin, destination, onRouteCalculated }: RouteCalculatorProps) {
  const [distance, setDistance] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [cost, setCost] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    calculateRoute();
  }, [origin, destination]);

  const calculateRoute = async () => {
    setIsCalculating(true);
    
    try {
      const [lat1, lon1] = origin;
      const [lat2, lon2] = destination;
      
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distanceKm = R * c;
      
      const durationHours = distanceKm / 60;
      
      const costPerKm = 45;
      const calculatedCost = Math.round(distanceKm * costPerKm);
      
      setDistance(Math.round(distanceKm));
      setDuration(durationHours);
      setCost(calculatedCost);
      
      onRouteCalculated?.(Math.round(distanceKm), durationHours, calculatedCost);
    } catch (error) {
      console.error('Route calculation failed:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const formatDuration = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (h === 0) return `${m} мин`;
    if (m === 0) return `${h} ч`;
    return `${h} ч ${m} мин`;
  };

  if (isCalculating) {
    return (
      <Card className="p-4 bg-gray-50/50 dark:bg-gray-900/20">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Icon name="Loader2" className="animate-spin" size={16} />
          <span>Расчёт маршрута...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/30 dark:to-gray-800/30 border-gray-200/50">
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 mb-1">
            <Icon name="Route" size={14} />
            <span className="text-xs font-medium">Расстояние</span>
          </div>
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {distance} км
          </span>
        </div>
        
        <div className="flex flex-col items-center border-x border-gray-300/50 dark:border-gray-700/50">
          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 mb-1">
            <Icon name="Clock" size={14} />
            <span className="text-xs font-medium">Время</span>
          </div>
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {formatDuration(duration)}
          </span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 mb-1">
            <Icon name="Wallet" size={14} />
            <span className="text-xs font-medium">Стоимость</span>
          </div>
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {cost.toLocaleString()} ₽
          </span>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-300/50 dark:border-gray-700/50">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Расчёт: {costPerKm} ₽/км • Средняя скорость: 60 км/ч
        </p>
      </div>
    </Card>
  );
}
