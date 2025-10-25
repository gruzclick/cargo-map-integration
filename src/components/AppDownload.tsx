import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import Icon from './ui/icon';
import { useToast } from '@/hooks/use-toast';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function AppDownload() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    const android = /android/.test(userAgent);
    
    setIsIOS(ios);
    setIsAndroid(android);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
          toast({
            title: 'Установка начата',
            description: 'Приложение будет установлено на ваше устройство',
          });
        }

        setDeferredPrompt(null);
        setIsInstallable(false);
      } catch (error) {
        console.error('Install error:', error);
      }
    } else {
      if (isAndroid || (!isIOS && !isAndroid)) {
        toast({
          title: 'Установить через браузер',
          description: 'Откройте меню браузера (⋮) и выберите "Установить приложение"',
        });
      }
    }
  };

  const getInstallInstructions = () => {
    if (isIOS) {
      return {
        title: 'Установка на iPhone/iPad',
        steps: [
          'Нажмите кнопку "Поделиться" внизу браузера Safari',
          'Прокрутите вниз и выберите "На экран «Домой»"',
          'Нажмите "Добавить" в правом верхнем углу',
          'Приложение появится на главном экране вашего устройства'
        ]
      };
    } else if (isAndroid) {
      return {
        title: 'Установка на Android',
        steps: [
          'Нажмите кнопку "Скачать приложение" ниже',
          'Подтвердите установку во всплывающем окне',
          'Приложение появится на главном экране вашего устройства',
          'Откройте приложение и пользуйтесь без браузера'
        ]
      };
    } else {
      return {
        title: 'Установка на компьютер',
        steps: [
          'Нажмите кнопку "Скачать приложение" ниже',
          'Подтвердите установку в браузере',
          'Приложение появится в меню приложений',
          'Запускайте ГрузКлик как обычную программу'
        ]
      };
    }
  };

  const instructions = getInstallInstructions();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shrink-0">
          <Icon name="Smartphone" size={20} className="text-white sm:w-6 sm:h-6" />
        </div>
        <div className="min-w-0">
          <div className="text-lg sm:text-xl font-semibold">ГрузКлик</div>
          <div className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
            Установите приложение для быстрого доступа
          </div>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg sm:rounded-xl p-4 sm:p-6">
            <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Преимущества приложения:</h3>
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <Icon name="Zap" size={18} className="text-blue-500 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-sm sm:text-base mb-0.5 sm:mb-1">Быстрый запуск</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Открывается мгновенно с главного экрана</div>
                </div>
              </div>
              <div className="flex gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-purple-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <Icon name="Wifi" size={18} className="text-purple-500 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-sm sm:text-base mb-0.5 sm:mb-1">Работает офлайн</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Доступ к данным без интернета</div>
                </div>
              </div>
              <div className="flex gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-green-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <Icon name="Bell" size={18} className="text-green-500 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-sm sm:text-base mb-0.5 sm:mb-1">Push-уведомления</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Мгновенные оповещения о заказах</div>
                </div>
              </div>
              <div className="flex gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-orange-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <Icon name="HardDrive" size={18} className="text-orange-500 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-sm sm:text-base mb-0.5 sm:mb-1">Экономия памяти</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Занимает менее 5 МБ места</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {!isIOS && (
              <Button 
                onClick={handleInstallClick}
                size="lg"
                className="w-full h-12 sm:h-14 text-base sm:text-lg gap-2 sm:gap-3"
              >
                <Icon name="Download" size={20} className="sm:w-6 sm:h-6" />
                Скачать приложение
              </Button>
            )}
            
            {isIOS && (
              <Button 
                onClick={handleInstallClick}
                size="lg"
                className="w-full h-12 sm:h-14 text-base sm:text-lg gap-2 sm:gap-3 bg-blue-500 hover:bg-blue-600"
              >
                <Icon name="Plus" size={20} className="sm:w-6 sm:h-6" />
                Добавить на главный экран
              </Button>
            )}
            
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 sm:p-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <Icon name="Info" size={18} className="text-blue-500 mt-0.5 shrink-0 sm:w-5 sm:h-5" />
                <div className="min-w-0">
                  <p className="font-medium text-sm sm:text-base text-blue-600 dark:text-blue-400 mb-1.5 sm:mb-2">
                    {instructions.title}
                  </p>
                  <ol className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                    {instructions.steps.map((step, index) => (
                      <li key={index} className="flex gap-2">
                        <span className="font-bold text-blue-500 shrink-0">{index + 1}.</span>
                        <span className="break-words">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>

            {isIOS && (
              <div className="flex flex-col items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <Icon name="Share" size={40} className="text-blue-500 sm:w-12 sm:h-12" />
                <p className="text-center text-xs sm:text-sm text-muted-foreground">
                  Используйте кнопку "Поделиться" в Safari для установки
                </p>
              </div>
            )}
          </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-3 sm:pt-4 border-t">
          <div className="text-center">
            <div className="text-base sm:text-2xl font-bold text-primary mb-0.5 sm:mb-1">iOS & Android</div>
            <div className="text-[10px] sm:text-sm text-muted-foreground">Все платформы</div>
          </div>
          <div className="text-center">
            <div className="text-base sm:text-2xl font-bold text-primary mb-0.5 sm:mb-1">&lt; 5 МБ</div>
            <div className="text-[10px] sm:text-sm text-muted-foreground">Размер приложения</div>
          </div>
          <div className="text-center">
            <div className="text-base sm:text-2xl font-bold text-primary mb-0.5 sm:mb-1">Бесплатно</div>
            <div className="text-[10px] sm:text-sm text-muted-foreground">Навсегда</div>
          </div>
        </div>
      </div>
    </div>
  );
}