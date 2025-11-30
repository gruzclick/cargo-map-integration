/**
 * Страница настройки Telegram бота
 * 
 * Назначение: Предоставляет интерфейс для администратора для настройки Telegram бота
 * 
 * Доступ: /setup/telegram-bot
 */

import TelegramBotSetup from '@/components/TelegramBotSetup';
import { useNavigate } from 'react-router-dom';

const TelegramBotSetupPage = () => {
  const navigate = useNavigate();

  return (
    <TelegramBotSetup 
      onComplete={() => navigate('/')}
      onSkip={() => navigate('/')}
    />
  );
};

export default TelegramBotSetupPage;
