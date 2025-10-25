import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
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
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const adminProfile = JSON.parse(secureLocalStorage.get('admin_profile') || '{}');
  const userEmail = adminProfile.email || 'Не указан';

  useEffect(() => {
    checkBiometricAvailability();
    const enabled = localStorage.getItem('biometric_enabled') === 'true';
    setBiometricEnabled(enabled);
  }, []);

  const checkBiometricAvailability = async () => {
    if (window.PublicKeyCredential) {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      setBiometricAvailable(available);
    }
  };

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

  const handleEnableBiometric = async () => {
    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: challenge,
          rp: {
            name: "Admin Panel",
            id: window.location.hostname
          },
          user: {
            id: new Uint8Array(16),
            name: userEmail,
            displayName: adminProfile.full_name || userEmail
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" },
            { alg: -257, type: "public-key" }
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required"
          },
          timeout: 60000,
          attestation: "none"
        }
      });

      if (credential) {
        localStorage.setItem('biometric_enabled', 'true');
        localStorage.setItem('biometric_credential', JSON.stringify({
          id: credential.id,
          rawId: Array.from(new Uint8Array(credential.rawId))
        }));
        setBiometricEnabled(true);
        toast({
          title: 'Биометрия настроена',
          description: 'Теперь вы можете входить используя биометрию'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось настроить биометрию. Попробуйте снова.',
        variant: 'destructive'
      });
    }
  };

  const handleDisableBiometric = () => {
    localStorage.removeItem('biometric_enabled');
    localStorage.removeItem('biometric_credential');
    setBiometricEnabled(false);
    toast({
      title: 'Биометрия отключена',
      description: 'Биометрическая аутентификация деактивирована'
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
            {biometricAvailable && (
              <div className={`flex items-center justify-between p-4 border rounded-lg ${
                biometricEnabled 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                  : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              }`}>
                <div className="flex items-center gap-3">
                  <Icon 
                    name="Fingerprint" 
                    size={24} 
                    className={biometricEnabled ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'} 
                  />
                  <div>
                    <p className="font-medium">Биометрическая аутентификация</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {biometricEnabled ? 'Вход по отпечатку пальца или Face ID' : 'Используйте биометрию для входа'}
                    </p>
                  </div>
                </div>
                {biometricEnabled ? (
                  <Button variant="outline" onClick={handleDisableBiometric}>
                    Отключить
                  </Button>
                ) : (
                  <Button onClick={handleEnableBiometric}>
                    Настроить
                  </Button>
                )}
              </div>
            )}

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
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Повторите новый пароль"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <Icon name={showConfirmPassword ? "EyeOff" : "Eye"} size={18} />
                      </button>
                    </div>
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Проверочный код будет отправлен на: <span className="font-semibold text-gray-900 dark:text-white">{userEmail}</span>
                  </p>
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
            Рекомендации по безопасности
          </CardTitle>
          <CardDescription>
            Советы для повышения безопасности админ-панели
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-3">
              <Icon name="ShieldAlert" size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Рекомендации
                </p>
                <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Используйте биометрию для быстрого и безопасного входа</li>
                  <li>• Регулярно обновляйте пароли (каждые 90 дней)</li>
                  <li>• Не используйте один и тот же пароль для разных систем</li>
                  <li>• Включайте двухфакторную аутентификацию где возможно</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}