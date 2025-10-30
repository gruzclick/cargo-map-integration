import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { secureLocalStorage } from '@/utils/security';

export const TelegramSettings = () => {
  const [telegramChatId, setTelegramChatId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const saveTelegramId = async () => {
    if (!telegramChatId || telegramChatId.length < 5) {
      setStatus('error');
      setStatusMessage('Введите корректный Telegram Chat ID');
      return;
    }

    setIsSaving(true);
    setStatus('idle');

    try {
      const token = secureLocalStorage.get('admin_token');
      const response = await fetch('https://functions.poehali.dev/f06efb37-9437-4df8-8032-f2ba53b2e2d6', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || ''
        },
        body: JSON.stringify({
          action: 'update_telegram_chat_id',
          telegram_chat_id: telegramChatId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка сохранения');
      }

      setStatus('success');
      setStatusMessage('Telegram успешно привязан к аккаунту!');
    } catch (error: any) {
      setStatus('error');
      setStatusMessage(error.message || 'Ошибка сохранения');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
          <Icon name="Send" size={24} />
          Настройки Telegram
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Привяжите Telegram для получения кодов восстановления пароля
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <Icon name="Info" size={16} className="text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-800 dark:text-blue-200 ml-2">
            <strong>Как узнать свой Chat ID:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
              <li>Откройте Telegram и найдите бота <strong>@userinfobot</strong></li>
              <li>Нажмите <strong>Start</strong> или отправьте любое сообщение</li>
              <li>Бот отправит ваш Chat ID (например: 123456789)</li>
              <li>Скопируйте это число и вставьте в поле ниже</li>
            </ol>
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="telegram-chat-id" className="text-gray-900 dark:text-gray-100">
              Telegram Chat ID
            </Label>
            <Input
              id="telegram-chat-id"
              type="text"
              placeholder="123456789"
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value)}
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Используйте бота @userinfobot для получения Chat ID
            </p>
          </div>
        </div>

        {status === 'success' && (
          <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <Icon name="CheckCircle" size={16} className="text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200 ml-2">
              {statusMessage}
            </AlertDescription>
          </Alert>
        )}

        {status === 'error' && (
          <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <Icon name="XCircle" size={16} className="text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-800 dark:text-red-200 ml-2">
              {statusMessage}
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={saveTelegramId}
          disabled={isSaving}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <Icon name={isSaving ? 'Loader2' : 'Save'} size={16} className={`mr-2 ${isSaving ? 'animate-spin' : ''}`} />
          {isSaving ? 'Сохранение...' : 'Сохранить Chat ID'}
        </Button>

        <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <Icon name="AlertTriangle" size={16} className="text-yellow-600 dark:text-yellow-400" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200 ml-2">
            <strong>Важно:</strong> Убедитесь, что:
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>Вы начали диалог с ботом проекта (отправили /start)</li>
              <li>Chat ID скопирован правильно (только цифры)</li>
              <li>Секрет TELEGRAM_BOT_TOKEN заполнен в настройках проекта</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
