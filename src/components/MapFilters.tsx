import { useState } from 'react';
import { Button } from './ui/button';
import Icon from './ui/icon';
import CargoTypeIcon from './CargoTypeIcon';
import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MapFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  className?: string;
}

export interface FilterState {
  userType: 'client' | 'carrier' | 'all';
  vehicleType?: string;
  cargoType?: string;
  maxWeight?: number;
  maxVolume?: number;
}

const MapFilters = ({ onFilterChange, className }: MapFiltersProps) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    userType: 'all',
  });

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className={className}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(!isVisible)}
        className="md:hidden w-full mb-2 h-9 rounded-lg bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl border-gray-200/20 dark:border-gray-700/30 hover:bg-white/80 dark:hover:bg-gray-900/80"
      >
        <Icon name="Filter" size={16} className="mr-2" />
        {isVisible ? 'Скрыть фильтры' : 'Показать фильтры'}
      </Button>
      
      <div className={`${!isVisible ? 'hidden md:block' : ''} transition-smooth`}>
        <div className="space-y-2">


          <div className="space-y-2 md:space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-gray-900 dark:text-white">
                  Я ищу как:
                </label>
                <Button
                  variant={filters.userType === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateFilter('userType', 'all')}
                  className="text-xs h-7 rounded-lg px-3"
                >
                  Показать все
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <Button
                  variant={filters.userType === 'client' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateFilter('userType', 'client')}
                  className="text-xs h-8 rounded-lg px-2 whitespace-nowrap flex-1"
                >
                  Клиент
                </Button>
                <Button
                  variant={filters.userType === 'carrier' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateFilter('userType', 'carrier')}
                  className="text-xs h-8 rounded-lg px-2 whitespace-nowrap flex-1"
                >
                  Перевозчик
                </Button>
              </div>
            </div>

            {isExpanded && (
              <>
                {filters.userType === 'client' && (
                  <>
                    <div>
                      <label className="text-[10px] md:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-1.5 block">
                        Тип транспорта
                      </label>
                      <Select onValueChange={(value) => updateFilter('vehicleType', value)}>
                        <SelectTrigger className="w-full h-8 md:h-9 text-[10px] md:text-xs rounded-lg bg-white/50 dark:bg-gray-800/50">
                          <SelectValue placeholder="Выберите тип" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все типы</SelectItem>
                          <SelectItem value="truck">Грузовик</SelectItem>
                          <SelectItem value="van">Фургон</SelectItem>
                          <SelectItem value="semi">Полуприцеп</SelectItem>
                          <SelectItem value="trailer">Прицеп</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-[10px] md:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-1.5 block">
                        Грузоподъёмность (тонн)
                      </label>
                      <Select onValueChange={(value) => updateFilter('maxWeight', Number(value))}>
                        <SelectTrigger className="w-full h-8 md:h-9 text-[10px] md:text-xs rounded-lg bg-white/50 dark:bg-gray-800/50">
                          <SelectValue placeholder="Выберите вес" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Любая</SelectItem>
                          <SelectItem value="1">До 1 тонны</SelectItem>
                          <SelectItem value="3">До 3 тонн</SelectItem>
                          <SelectItem value="5">До 5 тонн</SelectItem>
                          <SelectItem value="10">До 10 тонн</SelectItem>
                          <SelectItem value="20">До 20 тонн</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {filters.userType === 'carrier' && (
                  <>
                    <div>
                      <label className="text-[10px] md:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-1.5 block">
                        Тип груза
                      </label>
                      <Select onValueChange={(value) => updateFilter('cargoType', value)}>
                        <SelectTrigger className="w-full h-8 md:h-9 text-[10px] md:text-xs rounded-lg bg-white/50 dark:bg-gray-800/50">
                          <SelectValue placeholder="Выберите тип" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все типы</SelectItem>
                          <SelectItem value="general">Обычные грузы</SelectItem>
                          <SelectItem value="fragile">Хрупкие грузы</SelectItem>
                          <SelectItem value="perishable">Скоропортящиеся</SelectItem>
                          <SelectItem value="hazardous">Опасные грузы</SelectItem>
                          <SelectItem value="oversized">
                            <div className="flex items-center gap-2">
                              <CargoTypeIcon type="oversized" size={16} />
                              Негабаритные
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-[10px] md:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-1.5 block">
                        Вес груза (тонн)
                      </label>
                      <Select onValueChange={(value) => updateFilter('maxWeight', Number(value))}>
                        <SelectTrigger className="w-full h-8 md:h-9 text-[10px] md:text-xs rounded-lg bg-white/50 dark:bg-gray-800/50">
                          <SelectValue placeholder="Выберите вес" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Любой</SelectItem>
                          <SelectItem value="1">До 1 тонны</SelectItem>
                          <SelectItem value="3">До 3 тонн</SelectItem>
                          <SelectItem value="5">До 5 тонн</SelectItem>
                          <SelectItem value="10">До 10 тонн</SelectItem>
                          <SelectItem value="20">До 20 тонн</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const resetFilters = { userType: 'all' as const };
                    setFilters(resetFilters);
                    onFilterChange(resetFilters);
                  }}
                  className="w-full text-[10px] md:text-xs h-7 md:h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Icon name="RotateCcw" size={12} className="mr-1 md:w-[14px] md:h-[14px]" />
                  Сбросить фильтры
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapFilters;