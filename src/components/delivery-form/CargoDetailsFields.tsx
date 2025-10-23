import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CargoDetailsFieldsProps {
  cargoUnit: string;
  cargoQuantity: string;
  weight: string;
  onCargoUnitChange: (value: string) => void;
  onCargoQuantityChange: (value: string) => void;
  onWeightChange: (value: string) => void;
}

const CargoDetailsFields = ({
  cargoUnit,
  cargoQuantity,
  weight,
  onCargoUnitChange,
  onCargoQuantityChange,
  onWeightChange
}: CargoDetailsFieldsProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="cargo_unit">Единицы *</Label>
          <Select value={cargoUnit} onValueChange={onCargoUnitChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="boxes">Коробки</SelectItem>
              <SelectItem value="pallets">Паллеты</SelectItem>
              <SelectItem value="pieces">Штуки</SelectItem>
              <SelectItem value="tons">Тонны</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="cargo_quantity">Количество *</Label>
          <Input
            id="cargo_quantity"
            type="number"
            placeholder="10"
            value={cargoQuantity}
            onChange={(e) => onCargoQuantityChange(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="weight">Вес (кг)</Label>
        <Input
          id="weight"
          type="number"
          step="0.1"
          placeholder="150.5"
          value={weight}
          onChange={(e) => onWeightChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default CargoDetailsFields;
