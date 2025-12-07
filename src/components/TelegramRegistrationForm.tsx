import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface TelegramRegistrationFormProps {
  telegramData: {
    user_id: number;
    username?: string;
    first_name: string;
    last_name?: string;
    photo_url?: string;
  };
  onSuccess: (userData: any) => void;
  onBack: () => void;
}

const TelegramRegistrationForm = ({ telegramData, onSuccess, onBack }: TelegramRegistrationFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<'client' | 'carrier' | 'logist'>('client');
  
  const fullName = `${telegramData.first_name} ${telegramData.last_name || ''}`.trim();
  
  const [formData, setFormData] = useState({
    full_name: fullName,
    phone: '',
    entity_type: 'individual' as 'individual' | 'legal',
    inn: '',
    organization_name: '',
    agree_terms: false,
    language: 'ru',
    currency: 'RUB'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.phone) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Укажите номер телефона'
      });
      return;
    }
    
    if (!formData.agree_terms) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Необходимо принять условия использования'
      });
      return;
    }
    
    setLoading(true);

    try {
      // Завершение регистрации через новую функцию
      const response = await fetch('https://functions.poehali.dev/1aff09b3-0b6f-47fa-bcee-64b365767001', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_user_id: telegramData.user_id,
          telegram_username: telegramData.username || '',
          full_name: formData.full_name,
          phone: formData.phone,
          user_type: userType,
          entity_type: formData.entity_type,
          inn: formData.inn || null,
          organization_name: formData.organization_name || null,
          photo_url: telegramData.photo_url || null
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Ошибка регистрации');
      }

      onSuccess(data.user);
      
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        variant: 'destructive',
        title: 'Ошибка регистрации',
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-blue-950">
      <Card className="w-full max-w-md shadow-2xl rounded-2xl relative">
        <button
          onClick={onBack}
          className="absolute top-4 left-4 z-10 p-2 rounded-full hover:bg-muted/50 transition-colors"
          title="Назад"
        >
          <Icon name="ArrowLeft" size={20} className="text-muted-foreground hover:text-foreground" />
        </button>
        
        <CardHeader className="space-y-2 pt-6">
          <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icon name="Truck" size={32} className="text-accent-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Завершение регистрации
          </CardTitle>
          <CardDescription className="text-center">
            Заполните дополнительную информацию
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-start gap-2 mb-4">
            <Icon name="CheckCircle2" size={20} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-green-900 dark:text-green-100">
                Данные из Telegram получены
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                ФИО: {fullName}
                {telegramData.username && ` • @${telegramData.username}`}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3 pb-4 border-b">
              <Label className="text-sm font-semibold">Тип пользователя *</Label>
              <RadioGroup value={userType} onValueChange={(val: any) => setUserType(val)} className="grid grid-cols-3 gap-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="client" id="client" />
                  <Label htmlFor="client" className="cursor-pointer flex items-center gap-1 text-xs">
                    <Icon name="Package" size={14} />
                    Клиент
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="carrier" id="carrier" />
                  <Label htmlFor="carrier" className="cursor-pointer flex items-center gap-1 text-xs">
                    <Icon name="Truck" size={14} />
                    Перевозчик
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="logist" id="logist" />
                  <Label htmlFor="logist" className="cursor-pointer flex items-center gap-1 text-xs">
                    <Icon name="ClipboardList" size={14} />
                    Логист
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">ФИО (можно изменить) *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
                placeholder="Иванов Иван Иванович"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Номер телефона *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+7 (999) 123-45-67"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <div className="space-y-3 pb-4 border-b">
              <Label className="text-sm font-semibold">Тип юридического лица</Label>
              <RadioGroup value={formData.entity_type} onValueChange={(val: any) => setFormData({ ...formData, entity_type: val })} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="individual" id="individual" />
                  <Label htmlFor="individual" className="cursor-pointer text-sm">Физ. лицо</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="legal" id="legal" />
                  <Label htmlFor="legal" className="cursor-pointer text-sm">Юр. лицо</Label>
                </div>
              </RadioGroup>
            </div>

            {formData.entity_type === 'legal' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="organization_name">Название организации *</Label>
                  <Input
                    id="organization_name"
                    value={formData.organization_name}
                    onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                    placeholder="ООО «Ромашка»"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="inn">ИНН *</Label>
                  <Input
                    id="inn"
                    value={formData.inn}
                    onChange={(e) => setFormData({ ...formData, inn: e.target.value })}
                    placeholder="1234567890"
                    required
                  />
                </div>
              </>
            )}

            <div className="flex items-start space-x-2 pt-4">
              <input
                type="checkbox"
                id="agree_terms"
                checked={formData.agree_terms}
                onChange={(e) => setFormData({ ...formData, agree_terms: e.target.checked })}
                className="mt-1"
              />
              <Label htmlFor="agree_terms" className="text-xs cursor-pointer">
                Я принимаю{' '}
                <a href="/terms" target="_blank" className="text-primary hover:underline">
                  Условия использования
                </a>
                {' '}и{' '}
                <a href="/privacy" target="_blank" className="text-primary hover:underline">
                  Политику конфиденциальности
                </a>
              </Label>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Регистрация...' : 'Завершить регистрацию'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TelegramRegistrationForm;