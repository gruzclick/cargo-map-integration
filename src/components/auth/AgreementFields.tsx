import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface AgreementFieldsProps {
  agreeGeolocation: boolean;
  agreeVerification: boolean;
  useGosuslugi: boolean;
  onAgreeGeolocationChange: (value: boolean) => void;
  onAgreeVerificationChange: (value: boolean) => void;
  onUseGosuslugirChange: (value: boolean) => void;
  onShowTerms: () => void;
}

const AgreementFields = ({
  agreeGeolocation,
  agreeVerification,
  useGosuslugi,
  onAgreeGeolocationChange,
  onAgreeVerificationChange,
  onUseGosuslugirChange,
  onShowTerms
}: AgreementFieldsProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-start space-x-2">
        <Checkbox
          id="agree_geolocation"
          checked={agreeGeolocation}
          onCheckedChange={(checked) => onAgreeGeolocationChange(checked as boolean)}
        />
        <Label htmlFor="agree_geolocation" className="text-sm cursor-pointer leading-relaxed">
          Разрешаю использовать мою геолокацию для отображения на карте и поиска ближайших заказов
        </Label>
      </div>

      <div className="flex items-start space-x-2">
        <Checkbox
          id="agree_verification"
          checked={agreeVerification}
          onCheckedChange={(checked) => onAgreeVerificationChange(checked as boolean)}
        />
        <Label htmlFor="agree_verification" className="text-sm cursor-pointer leading-relaxed">
          Согласен на верификацию личности для повышения рейтинга доверия
        </Label>
      </div>

      <div className="flex items-start space-x-2">
        <Checkbox
          id="use_gosuslugi"
          checked={useGosuslugi}
          onCheckedChange={(checked) => onUseGosuslugirChange(checked as boolean)}
        />
        <Label htmlFor="use_gosuslugi" className="text-sm cursor-pointer leading-relaxed flex items-center gap-2">
          Подключить Госуслуги для быстрой верификации
          <Icon name="ShieldCheck" size={16} className="text-green-600" />
        </Label>
      </div>

      <Button
        type="button"
        variant="link"
        onClick={onShowTerms}
        className="text-sm px-0 h-auto"
      >
        Прочитать пользовательское соглашение
      </Button>
    </div>
  );
};

export default AgreementFields;
