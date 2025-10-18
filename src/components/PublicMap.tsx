import { Card } from './ui/card';
import { Button } from './ui/button';
import Icon from './ui/icon';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from 'react-i18next';
import LiveMap from './LiveMap';

interface PublicMapProps {
  onRegister: () => void;
}

const PublicMap = ({ onRegister }: PublicMapProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 sticky top-0 bg-white/90 backdrop-blur-xl z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Icon name="Truck" size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t('appTitle')}</h1>
              <p className="text-xs text-muted-foreground">{t('appSubtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSelector />
            <Button onClick={onRegister} className="rounded-full">
            <Icon name="LogIn" size={16} className="mr-2" />
            {t('login')} / {t('register')}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 space-y-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            {t('appTitle')}
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            {t('accessDenied')}
          </p>
        </div>

        <LiveMap isPublic={true} onMarkerClick={() => {
          alert(t('loginToView'));
        }} />

        <Card className="max-w-2xl mx-auto p-8 text-center border-0 shadow-2xl">
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