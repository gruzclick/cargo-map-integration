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
        <div className="container mx-auto px-3 md:px-6 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 md:w-9 md:h-9 bg-gray-900 dark:bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                <Icon name="Truck" size={16} className="text-white dark:text-gray-900 md:w-[18px] md:h-[18px]" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm md:text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100 truncate">{t('appTitle')}</h1>
                <p className="text-[9px] md:text-[10px] text-gray-600 dark:text-gray-400 hidden sm:block">{t('appSubtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 md:gap-2 shrink-0">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  const url = window.location.origin;
                  const shareText = `🚛 Присоединяйся к грузовой бирже!\n\n✅ Находи грузы и водителей рядом с тобой\n✅ Отслеживай доставки в реальном времени\n✅ Безопасные сделки с рейтингом\n\nОткрой прямо сейчас: ${url}`;
                  
                  if (navigator.share) {
                    navigator.share({
                      title: '🚛 Грузовая биржа - Логистика',
                      text: shareText,
                      url: url
                    }).catch(() => {
                      navigator.clipboard.writeText(url);
                      alert('✅ Ссылка скопирована! Отправьте её своим клиентам и партнёрам');
                    });
                  } else {
                    navigator.clipboard.writeText(url);
                    alert('✅ Ссылка скопирована в буфер обмена!\n\nОтправьте её в WhatsApp, Telegram или Email своим клиентам');
                  }
                }}
                className="rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 h-8 md:h-auto px-2 md:px-3"
              >
                <Icon name="Share2" size={14} className="md:mr-1.5" />
                <span className="text-xs hidden md:inline">Поделиться</span>
              </Button>
              <ThemeToggle />
              <LanguageSelector />
              <Button onClick={onRegister} className="rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 text-[10px] md:text-xs px-2 md:px-3 py-1.5 md:py-2 h-8 md:h-auto">
                <Icon name="LogIn" size={12} className="md:mr-1.5 md:w-[14px] md:h-[14px]" />
                <span className="hidden sm:inline whitespace-nowrap">{t('login')} / {t('register')}</span>
                <span className="sm:hidden">Вход</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 md:px-6 py-4 md:py-8 space-y-4 md:space-y-8">
        <LiveMap isPublic={true} onMarkerClick={() => {
          onRegister();
        }} />
      </div>
    </div>
  );
};

export default PublicMap;