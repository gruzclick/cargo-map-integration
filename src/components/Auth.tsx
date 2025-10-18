import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import TermsAgreement from './TermsAgreement';
import BiometricAuth from './BiometricAuth';

interface AuthProps {
  onSuccess: (userData: any) => void;
}

const Auth = ({ onSuccess }: AuthProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<'client' | 'carrier'>('client');
  const [showTerms, setShowTerms] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

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
    use_gosuslugi: false
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
            phone: formData.phone,
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
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('user_data', JSON.stringify(data.user));
          onSuccess(data.user);
          toast({
            title: 'Регистрация успешна!',
            description: `Добро пожаловать, ${data.user.full_name}!`
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-accent/5">
      <Card className="w-full max-w-md border-0 shadow-2xl rounded-3xl">
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

                <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-blue-500/10 to-accent/10 rounded-xl border border-blue-500/30">
                  <Checkbox 
                    id="gosuslugi" 
                    checked={formData.use_gosuslugi}
                    onCheckedChange={(checked) => setFormData({ ...formData, use_gosuslugi: checked === true })}
                    className="mt-1"
                  />
                  <label htmlFor="gosuslugi" className="text-sm leading-relaxed cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name="Shield" size={16} className="text-blue-500" />
                      <span className="font-semibold">Подтвердить данные через Госуслуги</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Рекомендуем подтвердить паспортные данные через Госуслуги — это даёт вам преимущество перед другими пользователями. 
                      Клиенты видят отметку "Проверено" и больше доверяют проверенным перевозчикам, что приводит к увеличению количества заказов на 40-60%.
                    </p>
                  </label>
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
                          <SelectItem value="car_small">Легковой автомобиль</SelectItem>
                          <SelectItem value="fleet">Автопарк</SelectItem>
                          <SelectItem value="van_small">Малый фургон (Газель)</SelectItem>
                          <SelectItem value="van_medium">Средний фургон</SelectItem>
                          <SelectItem value="van_large">Большой фургон</SelectItem>
                          <SelectItem value="truck_1.5t">Грузовик до 1.5т</SelectItem>
                          <SelectItem value="truck_3t">Грузовик до 3т</SelectItem>
                          <SelectItem value="truck_5t">Грузовик до 5т</SelectItem>
                          <SelectItem value="truck_10t">Грузовик до 10т</SelectItem>
                          <SelectItem value="truck_20t">Грузовик до 20т</SelectItem>
                          <SelectItem value="truck_flatbed">Бортовой грузовик</SelectItem>
                          <SelectItem value="truck_isothermal">Изотермический фургон</SelectItem>
                          <SelectItem value="truck_refrigerator">Рефрижератор</SelectItem>
                          <SelectItem value="truck_trailer">Грузовик с прицепом</SelectItem>
                          <SelectItem value="truck_container">Контейнеровоз</SelectItem>
                          <SelectItem value="semi_truck">Седельный тягач</SelectItem>
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

            {!isLogin && (
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
            )}

            <div className="space-y-2">
              <Label htmlFor="phone">Телефон *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+7 (999) 123-45-67"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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

            {!isLogin && (
              <div className="flex items-start space-x-3 p-3 bg-accent/5 rounded-xl">
                <Checkbox 
                  id="terms" 
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                  className="mt-1"
                />
                <label
                  htmlFor="terms"
                  className="text-sm leading-relaxed cursor-pointer"
                >
                  Я согласен с{' '}
                  <button
                    type="button"
                    onClick={() => setShowTerms(true)}
                    className="text-accent hover:underline font-medium"
                  >
                    пользовательским соглашением
                  </button>
                </label>
              </div>
            )}

            <Button type="submit" className="w-full h-12 text-base rounded-xl" disabled={loading || (!isLogin && !termsAccepted)}>
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

      {isLogin && (
        <div className="mt-6">
          <BiometricAuth onSuccess={onSuccess} />
        </div>
      )}
    </div>
  );
};

export default Auth;