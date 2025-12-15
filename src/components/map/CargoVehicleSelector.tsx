import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import CargoTypeIcon from '../CargoTypeIcon';
import { FilterState } from '../MapFilters';

interface CargoVehicleSelectorProps {
  filters: FilterState;
  onCargoTypeClick: (type: 'box' | 'pallet' | 'oversized', isDriver: boolean) => void;
  onVehicleTypeClick: (type: 'car' | 'truck' | 'semi', isClient: boolean) => void;
}

const CargoVehicleSelector = ({ filters, onCargoTypeClick, onVehicleTypeClick }: CargoVehicleSelectorProps) => {
  if (filters.userType === 'client') {
    return (
      <div>
        <h3 className="text-xs md:text-sm font-semibold mb-2 flex items-center gap-1.5">
          <Icon name="Truck" size={14} className="text-green-500" />
          Транспорт
        </h3>
        <div className="grid grid-cols-1 gap-1.5 md:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onVehicleTypeClick('car', true)}
            className="justify-start text-xs h-8 md:h-9"
          >
            <Icon name="Car" size={14} className="mr-1.5 text-green-500 shrink-0" />
            <span className="truncate">Легковой</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onVehicleTypeClick('truck', true)}
            className="justify-start text-xs h-8 md:h-9"
          >
            <Icon name="Truck" size={14} className="mr-1.5 text-green-500 shrink-0" />
            <span className="truncate">Грузовой</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onVehicleTypeClick('semi', true)}
            className="justify-start text-xs h-8 md:h-9"
          >
            <Icon name="Container" size={14} className="mr-1.5 text-green-500 shrink-0" />
            <span className="truncate">Тягач</span>
          </Button>
        </div>
      </div>
    );
  }

  if (filters.userType === 'carrier') {
    return (
      <div>
        <h3 className="text-xs md:text-sm font-semibold mb-2 flex items-center gap-1.5">
          <Icon name="Package" size={14} className="text-sky-500" />
          Типы грузов
        </h3>
        <div className="grid grid-cols-1 gap-1.5 md:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCargoTypeClick('box', true)}
            className="justify-start text-xs h-8 md:h-9"
          >
            <div className="w-5 h-5 bg-sky-500 rounded flex items-center justify-center mr-1.5 shrink-0">
              <span className="text-white font-bold text-xs">К</span>
            </div>
            <span className="truncate">Коробки</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCargoTypeClick('pallet', true)}
            className="justify-start text-xs h-8 md:h-9"
          >
            <div className="w-5 h-5 bg-sky-500 rounded flex items-center justify-center mr-1.5 shrink-0">
              <span className="text-white font-bold text-xs">П</span>
            </div>
            <span className="truncate">Паллеты</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCargoTypeClick('oversized', true)}
            className="justify-start text-xs h-8 md:h-9"
          >
            <div className="w-5 h-5 bg-sky-500 rounded flex items-center justify-center mr-1.5 shrink-0">
              <span className="text-white font-bold text-xs">Н</span>
            </div>
            <span className="truncate">Негабарит</span>
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

export default CargoVehicleSelector;