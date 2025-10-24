import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const cookieConsent = localStorage.getItem('cookie_consent');
    if (!cookieConsent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    setShowBanner(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookie_consent', 'declined');
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-in-up">
      <Card className="max-w-4xl mx-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl border-2">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Icon name="Cookie" size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            
            <div className="flex-1 space-y-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Мы используем файлы cookie
              </h3>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Этот сайт использует файлы cookie для обеспечения основных функций (авторизация, сохранение настроек), 
                улучшения работы сервиса и анализа трафика. Продолжая использовать сайт, вы соглашаетесь с использованием cookie 
                в соответствии с нашей{' '}
                <a href="/privacy" className="text-blue-600 dark:text-blue-400 underline hover:no-underline">
                  Политикой конфиденциальности
                </a>
                {' '}и{' '}
                <a href="/terms" className="text-blue-600 dark:text-blue-400 underline hover:no-underline">
                  Пользовательским соглашением
                </a>.
              </p>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-xs text-gray-600 dark:text-gray-400">
                <p className="font-semibold mb-1">Мы используем следующие типы cookie:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Необходимые:</strong> авторизация, безопасность сессий (обязательные)</li>
                  <li><strong>Функциональные:</strong> язык интерфейса, валюта, размер текста</li>
                  <li><strong>Аналитические:</strong> анализ использования сайта для улучшения UX</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button 
                  onClick={acceptCookies}
                  className="flex-1 sm:flex-initial"
                  size="lg"
                >
                  <Icon name="Check" size={18} className="mr-2" />
                  Принять все
                </Button>
                
                <Button 
                  onClick={declineCookies}
                  variant="outline"
                  className="flex-1 sm:flex-initial"
                  size="lg"
                >
                  <Icon name="X" size={18} className="mr-2" />
                  Только необходимые
                </Button>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-500">
                Согласно ФЗ-152 "О персональных данных" и GDPR (Общему регламенту по защите данных ЕС)
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CookieBanner;
