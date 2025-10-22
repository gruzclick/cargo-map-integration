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
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      toast({
        title: 'Установка начата',
        description: 'Приложение будет установлено на ваше устройство',
      });
    }

    setDeferredPrompt(null);
    setIsInstallable(false);
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Icon name="Smartphone" size={24} className="text-white" />
            </div>
            <div>
              <div className="text-xl">ГрузКлик</div>
              <div className="text-sm font-normal text-muted-foreground mt-1">
                Установите приложение для быстрого доступа
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-4">Преимущества приложения:</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <Icon name="Zap" size={20} className="text-blue-500" />
                </div>
                <div>
                  <div className="font-medium mb-1">Быстрый запуск</div>
                  <div className="text-sm text-muted-foreground">Открывается мгновенно с главного экрана</div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <Icon name="Wifi" size={20} className="text-purple-500" />
                </div>
                <div>
                  <div className="font-medium mb-1">Работает офлайн</div>
                  <div className="text-sm text-muted-foreground">Доступ к данным без интернета</div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <Icon name="Bell" size={20} className="text-green-500" />
                </div>
                <div>
                  <div className="font-medium mb-1">Push-уведомления</div>
                  <div className="text-sm text-muted-foreground">Мгновенные оповещения о заказах</div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <Icon name="HardDrive" size={20} className="text-orange-500" />
                </div>
                <div>
                  <div className="font-medium mb-1">Экономия памяти</div>
                  <div className="text-sm text-muted-foreground">Занимает менее 5 МБ места</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {isInstallable && !isIOS && (
              <>
                <Button 
                  onClick={handleInstallClick}
                  size="lg"
                  className="w-full h-14 text-lg gap-3"
                >
                  <Icon name="Download" size={24} />
                  Скачать приложение
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  Нажмите кнопку выше, чтобы установить приложение на ваше устройство
                </p>
              </>
            )}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Icon name="Info" size={20} className="text-blue-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-blue-600 dark:text-blue-400 mb-2">
                      {instructions.title}
                    </p>
                    <ol className="space-y-2 text-sm text-muted-foreground">
                      {instructions.steps.map((step, index) => (
                        <li key={index} className="flex gap-2">
                          <span className="font-bold text-blue-500">{index + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>

            {isIOS && (
              <div className="flex flex-col items-center gap-4 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <Icon name="Share" size={48} className="text-blue-500" />
                <p className="text-center text-sm text-muted-foreground">
                  Используйте кнопку "Поделиться" в Safari для установки
                </p>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">iOS & Android</div>
              <div className="text-sm text-muted-foreground">Все платформы</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">&lt; 5 МБ</div>
              <div className="text-sm text-muted-foreground">Размер приложения</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">Бесплатно</div>
              <div className="text-sm text-muted-foreground">Навсегда</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}