import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface MapFilterOptions {
  showClients: boolean;
  showCarriers: boolean;
  vehicleTypes: string[];
  cargoTypes: string[];
  dateRange: 'today' | 'week' | 'month' | 'all';
}

interface MapFiltersProps {
  filters: MapFilterOptions;
  onChange: (filters: MapFilterOptions) => void;
  onClose?: () => void;
}

export function MapFilters({ filters, onChange, onClose }: MapFiltersProps) {
  const { t } = useTranslation();

  const vehicleTypes = [
    'tent_truck',
    'refrigerator',
    'container',
    'flatbed',
    'tanker',
  ];

  const cargoTypes = ['box', 'pallet', 'container', 'bulk', 'liquid'];

  const toggleVehicleType = (type: string) => {
    const updated = filters.vehicleTypes.includes(type)
      ? filters.vehicleTypes.filter((t) => t !== type)
      : [...filters.vehicleTypes, type];
    onChange({ ...filters, vehicleTypes: updated });
  };

  const toggleCargoType = (type: string) => {
    const updated = filters.cargoTypes.includes(type)
      ? filters.cargoTypes.filter((t) => t !== type)
      : [...filters.cargoTypes, type];
    onChange({ ...filters, cargoTypes: updated });
  };

  const resetFilters = () => {
    onChange({
      showClients: true,
      showCarriers: true,
      vehicleTypes: [],
      cargoTypes: [],
      dateRange: 'all',
    });
  };

  return (
    <Card className="p-4 max-w-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          <h3 className="font-semibold">{t('filters.title')}</h3>
        </div>
        {onClose && (
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">{t('filters.showOnMap')}</h4>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <Checkbox
                checked={filters.showClients}
                onCheckedChange={(checked) =>
                  onChange({ ...filters, showClients: checked as boolean })
                }
              />
              <span className="text-sm">{t('filters.clients')}</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox
                checked={filters.showCarriers}
                onCheckedChange={(checked) =>
                  onChange({ ...filters, showCarriers: checked as boolean })
                }
              />
              <span className="text-sm">{t('filters.carriers')}</span>
            </label>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">{t('filters.vehicleType')}</h4>
          <div className="space-y-2">
            {vehicleTypes.map((type) => (
              <label key={type} className="flex items-center gap-2">
                <Checkbox
                  checked={filters.vehicleTypes.includes(type)}
                  onCheckedChange={() => toggleVehicleType(type)}
                />
                <span className="text-sm">{t(`vehicleTypes.${type}`)}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">{t('filters.cargoType')}</h4>
          <div className="space-y-2">
            {cargoTypes.map((type) => (
              <label key={type} className="flex items-center gap-2">
                <Checkbox
                  checked={filters.cargoTypes.includes(type)}
                  onCheckedChange={() => toggleCargoType(type)}
                />
                <span className="text-sm">{t(`cargoTypes.${type}`)}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">{t('filters.period')}</h4>
          <Select
            value={filters.dateRange}
            onValueChange={(value) =>
              onChange({ ...filters, dateRange: value as MapFilterOptions['dateRange'] })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">{t('filters.today')}</SelectItem>
              <SelectItem value="week">{t('filters.week')}</SelectItem>
              <SelectItem value="month">{t('filters.month')}</SelectItem>
              <SelectItem value="all">{t('filters.all')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={resetFilters} variant="outline" className="w-full">
          {t('filters.reset')}
        </Button>
      </div>
    </Card>
  );
}
