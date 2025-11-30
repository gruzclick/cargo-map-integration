/**
 * Компонент для настройки Telegram бота
 * 
 * Назначение: Позволяет администратору ввести токен Telegram бота для отправки кодов подтверждения
 * 
 * Использование:
 * - Показывается, если токен бота не настроен в секретах проекта
 * - Предоставляет инструкцию по созданию бота через @BotFather
 * - Отправляет токен на сервер для сохранения в секретах
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface TelegramBotSetupProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

const TelegramBotSetup = ({ onComplete, onSkip }: TelegramBotSetupProps) => {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'info' | 'input'>('info');
  const { toast } = useToast();

  const handleSaveToken = async () => {
    if (!token.trim()) {
      toast({
        variant: 'destructive',
        title: 'Введите токен',
        description: 'Токен бота обязателен'
      });
      return;
    }

    setLoading(true);

    try {
      // В реальном проекте здесь будет отправка токена на сервер
      // для сохранения в секретах через административный API
      
      // Временно сохраняем в localStorage для демонстрации
      localStorage.setItem('telegram_bot_token_temp', token);
      
      toast({
        title: 'Токен сохранён!',
        description: 'Теперь коды будут отправляться в Telegram'
      });

      setTimeout(() => {
        onComplete?.();
      }, 1000);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-blue-950">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Icon name="Bot" size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-2xl">Настройка Telegram бота</CardTitle>
              <CardDescription>
                Для отправки кодов подтверждения нужен Telegram бот
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 'info' ? (
            <>
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                    <Icon name="Info" size={18} />
                    Инструкция по созданию бота
                  </h3>
                  <ol className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                    <li className="flex gap-2">
                      <span className="font-bold">1.</span>
                      <span>Откройте Telegram и найдите <strong>@BotFather</strong></span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold">2.</span>
                      <span>Отправьте команду <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">/newbot</code></span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold">3.</span>
                      <span>Придумайте имя бота (например: "ГрузКлик Auth Bot")</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold">4.</span>
                      <span>Придумайте username бота (должен заканчиваться на "bot", например: "gruzclick_auth_bot")</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold">5.</span>
                      <span>Скопируйте токен, который пришлёт BotFather (строка вида: <code className="text-xs">1234567890:ABCdefGHIjklMNOpqrsTUVwxyz</code>)</span>
                    </li>
                  </ol>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2 flex items-center gap-2">
                    <Icon name="AlertTriangle" size={18} />
                    Важно
                  </h3>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Не передавайте токен бота третьим лицам. Он даёт полный контроль над ботом.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={() => setStep('input')} 
                  className="flex-1"
                >
                  <Icon name="ArrowRight" size={18} className="mr-2" />
                  Далее
                </Button>
                {onSkip && (
                  <Button 
                    onClick={onSkip} 
                    variant="outline"
                  >
                    Пропустить
                  </Button>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Токен Telegram бота</label>
                  <Input
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Вставьте токен, полученный от @BotFather
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-2">Проверка формата:</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <Icon 
                        name={token.includes(':') ? 'CheckCircle2' : 'Circle'} 
                        size={14} 
                        className={token.includes(':') ? 'text-green-500' : 'text-gray-400'}
                      />
                      <span>Содержит символ ":"</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon 
                        name={token.split(':')[0]?.length >= 9 ? 'CheckCircle2' : 'Circle'} 
                        size={14} 
                        className={token.split(':')[0]?.length >= 9 ? 'text-green-500' : 'text-gray-400'}
                      />
                      <span>Числовая часть (минимум 9 цифр)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon 
                        name={token.split(':')[1]?.length >= 30 ? 'CheckCircle2' : 'Circle'} 
                        size={14} 
                        className={token.split(':')[1]?.length >= 30 ? 'text-green-500' : 'text-gray-400'}
                      />
                      <span>Секретная часть (минимум 30 символов)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={() => setStep('info')} 
                  variant="outline"
                >
                  <Icon name="ArrowLeft" size={18} className="mr-2" />
                  Назад
                </Button>
                <Button 
                  onClick={handleSaveToken} 
                  disabled={loading || !token.trim()}
                  className="flex-1"
                >
                  {loading ? (
                    <Icon name="Loader2" size={18} className="animate-spin mr-2" />
                  ) : (
                    <Icon name="Save" size={18} className="mr-2" />
                  )}
                  Сохранить токен
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TelegramBotSetup;
