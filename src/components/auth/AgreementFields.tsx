import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface AgreementFieldsProps {
  agreeGeolocation: boolean;
  agreeVerification: boolean;
  useGosuslugi: boolean;
  agreeTerms: boolean;
  onAgreeGeolocationChange: (value: boolean) => void;
  onAgreeVerificationChange: (value: boolean) => void;
  onUseGosuslugirChange: (value: boolean) => void;
  onAgreeTermsChange: (value: boolean) => void;
}

const AgreementFields = ({
  agreeGeolocation,
  agreeVerification,
  useGosuslugi,
  agreeTerms,
  onAgreeGeolocationChange,
  onAgreeVerificationChange,
  onUseGosuslugirChange,
  onAgreeTermsChange
}: AgreementFieldsProps) => {
  return (
    <div className="space-y-2.5 sm:space-y-3">
      <div className="flex items-start space-x-2 p-3 sm:p-4 border-2 border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/10">
        <Checkbox
          id="agree_terms"
          checked={agreeTerms}
          onCheckedChange={(checked) => onAgreeTermsChange(checked as boolean)}
          className="mt-0.5 shrink-0"
        />
        <Label htmlFor="agree_terms" className="text-xs sm:text-sm cursor-pointer leading-relaxed">
          Я согласен с{' '}
          <a 
            href="/terms" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Пользовательским соглашением
          </a>
          {' '}и{' '}
          <a 
            href="/privacy" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Политикой конфиденциальности
          </a>
        </Label>
      </div>

      <div className="flex items-start space-x-2">
        <Checkbox
          id="agree_geolocation"
          checked={agreeGeolocation}
          onCheckedChange={(checked) => onAgreeGeolocationChange(checked as boolean)}
          className="shrink-0 mt-0.5"
        />
        <Label htmlFor="agree_geolocation" className="text-xs sm:text-sm cursor-pointer leading-relaxed">
          Разрешаю использовать мою геолокацию для отображения на карте и поиска ближайших заказов
        </Label>
      </div>

      <div className="flex items-start space-x-2">
        <Checkbox
          id="agree_verification"
          checked={agreeVerification}
          onCheckedChange={(checked) => onAgreeVerificationChange(checked as boolean)}
          className="shrink-0 mt-0.5"
        />
        <Label htmlFor="agree_verification" className="text-xs sm:text-sm cursor-pointer leading-relaxed">
          Согласен на верификацию личности для повышения рейтинга доверия
        </Label>
      </div>

      <div className="flex items-start space-x-2">
        <Checkbox
          id="use_gosuslugi"
          checked={useGosuslugi}
          onCheckedChange={(checked) => onUseGosuslugirChange(checked as boolean)}
          className="shrink-0 mt-0.5"
        />
        <Label htmlFor="use_gosuslugi" className="text-xs sm:text-sm cursor-pointer leading-relaxed flex items-center gap-1.5 sm:gap-2">
          Подключить Госуслуги для быстрой верификации
          <Icon name="ShieldCheck" size={14} className="text-green-600 sm:w-4 sm:h-4" />
        </Label>
      </div>
    </div>
  );
};

export default AgreementFields;