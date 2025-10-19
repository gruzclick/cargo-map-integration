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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
      <div>
        <h3 className="text-xs md:text-sm font-semibold mb-2 flex items-center gap-1.5">
          <Icon name="Package" size={14} className="text-sky-500" />
          Типы грузов
        </h3>
        <div className="grid grid-cols-1 gap-1.5 md:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCargoTypeClick('box', filters.userType === 'carrier')}
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
            onClick={() => onCargoTypeClick('pallet', filters.userType === 'carrier')}
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
            onClick={() => onCargoTypeClick('oversized', filters.userType === 'carrier')}
            className="justify-start text-xs h-8 md:h-9"
          >
            <CargoTypeIcon type="oversized" size={14} className="mr-1.5 text-sky-500 shrink-0" />
            <span className="truncate">Негабарит</span>
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-xs md:text-sm font-semibold mb-2 flex items-center gap-1.5">
          <Icon name="Truck" size={14} className="text-green-500" />
          Транспорт
        </h3>
        <div className="grid grid-cols-1 gap-1.5 md:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onVehicleTypeClick('car', filters.userType === 'client')}
            className="justify-start text-xs h-8 md:h-9"
          >
            <Icon name="Car" size={14} className="mr-1.5 text-green-500 shrink-0" />
            <span className="truncate">Легковой</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onVehicleTypeClick('truck', filters.userType === 'client')}
            className="justify-start text-xs h-8 md:h-9"
          >
            <Icon name="Truck" size={14} className="mr-1.5 text-green-500 shrink-0" />
            <span className="truncate">Грузовой</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onVehicleTypeClick('semi', filters.userType === 'client')}
            className="justify-start text-xs h-8 md:h-9"
          >
            <Icon name="Container" size={14} className="mr-1.5 text-green-500 shrink-0" />
            <span className="truncate">Тягач</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CargoVehicleSelector;
