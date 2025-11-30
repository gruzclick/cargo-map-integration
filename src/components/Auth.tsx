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
import TelegramAuth from './TelegramAuth';
import { sanitizeInput, secureLocalStorage, rateLimit, validateEmail, validatePhone, validateINN } from '@/utils/security';

interface AuthProps {
  onSuccess: (userData: any) => void;
}

const Auth = ({ onSuccess }: AuthProps) => {
  const [authMethod, setAuthMethod] = useState<'email' | 'telegram' | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<'client' | 'carrier'>('client');
  const [showTerms, setShowTerms] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

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
    agree_terms: false,
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

        let response;
        let data;

        try {
          response = await fetch('https://d5dho5lmmrb9rmhfv3fs.apigw.yandexcloud.net/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'login',
              email: formData.email,
              password: formData.password
            })
          });

          data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Ошибка входа');
          }
        } catch (fetchError: any) {
          console.log('Backend недоступен, использую локальную авторизацию');
          
          const savedUsers = localStorage.getItem('registered_users');
          const users = savedUsers ? JSON.parse(savedUsers) : [];
          
          const user = users.find((u: any) => u.email === formData.email);
          
          if (!user) {
            throw new Error('Пользователь не найден. Зарегистрируйтесь сначала.');
          }

          if (user.password !== formData.password) {
            throw new Error('Неверный пароль');
          }

          const mockToken = btoa(JSON.stringify({ userId: user.id, exp: Date.now() + 86400000 }));

          data = {
            user: user,
            token: mockToken
          };
        }

        if (data.needs_agreement) {
          secureLocalStorage.set('pending_auth', JSON.stringify({ token: data.token, user: data.user }));
          secureLocalStorage.set('needs_terms_update', 'true');
          window.location.reload();
          return;
        }

        secureLocalStorage.set('auth_token', data.token);
        secureLocalStorage.set('user_data', JSON.stringify(data.user));
        onSuccess(data.user);
        
        toast({
          title: 'Вход выполнен успешно!'
        });
      } else {
        if (!formData.email || !formData.password) {
          toast({
            title: 'Заполните обязательные поля',
            description: 'Email и пароль обязательны для регистрации',
            variant: 'destructive'
          });
          setLoading(false);
          return;
        }

        if (!formData.full_name) {
          toast({
            title: 'Заполните ФИО',
            description: 'Укажите ваше полное имя',
            variant: 'destructive'
          });
          setLoading(false);
          return;
        }

        if (!formData.phone) {
          toast({
            title: 'Укажите телефон',
            description: 'Номер телефона обязателен для связи',
            variant: 'destructive'
          });
          setLoading(false);
          return;
        }

        if (!formData.agree_terms) {
          toast({
            title: 'Требуется согласие',
            description: 'Необходимо согласиться с Пользовательским соглашением и Политикой конфиденциальности',
            variant: 'destructive'
          });
          setLoading(false);
          return;
        }

        if (!validateEmail(formData.email)) {
          throw new Error('Некорректный email');
        }
        if (!validatePhone(formData.phone)) {
          throw new Error('Некорректный номер телефона. Используйте формат: +7XXXXXXXXXX');
        }
        if (formData.inn && !validateINN(formData.inn)) {
          throw new Error('Некорректный ИНН');
        }

        let response;
        let data;

        try {
          response = await fetch('https://d5dho5lmmrb9rmhfv3fs.apigw.yandexcloud.net/auth', {
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

          data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Ошибка регистрации');
          }
        } catch (fetchError: any) {
          console.log('Backend недоступен, использую локальную регистрацию');
          
          const savedUsers = localStorage.getItem('registered_users');
          const users = savedUsers ? JSON.parse(savedUsers) : [];
          
          const existingUser = users.find((u: any) => u.email === formData.email);
          if (existingUser) {
            throw new Error('Пользователь с таким email уже существует');
          }

          const mockUser = {
            id: Date.now().toString(),
            email: formData.email,
            password: formData.password,
            full_name: formData.full_name,
            phone: formData.phone,
            user_type: userType,
            entity_type: formData.entity_type,
            inn: formData.inn,
            organization_name: formData.organization_name,
            created_at: new Date().toISOString(),
            terms_accepted_version: '1.0'
          };

          users.push(mockUser);
          localStorage.setItem('registered_users', JSON.stringify(users));

          const mockToken = btoa(JSON.stringify({ userId: mockUser.id, exp: Date.now() + 86400000 }));

          data = {
            user: mockUser,
            token: mockToken
          };
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

  if (authMethod === 'telegram') {
    return (
      <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-blue-950">
        <TelegramAuth 
          onSuccess={onSuccess} 
          onBack={() => setAuthMethod(null)} 
        />
      </div>
    );
  }

  if (authMethod === null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-blue-950">
        <Card className="w-full max-w-md shadow-2xl rounded-2xl">
          <CardHeader>
            <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icon name="Truck" size={32} className="text-accent-foreground" />
            </div>
            <CardTitle className="text-3xl font-bold text-center">
              ГрузКлик
            </CardTitle>
            <CardDescription className="text-center">
              Выберите способ входа
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => setAuthMethod('telegram')}
              className="w-full h-14 text-lg"
              variant="default"
            >
              <Icon name="MessageCircle" size={24} className="mr-3" />
              Продолжить через Telegram
            </Button>
            <Button
              onClick={() => setAuthMethod('email')}
              className="w-full h-14 text-lg"
              variant="outline"
            >
              <Icon name="Mail" size={24} className="mr-3" />
              Email / Пароль
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-blue-950">
      <Card className="w-full max-w-md shadow-2xl rounded-2xl sm:rounded-3xl relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border-white/30 dark:border-gray-700/30">
        <button
          onClick={() => setAuthMethod(null)}
          className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 p-1.5 sm:p-2 rounded-full hover:bg-muted/50 transition-colors"
          title="Назад"
        >
          <Icon name="ArrowLeft" size={20} className="text-muted-foreground hover:text-foreground sm:w-6 sm:h-6" />
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-1.5 sm:p-2 rounded-full hover:bg-muted/50 transition-colors"
          title="Закрыть"
        >
          <Icon name="X" size={20} className="text-muted-foreground hover:text-foreground sm:w-6 sm:h-6" />
        </button>
        <CardHeader className="space-y-2 pb-4 sm:pb-6 px-4 sm:px-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-accent rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-4">
            <Icon name="Truck" size={24} className="text-accent-foreground sm:w-8 sm:h-8" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-center">
            ГрузКлик
          </CardTitle>
          <CardDescription className="text-center text-sm sm:text-base">
            Информационная панель
          </CardDescription>
          <p className="text-center text-xs sm:text-sm text-muted-foreground">
            {isLogin ? 'Войдите в свой аккаунт' : 'Создайте новый аккаунт'}
          </p>
        </CardHeader>

        <CardContent className="px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
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
                <p className="text-[10px] sm:text-xs text-muted-foreground -mt-1 sm:-mt-2 px-1">
                  Можно изменить в настройках профиля
                </p>

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

                <AgreementFields
                  agreeGeolocation={formData.agree_geolocation}
                  agreeVerification={formData.agree_verification}
                  useGosuslugi={formData.use_gosuslugi}
                  agreeTerms={formData.agree_terms}
                  onAgreeGeolocationChange={(val) => setFormData({ ...formData, agree_geolocation: val })}
                  onAgreeVerificationChange={(val) => setFormData({ ...formData, agree_verification: val })}
                  onUseGosuslugirChange={(val) => setFormData({ ...formData, use_gosuslugi: val })}
                  onAgreeTermsChange={(val) => setFormData({ ...formData, agree_terms: val })}
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

            <Button 
              type="submit" 
              className="w-full h-11 sm:h-12 text-sm sm:text-base rounded-xl" 
              disabled={loading || (!isLogin && !formData.agree_terms)}
            >
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

            <div className="text-center space-y-0.5 sm:space-y-1">
              <Button
                type="button"
                variant="link"
                onClick={() => setIsLogin(!isLogin)}
                className="text-xs sm:text-sm"
              >
                {isLogin ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
              </Button>
              {isLogin && (
                <div>
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-[10px] sm:text-sm text-muted-foreground hover:text-primary"
                  >
                    Забыли пароль?
                  </Button>
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {showForgotPassword && (
        <Card className="w-full max-w-md shadow-2xl rounded-3xl mt-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border-white/30 dark:border-gray-700/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Восстановление пароля</CardTitle>
              <button
                onClick={() => setShowForgotPassword(false)}
                className="p-2 rounded-full hover:bg-muted/50 transition-colors"
              >
                <Icon name="X" size={20} />
              </button>
            </div>
            <CardDescription>
              Введите email или телефон, указанный при регистрации
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                toast({
                  title: 'Функция в разработке',
                  description: 'Восстановление пароля будет доступно в ближайшее время. Пожалуйста, свяжитесь с поддержкой.'
                });
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium">Email или телефон</label>
                <input
                  type="text"
                  placeholder="+7 или email@example.com"
                  className="w-full px-4 py-3 rounded-xl border bg-background"
                />
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl">
                <Icon name="Send" size={18} className="mr-2" />
                Отправить код восстановления
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Auth;