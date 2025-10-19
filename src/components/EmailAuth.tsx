import { useState, useEffect } from 'react';
import { detectUserCountry } from '@/utils/countryDetection';
import Icon from '@/components/ui/icon';

interface EmailAuthProps {
  onSuccess: (email: string) => void;
  onCancel?: () => void;
}

export default function EmailAuth({ onSuccess, onCancel }: EmailAuthProps) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countryInfo, setCountryInfo] = useState<string>('');
  const [sentCode, setSentCode] = useState('');

  useEffect(() => {
    const loadCountryInfo = async () => {
      const info = await detectUserCountry();
      if (info.isTelegramBlocked) {
        setCountryInfo(`Telegram недоступен в ${info.countryName}. Используйте email для входа.`);
      }
    };
    loadCountryInfo();
  }, []);

  const handleSendCode = async () => {
    if (!email || !email.includes('@')) {
      setError('Введите корректный email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const funcUrls = await import('../../backend/func2url.json');
      const authSecurityUrl = funcUrls.default?.['auth-security'] || funcUrls['auth-security'];

      const response = await fetch(authSecurityUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'email_send',
          email
        })
      });

      const data = await response.json();

      if (data.success) {
        setSentCode(data.code_for_testing);
        setStep('code');
        setError('');
      } else {
        setError(data.error || 'Не удалось отправить код');
      }
    } catch (err) {
      setError('Ошибка отправки кода. Проверьте настройки SMTP.');
      console.error('Email send error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      setError('Введите 6-значный код');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const funcUrls = await import('../../backend/func2url.json');
      const authSecurityUrl = funcUrls.default?.['auth-security'] || funcUrls['auth-security'];

      const response = await fetch(authSecurityUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'email_verify',
          email,
          code
        })
      });

      const data = await response.json();

      if (data.success && data.verified) {
        onSuccess(email);
      } else {
        setError(data.error || 'Неверный код');
      }
    } catch (err) {
      setError('Ошибка проверки кода');
      console.error('Email verify error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Icon name="Mail" size={20} />
          Вход через Email
        </h3>
        {onCancel && (
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
            <Icon name="X" size={20} />
          </button>
        )}
      </div>

      {countryInfo && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-md p-3 mb-4 flex items-start gap-2">
          <Icon name="Info" size={18} className="text-yellow-500 mt-0.5" />
          <p className="text-sm text-yellow-500">{countryInfo}</p>
        </div>
      )}

      {step === 'email' ? (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Email адрес</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.com"
              className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3 flex items-start gap-2">
              <Icon name="AlertCircle" size={18} className="text-red-500 mt-0.5" />
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          <button
            onClick={handleSendCode}
            disabled={loading || !email}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Icon name="Loader" size={18} className="animate-spin" />
                Отправка...
              </>
            ) : (
              <>
                <Icon name="Send" size={18} />
                Отправить код
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-500/10 border border-green-500/20 rounded-md p-3 mb-4">
            <p className="text-sm text-green-500">
              Код отправлен на <strong>{email}</strong>
            </p>
            {sentCode && (
              <p className="text-xs text-muted-foreground mt-2">
                Тестовый код: <strong>{sentCode}</strong>
              </p>
            )}
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Код из email (6 цифр)</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              maxLength={6}
              className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-center text-2xl tracking-widest font-mono"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3 flex items-start gap-2">
              <Icon name="AlertCircle" size={18} className="text-red-500 mt-0.5" />
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => {
                setStep('email');
                setCode('');
                setError('');
              }}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-50"
            >
              Изменить email
            </button>
            <button
              onClick={handleVerifyCode}
              disabled={loading || code.length !== 6}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Icon name="Loader" size={18} className="animate-spin" />
                  Проверка...
                </>
              ) : (
                <>
                  <Icon name="Check" size={18} />
                  Подтвердить
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
