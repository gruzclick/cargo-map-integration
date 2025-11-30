import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import TermsAgreement from './TermsAgreement';
import TelegramAuth from './TelegramAuth';
import AuthMethodSelector from './auth/AuthMethodSelector';
import EmailAuthForm from './auth/EmailAuthForm';
import { handleLogin } from './auth/AuthLoginHandler';
import { handleRegister } from './auth/AuthRegisterHandler';
import { rateLimit } from '@/utils/security';

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
        await handleLogin(formData, onSuccess, toast);
      } else {
        await handleRegister(formData, userType, onSuccess, toast);
      }
    } catch (error: any) {
      if (error.message !== 'Missing required fields' && 
          error.message !== 'Missing full name' && 
          error.message !== 'Missing phone' && 
          error.message !== 'Terms not accepted') {
        toast({
          title: 'Ошибка',
          description: error.message,
          variant: 'destructive'
        });
      }
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
    return <AuthMethodSelector onSelectMethod={setAuthMethod} />;
  }

  return (
    <EmailAuthForm
      isLogin={isLogin}
      loading={loading}
      userType={userType}
      showPassword={showPassword}
      formData={formData}
      onSubmit={handleSubmit}
      onFormDataChange={setFormData}
      onUserTypeChange={setUserType}
      onTogglePassword={() => setShowPassword(!showPassword)}
      onToggleMode={() => setIsLogin(!isLogin)}
      onBack={() => setAuthMethod(null)}
    />
  );
};

export default Auth;
