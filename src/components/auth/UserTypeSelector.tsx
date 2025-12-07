import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Icon from '@/components/ui/icon';

interface UserTypeSelectorProps {
  userType: 'client' | 'carrier' | 'logist';
  onUserTypeChange: (value: 'client' | 'carrier' | 'logist') => void;
}

const UserTypeSelector = ({ userType, onUserTypeChange }: UserTypeSelectorProps) => {
  return (
    <div className="space-y-3 pb-4 border-b">
      <Label className="text-sm font-semibold">Тип пользователя</Label>
      <RadioGroup value={userType} onValueChange={(val: any) => onUserTypeChange(val)} className="grid grid-cols-3 gap-3">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="client" id="client" />
          <Label htmlFor="client" className="cursor-pointer flex items-center gap-1.5 text-sm">
            <Icon name="Package" size={16} />
            Клиент
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="carrier" id="carrier" />
          <Label htmlFor="carrier" className="cursor-pointer flex items-center gap-1.5 text-sm">
            <Icon name="Truck" size={16} />
            Перевозчик
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="logist" id="logist" />
          <Label htmlFor="logist" className="cursor-pointer flex items-center gap-1.5 text-sm">
            <Icon name="ClipboardList" size={16} />
            Логист
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default UserTypeSelector;