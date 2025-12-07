/**
 * Компонент выбора метода авторизации
 * 
 * Назначение: Начальный экран, где пользователь выбирает способ входа/регистрации
 * 
 * Функциональность:
 * - Две кнопки: Telegram вход или Email/Пароль
 * - Минималистичный дизайн с брендингом приложения
 * - Адаптивная вёрстка для мобильных и десктоп устройств
 * 
 * Используется в: Auth.tsx как первый шаг авторизации
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface AuthMethodSelectorProps {
  onSelectMethod: (method: 'email' | 'telegram' | 'telegram_new') => void;
}

const AuthMethodSelector = ({ onSelectMethod }: AuthMethodSelectorProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-blue-950">
      <Card className="w-full max-w-md shadow-2xl rounded-2xl">
        <CardHeader>
          <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icon name="Truck" size={32} className="text-accent-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold text-center">
            ГрузКлик
          </CardTitle>
          <CardDescription className="text-center">
            Выберите способ входа
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={() => onSelectMethod('telegram_new')}
            className="w-full h-14 text-lg bg-[#0088cc] hover:bg-[#006699]"
            variant="default"
          >
            <Icon name="MessageCircle" size={24} className="mr-3" />
            Войти через Telegram
          </Button>
          <Button
            onClick={() => onSelectMethod('email')}
            className="w-full h-14 text-lg"
            variant="outline"
          >
            <Icon name="Mail" size={24} className="mr-3" />
            Email / Пароль
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthMethodSelector;