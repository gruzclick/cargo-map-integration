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
  const [roleExpanded, setRoleExpanded] = useState(false);
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
        <div className="space-y-2.5">
          <div>
            <button
              onClick={() => setRoleExpanded(!roleExpanded)}
              className="w-full flex items-center justify-between px-3 py-2.5 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-2">
                <Icon name="User" size={18} className="text-blue-600" />
                <div className="text-left">
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {filters.userType === 'carrier' ? '🚚 Перевозчик' : '📦 Отправитель'}
                  </div>
                </div>
              </div>
              <Icon 
                name={roleExpanded ? "ChevronUp" : "ChevronDown"} 
                size={20} 
                className="text-blue-600 transition-transform"
              />
            </button>
            
            {roleExpanded && (
              <div className="mt-2 p-2 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-lg space-y-1.5">
                <button
                  onClick={() => {
                    updateFilter('userType', 'carrier');
                    setRoleExpanded(false);
                  }}
                  className={`w-full flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-lg transition-all font-semibold ${
                    filters.userType === 'carrier'
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon name="Truck" size={18} />
                  Перевозчик
                </button>
                <button
                  onClick={() => {
                    updateFilter('userType', 'client');
                    setRoleExpanded(false);
                  }}
                  className={`w-full flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-lg transition-all font-semibold ${
                    filters.userType === 'client'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon name="Package" size={18} />
                  Отправитель
                </button>
              </div>
            )}
          </div>

          {filters.userType === 'carrier' && (
            <div className="bg-green-50/50 dark:bg-green-900/10 p-2.5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Package" size={16} className="text-green-600" />
                <div className="text-xs font-semibold text-green-900 dark:text-green-100">Доступные грузы</div>
              </div>
              <div className="text-xs text-green-800 dark:text-green-200 space-y-1">
                <div>• Поставки на склады WB/Ozon</div>
                <div>• Короба и паллеты</div>
                <div>• Оплата по факту доставки</div>
              </div>
            </div>
          )}
          
          {filters.userType === 'client' && (
            <div className="bg-blue-50/50 dark:bg-blue-900/10 p-2.5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Truck" size={16} className="text-blue-600" />
                <div className="text-xs font-semibold text-blue-900 dark:text-blue-100">Свободные авто</div>
              </div>
              <div className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                <div>• Проверенные перевозчики</div>
                <div>• Онлайн отслеживание</div>
                <div>• Гарантия доставки</div>
              </div>
            </div>
          )}
        </div>
            
        {isExpanded && (
          <div className="mt-2 space-y-2">
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

                <div className="grid grid-cols-2 gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-[11px] h-8 rounded-lg px-2 hover:bg-gray-100 dark:hover:bg-gray-800 min-w-0"
                  >
                    <Icon name="SlidersHorizontal" size={14} className="mr-1" />
                    <span className="truncate">{isExpanded ? 'Меньше' : 'Больше'}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const resetFilters = { userType: 'all' as const };
                      setFilters(resetFilters);
                      onFilterChange(resetFilters);
                    }}
                    className="text-[11px] h-8 rounded-lg px-2 hover:bg-gray-100 dark:hover:bg-gray-800 min-w-0"
                  >
                    <Icon name="RotateCcw" size={14} className="mr-1" />
                    <span className="truncate">Сбросить</span>
                  </Button>
                </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapFilters;