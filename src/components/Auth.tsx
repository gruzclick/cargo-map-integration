/**
 * Главный компонент авторизации через Telegram
 * 
 * Назначение: Единая точка входа через Telegram с автозаполнением данных
 * 
 * Функциональность:
 * - Вход через Telegram с deep link
 * - Автозаполнение ФИО из Telegram профиля
 * - Форма регистрации для новых пользователей
 * - Автоматический вход для существующих
 */

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import TelegramLoginButton from './TelegramLoginButton';
import TelegramRegistrationForm from './TelegramRegistrationForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { secureLocalStorage } from '@/utils/security';

interface AuthProps {
  onSuccess: (userData: any) => void;
}

const Auth = ({ onSuccess }: AuthProps) => {
  const [showRegistration, setShowRegistration] = useState(false);
  const [telegramData, setTelegramData] = useState<any>(null);
  const { toast } = useToast();

  const handleTelegramSuccess = (userData: any, tgData: any) => {
    // Пользователь существует - сохраняем и входим
    secureLocalStorage.set('auth_token', 'telegram_' + userData.user_id);
    secureLocalStorage.set('user_data', JSON.stringify(userData));
    
    toast({
      title: 'Вход выполнен!',
      description: `Добро пожаловать, ${userData.full_name}!`
    });
    
    onSuccess(userData);
  };

  const handlePendingRegistration = (tgData: any) => {
    // Новый пользователь - показываем форму регистрации
    setTelegramData(tgData);
    setShowRegistration(true);
  };

  const handleRegistrationComplete = (userData: any) => {
    // Регистрация завершена
    secureLocalStorage.set('auth_token', 'telegram_' + userData.user_id);
    secureLocalStorage.set('user_data', JSON.stringify(userData));
    
    toast({
      title: 'Регистрация завершена!',
      description: 'Добро пожаловать в GruzClick!'
    });
    
    onSuccess(userData);
  };

  if (showRegistration && telegramData) {
    return (
      <TelegramRegistrationForm
        telegramData={telegramData}
        onSuccess={handleRegistrationComplete}
        onBack={() => setShowRegistration(false)}
      />
    );
  }

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
            Войдите через Telegram для продолжения
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TelegramLoginButton 
            onSuccess={handleTelegramSuccess}
            onPendingRegistration={handlePendingRegistration}
          />
          
          <div className="text-center space-y-2 pt-4">
            <p className="text-sm text-muted-foreground">
              При входе вы соглашаетесь с{' '}
              <a href="/terms" target="_blank" className="text-primary hover:underline">
                Условиями использования
              </a>
              {' '}и{' '}
              <a href="/privacy" target="_blank" className="text-primary hover:underline">
                Политикой конфиденциальности
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
