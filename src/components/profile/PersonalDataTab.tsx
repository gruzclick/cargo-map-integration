import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PersonalDataTabProps {
  user: any;
}

export const PersonalDataTab = ({ user }: PersonalDataTabProps) => {
  const { toast } = useToast();
  
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone_number || '');
  const [telegram, setTelegram] = useState(user?.telegram || '');
  const [email, setEmail] = useState(user?.email || '');
  const [company, setCompany] = useState(user?.company || '');
  const [inn, setInn] = useState(user?.inn || '');

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/f06efb37-9437-4df8-8032-f2ba53b2e2d6', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_profile',
          user_id: user.id,
          full_name: fullName,
          phone_number: phone,
          telegram,
          email,
          company,
          inn
        })
      });

      if (response.ok) {
        toast({
          title: 'Профиль обновлен',
          description: 'Ваши данные успешно сохранены'
        });
      } else {
        throw new Error('Ошибка сохранения');
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="bg-white dark:bg-[#212e3a]">
      <div className="p-4 space-y-2">
        <SettingItem label="ФИО" value={fullName} onChange={setFullName} />
        <SettingItem label="Телефон" value={phone} onChange={setPhone} type="tel" />
        <SettingItem label="Telegram" value={telegram} onChange={setTelegram} placeholder="@username" />
        <SettingItem label="Email" value={email} onChange={setEmail} type="email" />
        <SettingItem label="Компания" value={company} onChange={setCompany} />
        <SettingItem label="ИНН" value={inn} onChange={setInn} />
      </div>
      <div className="p-4">
        <button
          onClick={handleSaveProfile}
          className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
        >
          Сохранить изменения
        </button>
      </div>
    </div>
  );
};

const SettingItem = ({ label, value, onChange, type = 'text', placeholder = '' }: any) => (
  <div className="bg-gray-50 dark:bg-[#1c2733] rounded-lg p-3">
    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white text-base"
    />
  </div>
);
