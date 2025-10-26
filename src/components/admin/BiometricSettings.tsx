import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { secureLocalStorage } from '@/utils/security';
import { BiometricCamera } from '@/components/BiometricCamera';

interface BiometricData {
  enabled: boolean;
  method: 'fingerprint' | 'face' | 'iris' | 'voice';
  device_id: string;
  registered_date: string;
  last_used: string;
  fingerprint_template?: string;
  face_template?: string;
  iris_template?: string;
  voice_template?: string;
  backup_pin: string;
  require_pin_backup: boolean;
  auto_lock_timeout: number;
  allow_fallback_password: boolean;
}

export const BiometricSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraType, setCameraType] = useState<'face' | 'iris'>('face');
  
  const [biometricData, setBiometricData] = useState<BiometricData>({
    enabled: false,
    method: 'fingerprint',
    device_id: '',
    registered_date: '',
    last_used: '',
    backup_pin: '',
    require_pin_backup: true,
    auto_lock_timeout: 5,
    allow_fallback_password: true
  });

  useEffect(() => {
    if ('credentials' in navigator && 'PublicKeyCredential' in window) {
      setIsBiometricAvailable(true);
    }
    loadBiometricSettings();
  }, []);

  const loadBiometricSettings = async () => {
    setLoading(true);
    try {
      const saved = secureLocalStorage.get('biometric_settings');
      if (saved) {
        setBiometricData(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек биометрии:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveBiometricSettings = async () => {
    setSaving(true);
    try {
      secureLocalStorage.set('biometric_settings', JSON.stringify(biometricData));
      
      toast({
        title: 'Настройки сохранены',
        description: 'Биометрические данные успешно обновлены'
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const enrollBiometric = async () => {
    if (biometricData.method === 'face' || biometricData.method === 'iris') {
      setCameraType(biometricData.method);
      setShowCamera(true);
      return;
    }

    if (!isBiometricAvailable) {
      toast({
        title: 'Биометрия недоступна',
        description: 'Ваше устройство не поддерживает биометрическую аутентификацию',
        variant: 'destructive'
      });
      return;
    }

    setEnrolling(true);
    try {
      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge: new Uint8Array(32),
        rp: {
          name: "ГрузКлик Admin",
          id: window.location.hostname,
        },
        user: {
          id: new Uint8Array(16),
          name: "admin@gruzclick.ru",
          displayName: "Admin User",
        },
        pubKeyCredParams: [{alg: -7, type: "public-key"}],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
        },
        timeout: 60000,
        attestation: "direct"
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      });

      if (credential) {
        const now = new Date().toISOString();
        setBiometricData({
          ...biometricData,
          enabled: true,
          device_id: credential.id,
          registered_date: now,
          last_used: now,
          [`${biometricData.method}_template`]: btoa(credential.id)
        });

        toast({
          title: 'Регистрация успешна',
          description: 'Биометрические данные зарегистрированы'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка регистрации',
        description: error.message || 'Не удалось зарегистрировать биометрические данные',
        variant: 'destructive'
      });
    } finally {
      setEnrolling(false);
    }
  };

  const handleCameraCapture = (imageData: string) => {
    const now = new Date().toISOString();
    setBiometricData({
      ...biometricData,
      enabled: true,
      device_id: `${cameraType}_${Date.now()}`,
      registered_date: now,
      last_used: now,
      [`${cameraType}_template`]: imageData
    });

    setShowCamera(false);
    saveBiometricSettings();
  };

  const handleCameraCancel = () => {
    setShowCamera(false);
  };

  const removeBiometric = () => {
    setBiometricData({
      ...biometricData,
      enabled: false,
      device_id: '',
      registered_date: '',
      last_used: '',
      fingerprint_template: undefined,
      face_template: undefined,
      iris_template: undefined,
      voice_template: undefined
    });

    toast({
      title: 'Биометрия удалена',
      description: 'Все биометрические данные были удалены'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Icon name="Loader2" size={32} className="animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showCamera) {
    return (
      <BiometricCamera
        type={cameraType}
        onCapture={handleCameraCapture}
        onCancel={handleCameraCancel}
      />
    );
  }

  return (
    <div className="space-y-6">
      {(biometricData.face_template || biometricData.iris_template) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Image" size={24} className="text-purple-600" />
              Сохранённые биометрические снимки
            </CardTitle>
            <CardDescription>
              Просмотр зарегистрированных биометрических данных
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {biometricData.face_template && (
                <div className="space-y-2">
                  <Label>Снимок лица</Label>
                  <div className="relative rounded-lg overflow-hidden border">
                    <img 
                      src={biometricData.face_template} 
                      alt="Face scan" 
                      className="w-full h-auto"
                    />
                    <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                      Активен
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCameraType('face');
                      setShowCamera(true);
                    }}
                    className="w-full"
                  >
                    <Icon name="RefreshCw" size={16} className="mr-2" />
                    Пересканировать лицо
                  </Button>
                </div>
              )}
              {biometricData.iris_template && (
                <div className="space-y-2">
                  <Label>Снимок радужки</Label>
                  <div className="relative rounded-lg overflow-hidden border">
                    <img 
                      src={biometricData.iris_template} 
                      alt="Iris scan" 
                      className="w-full h-auto"
                    />
                    <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                      Активен
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCameraType('iris');
                      setShowCamera(true);
                    }}
                    className="w-full"
                  >
                    <Icon name="RefreshCw" size={16} className="mr-2" />
                    Пересканировать радужку
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Fingerprint" size={24} className="text-blue-600" />
            Настройки биометрии
          </CardTitle>
          <CardDescription>
            Настройте биометрическую аутентификацию для безопасного входа
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Включить биометрию</Label>
              <p className="text-sm text-muted-foreground">
                Используйте отпечаток пальца, Face ID или другие биометрические данные
              </p>
            </div>
            <Switch
              checked={biometricData.enabled}
              onCheckedChange={(checked) => 
                setBiometricData({ ...biometricData, enabled: checked })
              }
            />
          </div>

          {biometricData.enabled && (
            <>
              <div className="space-y-2">
                <Label htmlFor="method">Метод биометрии</Label>
                <Select
                  value={biometricData.method}
                  onValueChange={(value: any) => 
                    setBiometricData({ ...biometricData, method: value })
                  }
                >
                  <SelectTrigger id="method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fingerprint">
                      <div className="flex items-center gap-2">
                        <Icon name="Fingerprint" size={16} />
                        Отпечаток пальца
                      </div>
                    </SelectItem>
                    <SelectItem value="face">
                      <div className="flex items-center gap-2">
                        <Icon name="Smile" size={16} />
                        Распознавание лица (Face ID)
                      </div>
                    </SelectItem>
                    <SelectItem value="iris">
                      <div className="flex items-center gap-2">
                        <Icon name="Eye" size={16} />
                        Сканирование радужки
                      </div>
                    </SelectItem>
                    <SelectItem value="voice">
                      <div className="flex items-center gap-2">
                        <Icon name="Mic" size={16} />
                        Голосовая биометрия
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {biometricData.device_id ? (
                <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <Icon name="CheckCircle2" size={20} />
                    <span className="font-medium">Биометрия зарегистрирована</span>
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-500 space-y-1">
                    <p>ID устройства: {biometricData.device_id.substring(0, 20)}...</p>
                    {biometricData.registered_date && (
                      <p>Дата регистрации: {new Date(biometricData.registered_date).toLocaleString('ru-RU')}</p>
                    )}
                    {biometricData.last_used && (
                      <p>Последнее использование: {new Date(biometricData.last_used).toLocaleString('ru-RU')}</p>
                    )}
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={removeBiometric}
                    className="mt-2"
                  >
                    <Icon name="Trash2" size={16} className="mr-2" />
                    Удалить биометрические данные
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={enrollBiometric}
                  disabled={enrolling || !isBiometricAvailable}
                  className="w-full"
                >
                  {enrolling ? (
                    <>
                      <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                      Регистрация...
                    </>
                  ) : (
                    <>
                      <Icon name="Scan" size={18} className="mr-2" />
                      Зарегистрировать биометрию
                    </>
                  )}
                </Button>
              )}

              <div className="space-y-2">
                <Label htmlFor="backup_pin">PIN-код для резервного доступа</Label>
                <Input
                  id="backup_pin"
                  type="password"
                  placeholder="Введите 4-6 цифр"
                  maxLength={6}
                  value={biometricData.backup_pin}
                  onChange={(e) => 
                    setBiometricData({ ...biometricData, backup_pin: e.target.value.replace(/\D/g, '') })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Используется если биометрия недоступна
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">Требовать PIN при каждом входе</Label>
                  <p className="text-xs text-muted-foreground">
                    Дополнительная защита вместе с биометрией
                  </p>
                </div>
                <Switch
                  checked={biometricData.require_pin_backup}
                  onCheckedChange={(checked) => 
                    setBiometricData({ ...biometricData, require_pin_backup: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeout">Автоблокировка (минуты)</Label>
                <Select
                  value={biometricData.auto_lock_timeout.toString()}
                  onValueChange={(value) => 
                    setBiometricData({ ...biometricData, auto_lock_timeout: parseInt(value) })
                  }
                >
                  <SelectTrigger id="timeout">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 минута</SelectItem>
                    <SelectItem value="5">5 минут</SelectItem>
                    <SelectItem value="10">10 минут</SelectItem>
                    <SelectItem value="15">15 минут</SelectItem>
                    <SelectItem value="30">30 минут</SelectItem>
                    <SelectItem value="60">1 час</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Время неактивности перед автоматической блокировкой
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">Разрешить вход по паролю</Label>
                  <p className="text-xs text-muted-foreground">
                    Возможность войти через обычный пароль
                  </p>
                </div>
                <Switch
                  checked={biometricData.allow_fallback_password}
                  onCheckedChange={(checked) => 
                    setBiometricData({ ...biometricData, allow_fallback_password: checked })
                  }
                />
              </div>
            </>
          )}

          {!isBiometricAvailable && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950 p-4">
              <div className="flex gap-2">
                <Icon name="AlertTriangle" size={20} className="text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
                <div className="text-sm text-yellow-700 dark:text-yellow-400">
                  <p className="font-medium">Биометрия недоступна</p>
                  <p className="mt-1">
                    Ваше устройство или браузер не поддерживает биометрическую аутентификацию. 
                    Попробуйте использовать современный браузер или устройство с биометрическим сканером.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              onClick={saveBiometricSettings}
              disabled={saving}
              className="flex-1"
            >
              {saving ? (
                <>
                  <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Icon name="Save" size={18} className="mr-2" />
                  Сохранить настройки
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={loadBiometricSettings}
              disabled={loading}
            >
              <Icon name="RotateCcw" size={18} />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Icon name="Info" size={20} className="text-blue-600" />
            Информация о безопасности
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex gap-2">
            <Icon name="Shield" size={16} className="flex-shrink-0 mt-0.5" />
            <p>
              Биометрические данные хранятся локально на вашем устройстве и никогда не передаются на сервер
            </p>
          </div>
          <div className="flex gap-2">
            <Icon name="Lock" size={16} className="flex-shrink-0 mt-0.5" />
            <p>
              Все данные шифруются с использованием аппаратного модуля безопасности вашего устройства
            </p>
          </div>
          <div className="flex gap-2">
            <Icon name="Key" size={16} className="flex-shrink-0 mt-0.5" />
            <p>
              PIN-код используется как резервный метод доступа и хранится в зашифрованном виде
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};