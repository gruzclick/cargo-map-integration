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
}

export interface FilterState {
  userType: 'client' | 'carrier' | 'all';
  vehicleType?: string;
  cargoType?: string;
  maxWeight?: number;
  maxVolume?: number;
}

const MapFilters = ({ onFilterChange }: MapFiltersProps) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    userType: 'all',
  });

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="fixed top-16 md:top-20 left-2 md:left-4 z-10 w-[calc(100vw-16px)] max-w-[320px] md:w-80 animate-slide-in-down">
      <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl rounded-xl md:rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden transition-smooth">
        <div className="p-3 md:p-4">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="flex items-center gap-2">
              <Icon name="Filter" size={18} className="text-gray-700 dark:text-gray-300 md:w-5 md:h-5" />
              <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-gray-100">Фильтры</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 w-7 md:h-8 md:w-8 p-0 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
            >
              <Icon 
                name={isExpanded ? "ChevronUp" : "ChevronDown"} 
                size={16} 
                className="text-gray-600 dark:text-gray-400 md:w-[18px] md:h-[18px]"
              />
            </Button>
          </div>

          <div className="space-y-2 md:space-y-3">
            <div>
              <label className="text-[10px] md:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-1.5 block">
                Я ищу как:
              </label>
              <div className="grid grid-cols-3 gap-1 md:gap-2">
                <Button
                  variant={filters.userType === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateFilter('userType', 'all')}
                  className="text-[10px] md:text-xs h-7 md:h-9 rounded-lg transition-spring hover:scale-105 px-1 md:px-2"
                >
                  Все
                </Button>
                <Button
                  variant={filters.userType === 'client' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateFilter('userType', 'client')}
                  className="text-[10px] md:text-xs h-7 md:h-9 rounded-lg transition-spring hover:scale-105 px-1 md:px-2"
                >
                  <Icon name="Package" size={12} className="mr-0.5 md:mr-1 shrink-0 md:w-[14px] md:h-[14px]" />
                  <span className="hidden sm:inline">Клиент</span>
                  <span className="sm:hidden">К</span>
                </Button>
                <Button
                  variant={filters.userType === 'carrier' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateFilter('userType', 'carrier')}
                  className="text-[10px] md:text-xs h-7 md:h-9 rounded-lg transition-spring hover:scale-105 px-1 md:px-2"
                >
                  <Icon name="Truck" size={12} className="mr-0.5 md:mr-1 shrink-0 md:w-[14px] md:h-[14px]" />
                  <span className="hidden sm:inline">Перевозчик</span>
                  <span className="sm:hidden">П</span>
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
