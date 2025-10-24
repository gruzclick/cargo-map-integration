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
      <div className="space-y-2">
        <Label htmlFor="full_name">ФИО *</Label>
        <Input
          id="full_name"
          placeholder="Иванов Иван Иванович"
          value={formData.full_name}
          onChange={(e) => onFormDataChange({ ...formData, full_name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="entity_type">Тип лица *</Label>
        <Select value={formData.entity_type} onValueChange={(val) => onFormDataChange({ ...formData, entity_type: val })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="individual">Физическое лицо</SelectItem>
            <SelectItem value="self_employed">Самозанятый</SelectItem>
            <SelectItem value="individual_entrepreneur">Индивидуальный предприниматель (ИП)</SelectItem>
            <SelectItem value="legal">Юридическое лицо</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(formData.entity_type === 'individual_entrepreneur' || formData.entity_type === 'legal') && (
        <>
          <div className="space-y-2">
            <Label htmlFor="inn">ИНН *</Label>
            <Input
              id="inn"
              placeholder={formData.entity_type === 'legal' ? '10 цифр' : '12 цифр'}
              value={formData.inn}
              onChange={(e) => onFormDataChange({ ...formData, inn: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization_name">Название организации *</Label>
            <Input
              id="organization_name"
              placeholder="ООО «Транспорт»"
              value={formData.organization_name}
              onChange={(e) => onFormDataChange({ ...formData, organization_name: e.target.value })}
              required
            />
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="phone">Телефон *</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+7 (999) 123-45-67"
          value={formData.phone}
          onChange={(e) => onFormDataChange({ ...formData, phone: e.target.value })}
          required
        />
      </div>
    </>
  );
};

export default BasicInfoFields;
