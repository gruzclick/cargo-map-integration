import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import ChatNotifications from '@/components/ChatNotifications';
import ThemeToggle from '@/components/ThemeToggle';
import RotatingAdBanner from '@/components/RotatingAdBanner';

interface IndexHeaderProps {
  user: any;
  userStatus: 'cargo' | 'vehicle' | null;
  onProfileClick: () => void;
  onLogout: () => void;
}

const IndexHeader = ({ user, userStatus, onProfileClick, onLogout }: IndexHeaderProps) => {
  return (
    <header className="border-b border-gray-200/20 dark:border-gray-700/30 sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl z-50 shadow-sm animate-slide-in-down">
      <div className="container mx-auto px-2 md:px-3 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-9 h-9 bg-gray-900 dark:bg-gray-100 rounded-xl flex items-center justify-center">
            <Icon name="Truck" size={18} className="text-white dark:text-gray-900" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-gray-900 dark:text-gray-100 hidden md:inline">ГрузКлик</span>
            {userStatus && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                userStatus === 'cargo' 
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                  : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              }`}>
                <Icon 
                  name={userStatus === 'cargo' ? 'Package' : 'Car'} 
                  size={12} 
                />
                <span className="hidden sm:inline">
                  {userStatus === 'cargo' ? 'Груз' : 'Авто'}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1 max-w-md hidden md:block">
          <RotatingAdBanner />
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              const url = window.location.origin;
              const shareText = `🚛 Присоединяйся к грузовой бирже!\n\n✅ Находи грузы и водителей рядом с тобой\n✅ Отслеживай доставки в реальном времени\n✅ Безопасные сделки с рейтингом\n\nОткрой прямо сейчас: ${url}`;
              
              if (navigator.share) {
                navigator.share({
                  title: '🚛 Груз Клик',
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
            className="h-9 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Icon name="Share2" size={14} className="mr-1.5" />
            <span className="text-xs hidden md:inline">Поделиться</span>
          </Button>

          <div className="h-9 flex items-center">
            <ChatNotifications currentUserId={user.user_id || user.phone} />
          </div>
          <div className="h-9 flex items-center">
            <ThemeToggle />
          </div>
          
          {user.phone === '89144679910' && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => window.open('/admin', '_blank')} 
              className="h-9 rounded-lg text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/20"
            >
              <Icon name="Shield" size={14} className="mr-1.5" />
              <span className="text-xs hidden md:inline">Админ</span>
            </Button>
          )}

          <Button variant="ghost" size="sm" onClick={onProfileClick} className="h-9 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
            <Icon name="User" size={14} className="mr-1.5" />
            <span className="text-xs hidden md:inline">Профиль</span>
          </Button>

          <Button variant="ghost" size="sm" onClick={onLogout} className="h-9 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
            <Icon name="LogOut" size={14} className="mr-1.5" />
            <span className="text-xs hidden md:inline">Выйти</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default IndexHeader;