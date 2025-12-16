import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface ProfileData {
  name: string;
  passport_series: string;
  passport_number: string;
  phone: string;
}

interface ProfileCompletionModalProps {
  userId: string;
  onComplete: (profile: ProfileData) => void;
}

export const ProfileCompletionModal = ({ userId, onComplete }: ProfileCompletionModalProps) => {
  const [formData, setFormData] = useState<ProfileData>({
    name: '',
    passport_series: '',
    passport_number: '',
    phone: ''
  });
  const [errors, setErrors] = useState<Partial<ProfileData>>({});

  useEffect(() => {
    // Проверяем, есть ли уже профиль
    const existingProfile = localStorage.getItem(`user_profile_${userId}`);
    if (existingProfile) {
      const profile = JSON.parse(existingProfile);
      onComplete(profile);
    }
  }, [userId]);

  const validate = (): boolean => {
    const newErrors: Partial<ProfileData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Введите ФИО';
    }

    if (!formData.passport_series || formData.passport_series.length !== 4) {
      newErrors.passport_series = 'Серия должна содержать 4 цифры';
    }

    if (!formData.passport_number || formData.passport_number.length !== 6) {
      newErrors.passport_number = 'Номер должен содержать 6 цифр';
    }

    const phoneRegex = /^[78]\d{10}$/;
    if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Неверный формат телефона';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    // Сохраняем профиль
    localStorage.setItem(`user_profile_${userId}`, JSON.stringify(formData));
    
    onComplete(formData);
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Убираем ошибку при вводе
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const formatPassportSeries = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    handleInputChange('passport_series', digits);
  };

  const formatPassportNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 6);
    handleInputChange('passport_number', digits);
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    handleInputChange('phone', digits);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
            <Icon name="UserCheck" size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Заполните профиль</h2>
            <p className="text-sm text-gray-500">
              Это нужно для отображения вашей заявки
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">ФИО полностью *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Иванов Иван Иванович"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="passport_series">Серия паспорта *</Label>
              <Input
                id="passport_series"
                type="text"
                value={formData.passport_series}
                onChange={(e) => formatPassportSeries(e.target.value)}
                placeholder="1234"
                maxLength={4}
                className={errors.passport_series ? 'border-red-500' : ''}
              />
              {errors.passport_series && (
                <p className="text-xs text-red-500 mt-1">{errors.passport_series}</p>
              )}
            </div>

            <div>
              <Label htmlFor="passport_number">Номер паспорта *</Label>
              <Input
                id="passport_number"
                type="text"
                value={formData.passport_number}
                onChange={(e) => formatPassportNumber(e.target.value)}
                placeholder="123456"
                maxLength={6}
                className={errors.passport_number ? 'border-red-500' : ''}
              />
              {errors.passport_number && (
                <p className="text-xs text-red-500 mt-1">{errors.passport_number}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Телефон *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => formatPhone(e.target.value)}
              placeholder="79001234567"
              maxLength={11}
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
            )}
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg flex items-start gap-2">
            <Icon name="Shield" size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Ваши данные защищены и используются только для идентификации 
              при совершении сделок
            </p>
          </div>

          <Button type="submit" className="w-full" size="lg">
            <Icon name="CheckCircle" size={18} className="mr-2" />
            Сохранить и продолжить
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ProfileCompletionModal;
