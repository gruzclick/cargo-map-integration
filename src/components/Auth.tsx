import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import TermsAgreement from './TermsAgreement';
import LanguageCurrencyFields from './auth/LanguageCurrencyFields';
import UserTypeSelector from './auth/UserTypeSelector';
import BasicInfoFields from './auth/BasicInfoFields';
import CarrierFields from './auth/CarrierFields';
import PassportFields from './auth/PassportFields';
import AgreementFields from './auth/AgreementFields';
import LoginFields from './auth/LoginFields';
import { sanitizeInput, secureLocalStorage, rateLimit, validateEmail, validatePhone, validateINN } from '@/utils/security';

interface AuthProps {
  onSuccess: (userData: any) => void;
}

const Auth = ({ onSuccess }: AuthProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<'client' | 'carrier'>('client');
  const [showTerms, setShowTerms] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    entity_type: 'individual',
    inn: '',
    organization_name: '',
    phone: '',
    passport_series: '',
    passport_number: '',
    passport_date: '',
    passport_issued_by: '',
    vehicle_type: 'car_small',
    capacity: '',
    agree_geolocation: false,
    agree_verification: false,
    use_gosuslugi: false,
    language: 'ru',
    currency: 'RUB'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rateLimit('auth-form', 5, 60000)) {
      toast({
        variant: 'destructive',
        title: 'Слишком много попыток',
        description: 'Подождите минуту перед следующей попыткой'
      });
      return;
    }
    
    setLoading(true);

    try {
      if (isLogin) {
        if (!formData.email || !formData.password) {
          throw new Error('Заполните email и пароль');
        }

        const response = await fetch('https://d5dho5lmmrb9rmhfv3fs.apigw.yandexcloud.net/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'login',
            email: formData.email,
            password: formData.password
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Ошибка входа');
        }

        secureLocalStorage.set('auth_token', data.token);
        secureLocalStorage.set('user_data', JSON.stringify(data.user));
        onSuccess(data.user);
        
        toast({
          title: 'Вход выполнен успешно!'
        });
      } else {
        if (!termsAccepted) {
          toast({
            title: 'Требуется согласие',
            description: 'Пожалуйста, примите пользовательское соглашение',
            variant: 'destructive'
          });
          setLoading(false);
          return;
        }

        if (formData.email && !validateEmail(formData.email)) {
          throw new Error('Некорректный email');
        }
        if (formData.phone && !validatePhone(formData.phone)) {
          throw new Error('Некорректный номер телефона');
        }
        if (formData.inn && !validateINN(formData.inn)) {
          throw new Error('Некорректный ИНН');
        }

        const response = await fetch('https://d5dho5lmmrb9rmhfv3fs.apigw.yandexcloud.net/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'register',
            email: formData.email,
            password: formData.password,
            full_name: sanitizeInput(formData.full_name),
            phone: formData.phone,
            user_type: userType,
            entity_type: formData.entity_type,
            inn: formData.inn || null,
            organization_name: sanitizeInput(formData.organization_name || '')
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Ошибка регистрации');
        }

        secureLocalStorage.set('auth_token', data.token);
        secureLocalStorage.set('user_data', JSON.stringify(data.user));
        onSuccess(data.user);
        
        toast({
          title: 'Регистрация успешна!'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (showTerms) {
    return (
      <TermsAgreement
        onAccept={() => {
          setTermsAccepted(true);
          setShowTerms(false);
        }}
        onDecline={() => {
          setTermsAccepted(false);
          setShowTerms(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-blue-950">
      <Card className="w-full max-w-md shadow-2xl rounded-3xl relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border-white/30 dark:border-gray-700/30">
        <button
          onClick={() => window.location.href = '/'}
          className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-muted/50 transition-colors"
          title="Закрыть"
        >
          <Icon name="X" size={24} className="text-muted-foreground hover:text-foreground" />
        </button>
        <CardHeader className="space-y-2 pb-6">
          <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icon name="Truck" size={32} className="text-accent-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold text-center">
            Информационная платформа Груз Клик
          </CardTitle>
          <CardDescription className="text-center text-base">
            {isLogin ? 'Войдите в свой аккаунт' : 'Создайте новый аккаунт'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <LanguageCurrencyFields
                  language={formData.language}
                  currency={formData.currency}
                  onLanguageChange={(val) => setFormData({ ...formData, language: val })}
                  onCurrencyChange={(val) => setFormData({ ...formData, currency: val })}
                />

                <UserTypeSelector
                  userType={userType}
                  onUserTypeChange={setUserType}
                />

                <BasicInfoFields
                  formData={{
                    full_name: formData.full_name,
                    entity_type: formData.entity_type,
                    inn: formData.inn,
                    organization_name: formData.organization_name,
                    phone: formData.phone
                  }}
                  onFormDataChange={(data) => setFormData({ ...formData, ...data })}
                />

                {userType === 'carrier' && (
                  <CarrierFields
                    vehicleType={formData.vehicle_type}
                    capacity={formData.capacity}
                    onVehicleTypeChange={(val) => setFormData({ ...formData, vehicle_type: val })}
                    onCapacityChange={(val) => setFormData({ ...formData, capacity: val })}
                  />
                )}

                <PassportFields
                  passportData={{
                    passport_series: formData.passport_series,
                    passport_number: formData.passport_number,
                    passport_date: formData.passport_date,
                    passport_issued_by: formData.passport_issued_by
                  }}
                  onPassportDataChange={(data) => setFormData({ ...formData, ...data })}
                />

                <AgreementFields
                  agreeGeolocation={formData.agree_geolocation}
                  agreeVerification={formData.agree_verification}
                  useGosuslugi={formData.use_gosuslugi}
                  onAgreeGeolocationChange={(val) => setFormData({ ...formData, agree_geolocation: val })}
                  onAgreeVerificationChange={(val) => setFormData({ ...formData, agree_verification: val })}
                  onUseGosuslugirChange={(val) => setFormData({ ...formData, use_gosuslugi: val })}
                  onShowTerms={() => setShowTerms(true)}
                />
              </>
            )}

            {isLogin && (
              <LoginFields
                email={formData.email}
                password={formData.password}
                showPassword={showPassword}
                onEmailChange={(val) => setFormData({ ...formData, email: val })}
                onPasswordChange={(val) => setFormData({ ...formData, password: val })}
                onTogglePassword={() => setShowPassword(!showPassword)}
              />
            )}

            <Button type="submit" className="w-full h-12 text-base rounded-xl" disabled={loading}>
              {loading ? (
                <>
                  <Icon name="Loader2" size={18} className="animate-spin mr-2" />
                  {isLogin ? 'Вход...' : 'Регистрация...'}
                </>
              ) : (
                <>
                  <Icon name={isLogin ? 'LogIn' : 'UserPlus'} size={18} className="mr-2" />
                  {isLogin ? 'Войти' : 'Зарегистрироваться'}
                </>
              )}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm"
              >
                {isLogin ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;