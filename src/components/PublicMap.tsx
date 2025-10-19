import { Card } from './ui/card';
import { Button } from './ui/button';
import Icon from './ui/icon';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';
import { useTranslation } from 'react-i18next';
import LiveMap from './LiveMap';

interface PublicMapProps {
  onRegister: () => void;
}

const PublicMap = ({ onRegister }: PublicMapProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <header className="border-b border-gray-200/20 dark:border-gray-700/30 sticky top-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl z-50 shadow-lg animate-slide-in-down">
        <div className="container mx-auto px-4 md:px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gray-900 dark:bg-gray-100 rounded-xl flex items-center justify-center">
              <Icon name="Truck" size={18} className="text-white dark:text-gray-900" />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100">{t('appTitle')}</h1>
              <p className="text-[9px] md:text-[10px] text-gray-600 dark:text-gray-400">{t('appSubtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            <ThemeToggle />
            <LanguageSelector />
            <Button onClick={onRegister} className="rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 text-xs px-2 md:px-3 py-2">
            <Icon name="LogIn" size={14} className="md:mr-1.5" />
            <span className="hidden md:inline">{t('login')} / {t('register')}</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 md:px-6 py-4 md:py-8 space-y-4 md:space-y-8">
        <LiveMap isPublic={true} onMarkerClick={() => {
          onRegister();
        }} />

        <Card className="max-w-2xl mx-auto p-8 text-center border border-gray-200/20 dark:border-gray-700/30 shadow-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl animate-scale-in">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon name="Lock" size={40} className="text-primary" />
          </div>
          
          <h3 className="text-2xl font-bold mb-3">
            {t('loginToView')}
          </h3>
          
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Данные о клиентах и перевозчиках видны только зарегистрированным пользователям. 
            Зарегистрируйтесь, чтобы получить доступ к платформе.
          </p>

          <div className="space-y-3 mb-6 text-left bg-muted/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Icon name="Check" size={20} className="text-primary mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Для клиентов</p>
                <p className="text-xs text-muted-foreground">Найдите проверенных перевозчиков с рейтингом</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Icon name="Check" size={20} className="text-primary mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Для перевозчиков</p>
                <p className="text-xs text-muted-foreground">Получайте заявки на доставку в реальном времени</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Icon name="Check" size={20} className="text-primary mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Безопасность</p>
                <p className="text-xs text-muted-foreground">Все данные защищены и доступны только участникам</p>
              </div>
            </div>
          </div>

          <Button onClick={onRegister} size="lg" className="w-full rounded-full">
            <Icon name="UserPlus" size={20} className="mr-2" />
            {t('register')} / {t('login')}
          </Button>

          <p className="text-xs text-muted-foreground mt-6">
            Регистрируясь, вы соглашаетесь с{' '}
            <span className="text-primary font-medium">пользовательским соглашением</span>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default PublicMap;