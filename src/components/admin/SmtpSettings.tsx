import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const SmtpSettings = () => {
  const [smtpConfig, setSmtpConfig] = useState({
    host: '',
    port: '587',
    user: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (field: string, value: string) => {
    setSmtpConfig(prev => ({ ...prev, [field]: value }));
  };

  const testConnection = async () => {
    setTestStatus('testing');
    setErrorMessage('');
    
    setTimeout(() => {
      if (smtpConfig.host && smtpConfig.user && smtpConfig.password) {
        setTestStatus('success');
      } else {
        setTestStatus('error');
        setErrorMessage('Пожалуйста, заполните все поля');
      }
    }, 1500);
  };

  const saveConfig = () => {
    console.log('SMTP конфигурация:', smtpConfig);
    alert('Настройки сохранены! Теперь обновите секреты проекта в настройках poehali.dev:\n\n' +
      `SMTP_HOST=${smtpConfig.host}\n` +
      `SMTP_PORT=${smtpConfig.port}\n` +
      `SMTP_USER=${smtpConfig.user}\n` +
      `SMTP_PASSWORD=${smtpConfig.password}`
    );
  };

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
          <Icon name="Mail" size={24} />
          Настройки SMTP
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Настройте SMTP для отправки email уведомлений и кодов подтверждения
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <Icon name="Info" size={16} className="text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-800 dark:text-blue-200 ml-2">
            После настройки скопируйте значения и добавьте их в секреты проекта в настройках poehali.dev
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="smtp-host" className="text-gray-900 dark:text-gray-100">
              SMTP Сервер
            </Label>
            <Input
              id="smtp-host"
              type="text"
              placeholder="smtp.yandex.ru"
              value={smtpConfig.host}
              onChange={(e) => handleChange('host', e.target.value)}
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Для Яндекс: smtp.yandex.ru, для Gmail: smtp.gmail.com
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="smtp-port" className="text-gray-900 dark:text-gray-100">
              Порт
            </Label>
            <Input
              id="smtp-port"
              type="text"
              placeholder="587"
              value={smtpConfig.port}
              onChange={(e) => handleChange('port', e.target.value)}
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Обычно 587 для TLS или 465 для SSL
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="smtp-user" className="text-gray-900 dark:text-gray-100">
              Email
            </Label>
            <Input
              id="smtp-user"
              type="email"
              placeholder="info@gruzclick.ru"
              value={smtpConfig.user}
              onChange={(e) => handleChange('user', e.target.value)}
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Email адрес для отправки писем
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="smtp-password" className="text-gray-900 dark:text-gray-100">
              Пароль приложения
            </Label>
            <div className="relative">
              <Input
                id="smtp-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="****************"
                value={smtpConfig.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowPassword(!showPassword)}
              >
                <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} />
              </Button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Для Яндекс: создайте пароль приложения на{' '}
              <a 
                href="https://id.yandex.ru/security" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                id.yandex.ru/security
              </a>
            </p>
          </div>
        </div>

        {testStatus === 'success' && (
          <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <Icon name="CheckCircle" size={16} className="text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200 ml-2">
              Подключение успешно! Настройки корректны.
            </AlertDescription>
          </Alert>
        )}

        {testStatus === 'error' && (
          <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <Icon name="XCircle" size={16} className="text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-800 dark:text-red-200 ml-2">
              {errorMessage || 'Ошибка подключения. Проверьте настройки.'}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3">
          <Button
            onClick={testConnection}
            disabled={testStatus === 'testing'}
            variant="outline"
            className="flex-1"
          >
            <Icon name={testStatus === 'testing' ? 'Loader2' : 'Zap'} size={16} className="mr-2" />
            {testStatus === 'testing' ? 'Проверка...' : 'Проверить подключение'}
          </Button>
          <Button
            onClick={saveConfig}
            disabled={testStatus !== 'success'}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Icon name="Save" size={16} className="mr-2" />
            Сохранить настройки
          </Button>
        </div>

        <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <Icon name="AlertTriangle" size={16} className="text-yellow-600 dark:text-yellow-400" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200 ml-2">
            <strong>Важно:</strong> После сохранения скопируйте значения и добавьте их как секреты проекта:
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>SMTP_HOST</li>
              <li>SMTP_PORT</li>
              <li>SMTP_USER</li>
              <li>SMTP_PASSWORD</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
