import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

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
      title: 'Письмо отправлено',
      description: 'Проверьте вашу почту для восстановления пароля'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Lock" size={20} />
            Безопасность и аутентификация
          </CardTitle>
          <CardDescription>
            Управление паролями и методами входа в админ-панель
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-3">
                <Icon name="ShieldCheck" size={24} className="text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-medium">Двухфакторная аутентификация</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Google Authenticator</p>
                </div>
              </div>
              <Badge variant="default" className="bg-green-600">Включена</Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Icon name="Key" size={24} />
                <div>
                  <p className="font-medium">Сменить пароль</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Обновите пароль для входа</p>
                </div>
              </div>
              <Button onClick={() => setShowPasswordFields(!showPasswordFields)}>
                {showPasswordFields ? 'Отменить' : 'Изменить'}
              </Button>
            </div>

            {showPasswordFields && (
              <Card className="border-2 border-blue-500/50">
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Текущий пароль</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Введите текущий пароль"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <Icon name={showCurrentPassword ? "EyeOff" : "Eye"} size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">Новый пароль</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Введите новый пароль (минимум 8 символов)"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <Icon name={showNewPassword ? "EyeOff" : "Eye"} size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Подтвердите пароль</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Повторите новый пароль"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    />
                  </div>

                  <Button onClick={handleChangePassword} className="w-full">
                    <Icon name="Check" size={18} className="mr-2" />
                    Сохранить новый пароль
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Icon name="Mail" size={24} />
                <div>
                  <p className="font-medium">Восстановление пароля</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Получите ссылку на email</p>
                </div>
              </div>
              <Button variant="outline" onClick={handlePasswordRecovery}>
                Отправить письмо
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Info" size={20} />
            Альтернативные способы входа в админ-панель
          </CardTitle>
          <CardDescription>
            Дополнительные методы аутентификации для повышения безопасности
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-start gap-3 mb-3">
                <Icon name="Key" size={24} className="text-blue-600 dark:text-blue-400 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">1. Аппаратный ключ (USB Security Key)</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    YubiKey, Google Titan или другие FIDO2-совместимые устройства
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                    <li className="flex items-start gap-2">
                      <Icon name="Check" size={14} className="text-green-600 mt-0.5" />
                      <span>Физическая защита - ключ должен быть у вас</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="Check" size={14} className="text-green-600 mt-0.5" />
                      <span>Защита от фишинга и удаленных атак</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="Check" size={14} className="text-green-600 mt-0.5" />
                      <span>Поддержка WebAuthn стандарта</span>
                    </li>
                  </ul>
                </div>
              </div>
              <Badge variant="secondary">Рекомендовано</Badge>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-start gap-3 mb-3">
                <Icon name="Smartphone" size={24} className="text-green-600 dark:text-green-400 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">2. Биометрическая аутентификация</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Отпечаток пальца или Face ID на вашем устройстве
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                    <li className="flex items-start gap-2">
                      <Icon name="Check" size={14} className="text-green-600 mt-0.5" />
                      <span>Быстрый вход без ввода пароля</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="Check" size={14} className="text-green-600 mt-0.5" />
                      <span>Работает на смартфонах и ноутбуках</span>
                    </li>
                  </ul>
                </div>
              </div>
              <Badge>Доступно</Badge>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-start gap-3 mb-3">
                <Icon name="CreditCard" size={24} className="text-purple-600 dark:text-purple-400 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">3. Смарт-карта с сертификатом</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Корпоративная смарт-карта с цифровым сертификатом
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                    <li className="flex items-start gap-2">
                      <Icon name="Check" size={14} className="text-green-600 mt-0.5" />
                      <span>PKI-инфраструктура</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="Check" size={14} className="text-green-600 mt-0.5" />
                      <span>Двухфакторная аутентификация (что-то, что у вас есть + что-то, что вы знаете)</span>
                    </li>
                  </ul>
                </div>
              </div>
              <Badge variant="outline">Enterprise</Badge>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-start gap-3 mb-3">
                <Icon name="Network" size={24} className="text-orange-600 dark:text-orange-400 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">4. VPN + IP Whitelist</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Доступ только из корпоративной сети или через VPN
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                    <li className="flex items-start gap-2">
                      <Icon name="Check" size={14} className="text-green-600 mt-0.5" />
                      <span>Ограничение доступа по IP-адресам</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="Check" size={14} className="text-green-600 mt-0.5" />
                      <span>Дополнительный уровень защиты</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-3">
                <Icon name="ShieldAlert" size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Рекомендации по безопасности
                  </p>
                  <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Используйте минимум два метода аутентификации</li>
                    <li>• Храните аппаратные ключи в безопасном месте</li>
                    <li>• Регулярно обновляйте пароли (каждые 90 дней)</li>
                    <li>• Не используйте один и тот же пароль для разных систем</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
