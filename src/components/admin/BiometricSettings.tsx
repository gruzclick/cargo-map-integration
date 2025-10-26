import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { secureLocalStorage } from '@/utils/security';
import { BiometricCamera } from '@/components/BiometricCamera';
import { BiometricStatus } from './biometric/BiometricStatus';
import { BiometricSavedScans } from './biometric/BiometricSavedScans';
import { BiometricEnrollmentCard } from './biometric/BiometricEnrollmentCard';
import { BiometricSecuritySettings } from './biometric/BiometricSecuritySettings';

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
      <BiometricStatus
        enabled={biometricData.enabled}
        method={biometricData.method}
        deviceId={biometricData.device_id}
        registeredDate={biometricData.registered_date}
        lastUsed={biometricData.last_used}
      />

      <BiometricSavedScans
        faceTemplate={biometricData.face_template}
        irisTemplate={biometricData.iris_template}
        onRescanFace={() => {
          setCameraType('face');
          setShowCamera(true);
        }}
        onRescanIris={() => {
          setCameraType('iris');
          setShowCamera(true);
        }}
      />

      <BiometricEnrollmentCard
        enabled={biometricData.enabled}
        method={biometricData.method}
        isBiometricAvailable={isBiometricAvailable}
        enrolling={enrolling}
        onMethodChange={(method) => setBiometricData({ ...biometricData, method })}
        onEnroll={enrollBiometric}
        onRemove={removeBiometric}
      />

      <BiometricSecuritySettings
        backupPin={biometricData.backup_pin}
        requirePinBackup={biometricData.require_pin_backup}
        autoLockTimeout={biometricData.auto_lock_timeout}
        allowFallbackPassword={biometricData.allow_fallback_password}
        saving={saving}
        onBackupPinChange={(value) => setBiometricData({ ...biometricData, backup_pin: value })}
        onRequirePinBackupChange={(value) => setBiometricData({ ...biometricData, require_pin_backup: value })}
        onAutoLockTimeoutChange={(value) => setBiometricData({ ...biometricData, auto_lock_timeout: value })}
        onAllowFallbackPasswordChange={(value) => setBiometricData({ ...biometricData, allow_fallback_password: value })}
        onSave={saveBiometricSettings}
      />
    </div>
  );
};
