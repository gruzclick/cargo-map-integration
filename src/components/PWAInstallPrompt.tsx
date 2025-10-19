import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { usePWA } from '@/hooks/usePWA';

const PWAInstallPrompt = () => {
  const { canInstall, isInstalled, isStandalone, promptInstall, requestNotificationPermission } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const hasBeenDismissed = localStorage.getItem('pwa-install-dismissed');
    if (hasBeenDismissed) {
      setDismissed(true);
    }

    if (canInstall && !hasBeenDismissed && !isInstalled) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [canInstall, isInstalled]);

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      setShowPrompt(false);
      await requestNotificationPermission();
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showPrompt || dismissed || isInstalled || isStandalone) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-slide-in-up">
      <Card className="border-2 border-primary shadow-2xl">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon name="Download" size={24} className="text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base mb-1">Установить Груз Клик</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Установите приложение для быстрого доступа и получения уведомлений о новых заказах
              </p>
              <div className="flex gap-2">
                <Button onClick={handleInstall} size="sm" className="flex-1">
                  <Icon name="Download" size={16} className="mr-2" />
                  Установить
                </Button>
                <Button onClick={handleDismiss} variant="outline" size="sm">
                  Позже
                </Button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon name="X" size={18} />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAInstallPrompt;
