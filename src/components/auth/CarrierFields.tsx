import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CarrierFieldsProps {
  vehicleType: string;
  capacity: string;
  onVehicleTypeChange: (value: string) => void;
  onCapacityChange: (value: string) => void;
}

const CarrierFields = ({
  vehicleType,
  capacity,
  onVehicleTypeChange,
  onCapacityChange
}: CarrierFieldsProps) => {
  return (
    <div className="space-y-4 pb-4 border-b">
      <Label className="text-sm font-semibold">Данные перевозчика</Label>

      <div className="space-y-2">
        <Label htmlFor="vehicle_type">Тип транспорта *</Label>
        <Select value={vehicleType} onValueChange={onVehicleTypeChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="car_small">Легковой автомобиль</SelectItem>
            <SelectItem value="van">Фургон</SelectItem>
            <SelectItem value="truck_small">Грузовик малый (до 3 тонн)</SelectItem>
            <SelectItem value="truck_medium">Грузовик средний (до 10 тонн)</SelectItem>
            <SelectItem value="truck_large">Грузовик крупный (более 10 тонн)</SelectItem>
            <SelectItem value="trailer">Полуприцеп</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="capacity">Грузоподъемность (тонн) *</Label>
        <Input
          id="capacity"
          type="number"
          step="0.1"
          placeholder="5.0"
          value={capacity}
          onChange={(e) => onCapacityChange(e.target.value)}
          required
        />
      </div>
    </div>
  );
};

export default CarrierFields;
