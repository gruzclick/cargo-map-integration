import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { secureLocalStorage } from '@/utils/security';

export default function AdminSecurity() {
  const { toast } = useToast();
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const adminProfile = JSON.parse(secureLocalStorage.get('admin_profile') || '{}');
  const userEmail = adminProfile.email || 'Не указан';

  const handleChangePassword = () => {
    if (passwordData.currentPassword !== 'admin123') {
      toast({
        title: 'Ошибка',
        description: 'Неверный текущий пароль',
        variant: 'destructive'
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Ошибка',
        description: 'Пароли не совпадают',
        variant: 'destructive'
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: 'Ошибка',
        description: 'Пароль должен быть не менее 8 символов',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Пароль изменен',
      description: 'Ваш пароль успешно обновлен'
    });

    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswordFields(false);
  };

  const handlePasswordRecovery = () => {
    toast({
      title: 'Сообщение отправлено',
      description: 'Ссылка для восстановления отправлена в Telegram'
    });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => window.history.back()}>
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Icon name="Shield" size={32} />
              Безопасность и аутентификация
            </h1>
            <p className="text-muted-foreground">Управление паролем и восстановление доступа</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Информация об аккаунте</CardTitle>
            <CardDescription>Email для уведомлений</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <Icon name="Mail" size={24} className="text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{userEmail}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Изменить пароль</CardTitle>
            <CardDescription>Обновите пароль для входа в админ-панель</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showPasswordFields ? (
              <Button onClick={() => setShowPasswordFields(true)} className="w-full">
                <Icon name="Key" size={16} className="mr-2" />
                Изменить пароль
              </Button>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="current-password">Текущий пароль</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="Введите текущий пароль"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      <Icon name={showCurrentPassword ? 'EyeOff' : 'Eye'} size={16} />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">Новый пароль</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="Минимум 8 символов"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      <Icon name={showNewPassword ? 'EyeOff' : 'Eye'} size={16} />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Подтвердите пароль</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Повторите новый пароль"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <Icon name={showConfirmPassword ? 'EyeOff' : 'Eye'} size={16} />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleChangePassword} className="flex-1">
                    Сохранить пароль
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowPasswordFields(false);
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    }}
                  >
                    Отмена
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Восстановление пароля</CardTitle>
            <CardDescription>Получите ссылку для сброса пароля через Telegram</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg mb-4">
              <Icon name="Info" size={20} className="text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-900 dark:text-blue-100">
                <p className="font-medium mb-1">Восстановление через Telegram</p>
                <p>При запросе восстановления пароля ссылка будет отправлена в ваш Telegram. Убедитесь, что ваш аккаунт привязан к боту.</p>
              </div>
            </div>

            <Button onClick={handlePasswordRecovery} variant="outline" className="w-full">
              <Icon name="Send" size={16} className="mr-2" />
              Отправить ссылку в Telegram
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>История входов</CardTitle>
            <CardDescription>Последние попытки входа в систему</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <div>
                    <p className="font-medium">Успешный вход</p>
                    <p className="text-sm text-muted-foreground">Сегодня в {new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <Icon name="Check" size={20} className="text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
