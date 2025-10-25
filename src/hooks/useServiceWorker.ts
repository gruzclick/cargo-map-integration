import { useEffect, useState } from 'react';
import { useToast } from './use-toast';

export function useServiceWorker() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    const checkForUpdates = () => {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          registration.update();
        }
      });
    };

    checkForUpdates();
    const interval = setInterval(checkForUpdates, 60000);

    const handleControllerChange = () => {
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    navigator.serviceWorker.ready.then((registration) => {
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setWaitingWorker(newWorker);
              setUpdateAvailable(true);
              
              toast({
                title: 'Доступно обновление',
                description: 'Новая версия приложения готова к установке',
                action: {
                  label: 'Обновить',
                  onClick: () => applyUpdate()
                }
              });
            }
          });
        }
      });
    });

    return () => {
      clearInterval(interval);
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, [toast]);

  const applyUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  return { updateAvailable, applyUpdate };
}
