import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';

const languages = [
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'uz', name: 'O\'zbekcha', flag: '🇺🇿' },
  { code: 'kk', name: 'Қазақша', flag: '🇰🇿' },
  { code: 'ky', name: 'Кыргызча', flag: '🇰🇬' },
  { code: 'tg', name: 'Тоҷикӣ', flag: '🇹🇯' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
];

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
    localStorage.setItem('app_language', value);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language);

  return (
    <Select value={i18n.language} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[180px] bg-white/50 backdrop-blur-sm border-accent/20">
        <div className="flex items-center gap-2">
          <Icon name="Languages" size={18} className="text-accent" />
          <SelectValue>
            <span className="flex items-center gap-2">
              <span>{currentLanguage?.flag}</span>
              <span>{currentLanguage?.name}</span>
            </span>
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <div className="flex items-center gap-2">
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
