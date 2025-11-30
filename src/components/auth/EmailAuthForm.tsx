/**
 * Компонент формы входа/регистрации через Email
 * 
 * Назначение: UI-компонент для отображения формы авторизации
 * 
 * Функциональность:
 * - Два режима: вход и регистрация
 * - При входе: простая форма (email + пароль)
 * - При регистрации: полная форма с множеством полей
 * - Выбор типа пользователя (клиент/перевозчик)
 * - Дополнительные поля для перевозчиков (тип ТС, грузоподъёмность)
 * - Чекбоксы согласий (геолокация, верификация, условия)
 * - Адаптивная вёрстка
 * - Кнопки "Назад" и "Закрыть"
 * 
 * Используется в: Auth.tsx для рендера формы
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import LanguageCurrencyFields from './LanguageCurrencyFields';
import UserTypeSelector from './UserTypeSelector';
import BasicInfoFields from './BasicInfoFields';
import CarrierFields from './CarrierFields';
import AgreementFields from './AgreementFields';
import LoginFields from './LoginFields';

interface EmailAuthFormProps {
  isLogin: boolean;
  loading: boolean;
  userType: 'client' | 'carrier';
  showPassword: boolean;
  formData: any;
  onSubmit: (e: React.FormEvent) => void;
  onFormDataChange: (data: any) => void;
  onUserTypeChange: (type: 'client' | 'carrier') => void;
  onTogglePassword: () => void;
  onToggleMode: () => void;
  onBack: () => void;
}

const EmailAuthForm = ({
  isLogin,
  loading,
  userType,
  showPassword,
  formData,
  onSubmit,
  onFormDataChange,
  onUserTypeChange,
  onTogglePassword,
  onToggleMode,
  onBack
}: EmailAuthFormProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-blue-950">
      <Card className="w-full max-w-md shadow-2xl rounded-2xl sm:rounded-3xl relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border-white/30 dark:border-gray-700/30">
        <button
          onClick={onBack}
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
          <form onSubmit={onSubmit} className="space-y-3 sm:space-y-4">
            {!isLogin && (
              <>
                <LanguageCurrencyFields
                  language={formData.language}
                  currency={formData.currency}
                  onLanguageChange={(val) => onFormDataChange({ ...formData, language: val })}
                  onCurrencyChange={(val) => onFormDataChange({ ...formData, currency: val })}
                />

                <UserTypeSelector
                  userType={userType}
                  onUserTypeChange={onUserTypeChange}
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
                  onFormDataChange={(data) => onFormDataChange({ ...formData, ...data })}
                />

                {userType === 'carrier' && (
                  <CarrierFields
                    vehicleType={formData.vehicle_type}
                    capacity={formData.capacity}
                    onVehicleTypeChange={(val) => onFormDataChange({ ...formData, vehicle_type: val })}
                    onCapacityChange={(val) => onFormDataChange({ ...formData, capacity: val })}
                  />
                )}

                <AgreementFields
                  agreeGeolocation={formData.agree_geolocation}
                  agreeVerification={formData.agree_verification}
                  useGosuslugi={formData.use_gosuslugi}
                  agreeTerms={formData.agree_terms}
                  onAgreeGeolocationChange={(val) => onFormDataChange({ ...formData, agree_geolocation: val })}
                  onAgreeVerificationChange={(val) => onFormDataChange({ ...formData, agree_verification: val })}
                  onUseGosuslugirChange={(val) => onFormDataChange({ ...formData, use_gosuslugi: val })}
                  onAgreeTermsChange={(val) => onFormDataChange({ ...formData, agree_terms: val })}
                />
              </>
            )}

            {isLogin && (
              <LoginFields
                email={formData.email}
                password={formData.password}
                showPassword={showPassword}
                onEmailChange={(val) => onFormDataChange({ ...formData, email: val })}
                onPasswordChange={(val) => onFormDataChange({ ...formData, password: val })}
                onTogglePassword={onTogglePassword}
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
                onClick={onToggleMode}
                className="text-xs sm:text-sm"
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

export default EmailAuthForm;