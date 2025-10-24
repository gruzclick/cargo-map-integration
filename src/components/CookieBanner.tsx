import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

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
    <div className="fixed bottom-0 left-0 right-0 z-50 p-2 sm:p-4 animate-slide-in-up">
      <Card className="max-w-2xl mx-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl border-2">
        <div className="p-3 sm:p-5">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Icon name="Cookie" size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            
            <div className="flex-1 space-y-2">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100">
                Файлы cookie
              </h3>
              
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Используем cookie для работы сайта.{' '}
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-blue-600 dark:text-blue-400 underline hover:no-underline font-medium"
                >
                  {showDetails ? 'Скрыть' : 'Подробнее'}
                </button>
              </p>

              {showDetails && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 sm:p-3 text-xs text-gray-600 dark:text-gray-400 space-y-2">
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>Необходимые:</strong> авторизация, безопасность</li>
                    <li><strong>Функциональные:</strong> язык, валюта, настройки</li>
                    <li><strong>Аналитические:</strong> анализ для улучшения UX</li>
                  </ul>
                  <p className="pt-1">
                    <a href="/privacy" className="text-blue-600 dark:text-blue-400 underline hover:no-underline">
                      Политика конфиденциальности
                    </a>
                    {' • '}
                    <a href="/terms" className="text-blue-600 dark:text-blue-400 underline hover:no-underline">
                      Пользовательское соглашение
                    </a>
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500">
                    Согласно ФЗ-152 и GDPR
                  </p>
                </div>
              )}

              <div className="flex flex-col xs:flex-row gap-2 pt-1">
                <Button 
                  onClick={acceptCookies}
                  className="flex-1 xs:flex-initial text-xs sm:text-sm h-8 sm:h-9"
                  size="sm"
                >
                  <Icon name="Check" size={14} className="mr-1" />
                  Принять все
                </Button>
                
                <Button 
                  onClick={declineCookies}
                  variant="outline"
                  className="flex-1 xs:flex-initial text-xs sm:text-sm h-8 sm:h-9"
                  size="sm"
                >
                  Только необходимые
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CookieBanner;
