import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PassportData {
  passport_series: string;
  passport_number: string;
  passport_date: string;
  passport_issued_by: string;
}

interface PassportFieldsProps {
  passportData: PassportData;
  onPassportDataChange: (data: PassportData) => void;
}

const PassportFields = ({ passportData, onPassportDataChange }: PassportFieldsProps) => {
  return (
    <div className="space-y-4 pb-4 border-b">
      <Label className="text-sm font-semibold">Паспортные данные (для верификации)</Label>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="passport_series">Серия</Label>
          <Input
            id="passport_series"
            placeholder="1234"
            maxLength={4}
            value={passportData.passport_series}
            onChange={(e) => onPassportDataChange({ ...passportData, passport_series: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="passport_number">Номер</Label>
          <Input
            id="passport_number"
            placeholder="567890"
            maxLength={6}
            value={passportData.passport_number}
            onChange={(e) => onPassportDataChange({ ...passportData, passport_number: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="passport_date">Дата выдачи</Label>
        <Input
          id="passport_date"
          type="date"
          value={passportData.passport_date}
          onChange={(e) => onPassportDataChange({ ...passportData, passport_date: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="passport_issued_by">Кем выдан</Label>
        <Input
          id="passport_issued_by"
          placeholder="ГУ МВД России по г. Москве"
          value={passportData.passport_issued_by}
          onChange={(e) => onPassportDataChange({ ...passportData, passport_issued_by: e.target.value })}
        />
      </div>
    </div>
  );
};

export default PassportFields;
