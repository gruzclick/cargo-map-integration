import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface AuthProps {
  onSuccess: (userData: any) => void;
}

const Auth = ({ onSuccess }: AuthProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<'client' | 'carrier'>('client');
  const [showVerification, setShowVerification] = useState(false);
  const [verificationData, setVerificationData] = useState<any>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    entity_type: 'individual',
    inn: '',
    organization_name: '',
    phone: '',
    vehicle_type: 'car',
    capacity: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = 'https://functions.poehali.dev/9835e97e-8876-4256-90f3-4250d5dbdfc8';
      
      if (isLogin) {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'login',
            email: formData.email,
            password: formData.password
          })
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('user_data', JSON.stringify(data.user));
          onSuccess(data.user);
          toast({
            title: 'Успешный вход',
            description: `Добро пожаловать, ${data.user.full_name}!`
          });
        } else {
          throw new Error(data.error || 'Ошибка входа');
        }
      } else {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'register',
            email: formData.email,
            password: formData.password,
            full_name: formData.full_name,
            user_type: userType,
            entity_type: formData.entity_type,
            inn: formData.inn || null,
            organization_name: formData.organization_name || null,
            phone: formData.phone,
            vehicle_type: userType === 'carrier' ? formData.vehicle_type : null,
            capacity: userType === 'carrier' && formData.capacity ? parseFloat(formData.capacity) : null
          })
        });

        const data = await response.json();

        if (response.ok) {
          setVerificationData(data);
          setShowVerification(true);
          toast({
            title: 'Регистрация успешна!',
            description: 'Отправьте код подтверждения в Telegram бот',
            duration: 8000
          });
        } else {
          throw new Error(data.error || 'Ошибка регистрации');
        }
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

  const handleVerifyCode = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/9835e97e-8876-4256-90f3-4250d5dbdfc8', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_code',
          phone: verificationData.phone,
          code: verificationCode
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Телефон подтвержден!',
          description: 'Теперь вы можете войти в систему'
        });
        setShowVerification(false);
        setIsLogin(true);
      } else {
        throw new Error(data.error || 'Неверный код');
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

  const copyCode = () => {
    navigator.clipboard.writeText(verificationData?.telegram_code || '');
    toast({
      title: 'Скопировано',
      description: 'Код скопирован в буфер обмена'
    });
  };

  if (showVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-accent/5">
        <Card className="w-full max-w-md border-0 shadow-2xl rounded-3xl">
          <CardHeader className="space-y-2 pb-6">
            <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icon name="MessageSquare" size={32} className="text-accent-foreground" />
            </div>
            <CardTitle className="text-3xl font-bold text-center">
              Подтверждение телефона
            </CardTitle>
            <CardDescription className="text-center text-base">
              Отправьте код в Telegram бот
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Alert className="bg-accent/10 border-accent/20">
              <Icon name="Info" size={18} className="text-accent" />
              <AlertDescription className="ml-2">
                <div className="space-y-2">
                  <p className="font-semibold">Ваш код подтверждения:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-background px-4 py-3 rounded-lg text-2xl font-bold tracking-wider text-center">
                      {verificationData?.telegram_code}
                    </code>
                    <Button variant="outline" size="icon" onClick={copyCode}>
                      <Icon name="Copy" size={18} />
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                <strong>Шаг 1:</strong> Откройте Telegram и найдите бота{' '}
                <a 
                  href={`https://t.me/${verificationData?.bot_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline font-medium"
                >
                  @{verificationData?.bot_username}
                </a>
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Шаг 2:</strong> Нажмите /start и отправьте код из поля выше
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Шаг 3:</strong> Введите код здесь для завершения регистрации
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Код подтверждения</Label>
              <Input
                id="code"
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
                className="text-center text-2xl tracking-wider font-bold"
              />
            </div>

            <Button 
              onClick={handleVerifyCode} 
              className="w-full h-12 text-base rounded-xl"
              disabled={loading || verificationCode.length !== 6}
            >
              {loading ? (
                <>
                  <Icon name="Loader2" size={18} className="animate-spin mr-2" />
                  Проверка...
                </>
              ) : (
                'Подтвердить'
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowVerification(false)}
              className="w-full"
            >
              Назад
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-accent/5">
      <Card className="w-full max-w-md border-0 shadow-2xl rounded-3xl">
        <CardHeader className="space-y-2 pb-6">
          <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icon name="Truck" size={32} className="text-accent-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold text-center">
            {isLogin ? 'Вход' : 'Регистрация'}
          </CardTitle>
          <CardDescription className="text-center text-base">
            {isLogin ? 'Войдите в свой аккаунт' : 'Создайте новый аккаунт'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-3 pb-4 border-b">
                  <Label className="text-sm font-semibold">Тип пользователя</Label>
                  <RadioGroup value={userType} onValueChange={(val: any) => setUserType(val)} className="flex gap-4">
                    <div className="flex items-center space-x-2 flex-1">
                      <RadioGroupItem value="client" id="client" />
                      <Label htmlFor="client" className="cursor-pointer flex items-center gap-2">
                        <Icon name="Package" size={18} />
                        Клиент
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 flex-1">
                      <RadioGroupItem value="carrier" id="carrier" />
                      <Label htmlFor="carrier" className="cursor-pointer flex items-center gap-2">
                        <Icon name="Truck" size={18} />
                        Перевозчик
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name">ФИО *</Label>
                  <Input
                    id="full_name"
                    placeholder="Иванов Иван Иванович"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entity_type">Тип лица *</Label>
                  <Select value={formData.entity_type} onValueChange={(val) => setFormData({ ...formData, entity_type: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Физическое лицо</SelectItem>
                      <SelectItem value="legal">Юридическое лицо</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.entity_type === 'legal' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="inn">ИНН</Label>
                      <Input
                        id="inn"
                        placeholder="1234567890"
                        value={formData.inn}
                        onChange={(e) => setFormData({ ...formData, inn: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="organization_name">Наименование организации</Label>
                      <Input
                        id="organization_name"
                        placeholder="ООО Компания"
                        value={formData.organization_name}
                        onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон *</Label>
                  <Input
                    id="phone"
                    placeholder="+79991234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                {userType === 'carrier' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="vehicle_type">Тип автомобиля *</Label>
                      <Select value={formData.vehicle_type} onValueChange={(val) => setFormData({ ...formData, vehicle_type: val })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="car">Легковой</SelectItem>
                          <SelectItem value="truck">Грузовой</SelectItem>
                          <SelectItem value="semi">Фура</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Грузоподъёмность (тонн)</Label>
                      <Input
                        id="capacity"
                        type="number"
                        step="0.1"
                        placeholder="3.5"
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      />
                    </div>
                  </>
                )}
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль *</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <Button type="submit" className="w-full h-12 text-base rounded-xl" disabled={loading}>
              {loading ? (
                <>
                  <Icon name="Loader2" size={18} className="animate-spin mr-2" />
                  Загрузка...
                </>
              ) : (
                isLogin ? 'Войти' : 'Зарегистрироваться'
              )}
            </Button>

            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {isLogin ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
