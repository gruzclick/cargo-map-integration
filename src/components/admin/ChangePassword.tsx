import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { secureLocalStorage } from '@/utils/security';

export const ChangePassword = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const handleChangePassword = async () => {
    if (!passwords.current_password || !passwords.new_password || !passwords.confirm_password) {
      toast({
        title: '❌ Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive'
      });
      return;
    }

    if (passwords.new_password !== passwords.confirm_password) {
      toast({
        title: '❌ Ошибка',
        description: 'Новые пароли не совпадают',
        variant: 'destructive'
      });
      return;
    }

    if (passwords.new_password.length < 8) {
      toast({
        title: '❌ Ошибка',
        description: 'Пароль должен содержать минимум 8 символов',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const token = secureLocalStorage.get('admin_token');
      
      const response = await fetch('https://functions.poehali.dev/f06efb37-9437-4df8-8032-f2ba53b2e2d6', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Auth-Token': token || ''
        },
        body: JSON.stringify({
          action: 'change_password',
          current_password: passwords.current_password,
          new_password: passwords.new_password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка смены пароля');
      }

      if (data.token) {
        const expiry = Date.now() + (2 * 60 * 60 * 1000);
        secureLocalStorage.set('admin_token', data.token);
        secureLocalStorage.set('admin_token_expiry', expiry.toString());
      }

      toast({
        title: '✅ Пароль изменён',
        description: 'Ваш пароль успешно обновлён'
      });

      setPasswords({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error) {
      toast({
        title: '❌ Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось изменить пароль',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
            <Icon name="Lock" size={24} />
            Смена пароля
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Обновите пароль для входа в админ-панель
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current_password" className="text-gray-900 dark:text-gray-100">
              Текущий пароль
            </Label>
            <div className="relative">
              <Input
                id="current_password"
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwords.current_password}
                onChange={(e) => setPasswords({...passwords, current_password: e.target.value})}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 pr-10"
                placeholder="Введите текущий пароль"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                <Icon name={showCurrentPassword ? 'EyeOff' : 'Eye'} size={20} />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new_password" className="text-gray-900 dark:text-gray-100">
              Новый пароль
            </Label>
            <div className="relative">
              <Input
                id="new_password"
                type={showNewPassword ? 'text' : 'password'}
                value={passwords.new_password}
                onChange={(e) => setPasswords({...passwords, new_password: e.target.value})}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 pr-10"
                placeholder="Минимум 8 символов, буквы и цифры"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                <Icon name={showNewPassword ? 'EyeOff' : 'Eye'} size={20} />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm_password" className="text-gray-900 dark:text-gray-100">
              Подтвердите новый пароль
            </Label>
            <div className="relative">
              <Input
                id="confirm_password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwords.confirm_password}
                onChange={(e) => setPasswords({...passwords, confirm_password: e.target.value})}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 pr-10"
                placeholder="Повторите новый пароль"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Icon name={showConfirmPassword ? 'EyeOff' : 'Eye'} size={20} />
              </Button>
            </div>
          </div>

          <div className="pt-4">
            <Button
              onClick={handleChangePassword}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Icon name="Save" size={16} className="mr-2" />
                  Изменить пароль
                </>
              )}
            </Button>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Icon name="Info" size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-900 dark:text-blue-100 space-y-1">
                <p className="font-semibold">Требования к паролю:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
                  <li>Минимум 8 символов</li>
                  <li>Должен содержать буквы и цифры</li>
                  <li>Максимум 128 символов</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
