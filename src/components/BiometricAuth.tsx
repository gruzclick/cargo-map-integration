import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import Icon from './ui/icon';
import { useToast } from '@/hooks/use-toast';

interface BiometricAuthProps {
  onSuccess: (userData: any) => void;
}

export default function BiometricAuth({ onSuccess }: BiometricAuthProps) {
  const { toast } = useToast();
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ('credentials' in navigator && 'PublicKeyCredential' in window) {
      setIsBiometricAvailable(true);
    }
  }, []);

  const handleBiometricAuth = async () => {
    setLoading(true);

    try {
      const mockBiometricToken = `biometric_${Date.now()}_${Math.random()}`;
      
      const response = await fetch('https://functions.poehali.dev/c5f04656-8629-4f26-9367-3ff5c1799e22', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'biometric_verify',
          user_id: localStorage.getItem('user_id') || 'demo_user',
          biometric_token: mockBiometricToken
        })
      });

      const data = await response.json();

      if (data.success && data.verified) {
        const storedUserData = localStorage.getItem('user_data');
        if (storedUserData) {
          onSuccess(JSON.parse(storedUserData));
        }
        
        toast({
          title: 'Успешный вход',
          description: 'Биометрическая аутентификация пройдена'
        });
      } else {
        throw new Error('Биометрия не подтверждена');
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

  if (!isBiometricAvailable) {
    return null;
  }

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Fingerprint" size={24} className="text-accent" />
          Быстрый вход
        </CardTitle>
        <CardDescription>
          Войдите с помощью Face ID, Touch ID или отпечатка пальца
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleBiometricAuth}
          disabled={loading}
          className="w-full h-12 gap-2"
          variant="outline"
        >
          {loading ? (
            <>
              <Icon name="Loader2" size={18} className="animate-spin" />
              Проверка...
            </>
          ) : (
            <>
              <Icon name="Fingerprint" size={18} />
              Войти по биометрии
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
