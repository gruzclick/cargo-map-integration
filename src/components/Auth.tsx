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
    use_gosuslugi: false
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
        const mockUser = {
          id: '1',
          full_name: sanitizeInput(formData.full_name || 'Тестовый пользователь'),
          phone: formData.phone,
          user_type: userType,
          entity_type: formData.entity_type
        };
        
        secureLocalStorage.set('auth_token', 'mock_token_' + Date.now());
        secureLocalStorage.set('user_data', JSON.stringify(mockUser));
        onSuccess(mockUser);
        
        // Silent login - no toast notification
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

        const mockUser = {
          id: Date.now().toString(),
          full_name: sanitizeInput(formData.full_name),
          phone: formData.phone,
          email: formData.email,
          user_type: userType,
          entity_type: formData.entity_type,
          inn: formData.inn || null,
          organization_name: sanitizeInput(formData.organization_name || ''),
          vehicle_type: userType === 'carrier' ? formData.vehicle_type : null,
          capacity: userType === 'carrier' && formData.capacity ? parseFloat(formData.capacity) : null
        };
        
        secureLocalStorage.set('auth_token', 'mock_token_' + Date.now());
        secureLocalStorage.set('user_data', JSON.stringify(mockUser));
        onSuccess(mockUser);
        
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
                <div className="space-y-3 pb-4 border-b">
                  <Label className="text-sm font-semibold">Тип пользователя</Label>
                  <RadioGroup value={userType} onValueChange={(val: any) => setUserType(val)} className="grid grid-cols-3 gap-3">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="client" id="client" />
                      <Label htmlFor="client" className="cursor-pointer flex items-center gap-1.5 text-sm">
                        <Icon name="Package" size={16} />
                        Клиент
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="carrier" id="carrier" />
                      <Label htmlFor="carrier" className="cursor-pointer flex items-center gap-1.5 text-sm">
                        <Icon name="Truck" size={16} />
                        Перевозчик
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="logistician" id="logistician" />
                      <Label htmlFor="logistician" className="cursor-pointer flex items-center gap-1.5 text-sm">
                        <Icon name="ClipboardList" size={16} />
                        Логист
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
                      <SelectItem value="self_employed">Самозанятый</SelectItem>
                      <SelectItem value="individual_entrepreneur">Индивидуальный предприниматель (ИП)</SelectItem>
                      <SelectItem value="legal">Юридическое лицо</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inn">ИНН (при наличии)</Label>
                  <Input
                    id="inn"
                    placeholder="1234567890"
                    value={formData.inn}
                    onChange={(e) => setFormData({ ...formData, inn: e.target.value })}
                  />
                </div>

                {formData.entity_type === 'legal' && (
                  <div className="space-y-2">
                    <Label htmlFor="organization_name">Наименование организации</Label>
                    <Input
                      id="organization_name"
                      placeholder="ООО Компания"
                      value={formData.organization_name}
                      onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                    />
                  </div>
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
                    {formData.vehicle_type !== 'fleet' && (
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
                    )}
                    
                    {formData.vehicle_type === 'fleet' && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex items-start gap-2 mb-2">
                          <Icon name="Info" size={18} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Управление автопарком</p>
                            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                              После регистрации вы сможете добавить все ваши автомобили в разделе "Автопарк" в личном кабинете. 
                              Каждое авто можно будет настроить отдельно: указать характеристики, загрузить фото и назначить водителя.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="email">Email (необязательно)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com (для восстановления доступа)"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  <Icon name="Info" size={12} className="inline mr-1" />
                  Рекомендуем указать email для восстановления доступа к аккаунту. Вы сможете подтвердить его позже в настройках.
                </p>
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
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  title={showPassword ? "Скрыть пароль" : "Показать пароль"}
                >
                  <Icon name={showPassword ? "EyeOff" : "Eye"} size={18} />
                </button>
              </div>
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

          {!isLogin && (
            <div className="space-y-3 mt-6 pt-6 border-t">
              <p className="text-sm text-center text-muted-foreground mb-4">
                Или зарегистрируйтесь через
              </p>
              
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 text-base rounded-xl bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                onClick={() => {
                  toast({
                    title: 'Интеграция в разработке',
                    description: 'Вход через Госуслуги скоро будет доступен',
                  });
                }}
              >
                <Icon name="Shield" size={18} className="mr-2" />
                Подтвердить через Госуслуги
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full h-12 text-base rounded-xl bg-green-600 hover:bg-green-700 text-white border-green-600"
                onClick={() => {
                  toast({
                    title: 'Интеграция в разработке',
                    description: 'Вход через Сбер ID скоро будет доступен',
                  });
                }}
              >
                <Icon name="CreditCard" size={18} className="mr-2" />
                Войти через Сбер ID
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full h-12 text-base rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500"
                onClick={() => {
                  toast({
                    title: 'Интеграция в разработке',
                    description: 'Вход через Т-Банк ID скоро будет доступен',
                  });
                }}
              >
                <Icon name="Landmark" size={18} className="mr-2" />
                Войти через Т-Банк ID
              </Button>
            </div>
          )}
        </CardContent>
      </Card>


    </div>
  );
};

export default Auth;