import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FormData {
  full_name: string;
  entity_type: string;
  inn: string;
  organization_name: string;
  phone: string;
}

interface BasicInfoFieldsProps {
  formData: FormData;
  onFormDataChange: (data: FormData) => void;
}

const BasicInfoFields = ({ formData, onFormDataChange }: BasicInfoFieldsProps) => {
  return (
    <>
      <div className="space-y-1.5 sm:space-y-2">
        <Label htmlFor="full_name" className="text-xs sm:text-sm">ФИО *</Label>
        <Input
          id="full_name"
          placeholder="Иванов Иван Иванович"
          value={formData.full_name}
          onChange={(e) => onFormDataChange({ ...formData, full_name: e.target.value })}
          required
          className="h-10 sm:h-11 text-sm sm:text-base"
        />
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <Label htmlFor="entity_type" className="text-xs sm:text-sm">Тип лица *</Label>
        <Select value={formData.entity_type} onValueChange={(val) => onFormDataChange({ ...formData, entity_type: val })}>
          <SelectTrigger className="h-10 sm:h-11 text-sm sm:text-base">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="individual" className="text-xs sm:text-sm">Физическое лицо</SelectItem>
            <SelectItem value="self_employed" className="text-xs sm:text-sm">Самозанятый</SelectItem>
            <SelectItem value="individual_entrepreneur" className="text-xs sm:text-sm">ИП</SelectItem>
            <SelectItem value="legal" className="text-xs sm:text-sm">Юридическое лицо</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(formData.entity_type === 'individual_entrepreneur' || formData.entity_type === 'legal') && (
        <>
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="inn" className="text-xs sm:text-sm">ИНН *</Label>
            <Input
              id="inn"
              placeholder={formData.entity_type === 'legal' ? '10 цифр' : '12 цифр'}
              value={formData.inn}
              onChange={(e) => onFormDataChange({ ...formData, inn: e.target.value })}
              required
              className="h-10 sm:h-11 text-sm sm:text-base"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="organization_name" className="text-xs sm:text-sm">Название организации *</Label>
            <Input
              id="organization_name"
              placeholder="ООО «Транспорт»"
              value={formData.organization_name}
              onChange={(e) => onFormDataChange({ ...formData, organization_name: e.target.value })}
              required
              className="h-10 sm:h-11 text-sm sm:text-base"
            />
          </div>
        </>
      )}

      <div className="space-y-1.5 sm:space-y-2">
        <Label htmlFor="phone" className="text-xs sm:text-sm">Телефон *</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+7 (999) 123-45-67"
          value={formData.phone}
          onChange={(e) => onFormDataChange({ ...formData, phone: e.target.value })}
          required
          className="h-10 sm:h-11 text-sm sm:text-base"
        />
      </div>
    </>
  );
};

export default BasicInfoFields;