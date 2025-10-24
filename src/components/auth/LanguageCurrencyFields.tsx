import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LanguageCurrencyFieldsProps {
  language: string;
  currency: string;
  onLanguageChange: (value: string) => void;
  onCurrencyChange: (value: string) => void;
}

const LanguageCurrencyFields = ({
  language,
  currency,
  onLanguageChange,
  onCurrencyChange
}: LanguageCurrencyFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="language">Язык *</Label>
        <Select value={language} onValueChange={onLanguageChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ru">🇷🇺 Русский</SelectItem>
            <SelectItem value="en">🇬🇧 English</SelectItem>
            <SelectItem value="es">🇪🇸 Español</SelectItem>
            <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
            <SelectItem value="fr">🇫🇷 Français</SelectItem>
            <SelectItem value="zh">🇨🇳 中文</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="currency">Валюта *</Label>
        <Select value={currency} onValueChange={onCurrencyChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="RUB">₽ Российский рубль (RUB)</SelectItem>
            <SelectItem value="USD">$ Доллар США (USD)</SelectItem>
            <SelectItem value="EUR">€ Евро (EUR)</SelectItem>
            <SelectItem value="GBP">£ Фунт стерлингов (GBP)</SelectItem>
            <SelectItem value="CNY">¥ Китайский юань (CNY)</SelectItem>
            <SelectItem value="KZT">₸ Казахстанский тенге (KZT)</SelectItem>
            <SelectItem value="BYN">Br Белорусский рубль (BYN)</SelectItem>
            <SelectItem value="UAH">₴ Украинская гривна (UAH)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default LanguageCurrencyFields;
