import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { ImageCropper } from '@/components/ImageCropper';
import { secureLocalStorage } from '@/utils/security';

interface PersonalDataTabProps {
  user: any;
}

export const PersonalDataTab = ({ user }: PersonalDataTabProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone_number || '');
  const [telegram, setTelegram] = useState(user?.telegram || '');
  const [company, setCompany] = useState(user?.company || '');
  const [inn, setInn] = useState(user?.inn || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [tempAvatar, setTempAvatar] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);

  useEffect(() => {
    console.log('User prop changed:', user);
    if (user) {
      setFullName(user.full_name || '');
      setPhone(user.phone_number || '');
      setTelegram(user.telegram || '');
      setCompany(user.company || '');
      setInn(user.inn || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Ошибка',
        description: 'Размер файла не должен превышать 5 МБ',
        variant: 'destructive'
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setTempAvatar(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedImage: string) => {
    setAvatar(croppedImage);
    setShowCropper(false);
    setTempAvatar(null);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setTempAvatar(null);
  };

  const handleSaveProfile = async () => {
    console.log('Saving profile...', { fullName, phone, telegram, company, inn, avatar });
    
    if (!fullName || !phone) {
      toast({
        title: 'Ошибка',
        description: 'ФИО и телефон обязательны для заполнения',
        variant: 'destructive'
      });
      return;
    }

    try {
      const userId = user?.user_id || user?.id;
      console.log('Sending to backend, user_id:', userId);
      
      const response = await fetch('https://functions.poehali.dev/1ff38065-516a-4892-8531-03c46020b273', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Id': userId
        },
        body: JSON.stringify({
          full_name: fullName,
          phone_number: phone,
          telegram,
          company,
          inn,
          avatar
        })
      });

      const data = await response.json();
      console.log('Backend response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Не удалось сохранить данные на сервере');
      }

      if (data.success && data.user) {
        console.log('Profile updated successfully on server');
        
        // Обновляем localStorage с данными с сервера
        secureLocalStorage.set('user_data', JSON.stringify(data.user));
        
        // Отправляем событие для обновления всех компонентов
        window.dispatchEvent(new CustomEvent('userDataUpdated', { detail: data.user }));
        
        toast({
          title: 'Профиль обновлен',
          description: 'Ваши данные успешно сохранены и синхронизированы'
        });
        
        return; // Выходим, если успешно сохранили на сервере
      }
    } catch (backendError) {
      console.error('Backend error:', backendError);
      toast({
        title: 'Ошибка сохранения',
        description: backendError instanceof Error ? backendError.message : 'Не удалось сохранить данные',
        variant: 'destructive'
      });
    }
  };

  return (
    <>
      {showCropper && tempAvatar && (
        <ImageCropper
          image={tempAvatar}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={1}
          shape="round"
        />
      )}
      
      <div className="bg-white dark:bg-[#212e3a]">
        <div className="p-4 flex flex-col items-center">
        <div className="relative mb-4">
          <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-[#1c2733] flex items-center justify-center overflow-hidden">
            {avatar ? (
              <img src={avatar} alt="Аватар" className="w-full h-full object-cover" />
            ) : (
              <Icon name="User" size={48} className="text-gray-400" />
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
          >
            <Icon name="Camera" size={20} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>
      </div>
      <div className="p-4 space-y-2">
        <SettingItem label="ФИО" value={fullName} onChange={setFullName} required helperText="Обязательно для безопасных сделок" />
        <SettingItem label="Телефон" value={phone} onChange={setPhone} type="tel" required helperText="Для связи и подтверждения сделок" />
        <SettingItem label="Telegram" value={telegram} onChange={setTelegram} placeholder="@username" recommended helperText="Рекомендуется для быстрой связи" />
        <SettingItem label="Компания" value={company} onChange={setCompany} recommended helperText="Повышает доверие контрагентов" />
        <SettingItem label="ИНН" value={inn} onChange={setInn} recommended helperText="Подтверждает легальность бизнеса" />
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
    </>
  );
};

const SettingItem = ({ label, value, onChange, type = 'text', placeholder = '', required = false, recommended = false, helperText = '' }: any) => (
  <div className="bg-gray-50 dark:bg-[#1c2733] rounded-lg p-3">
    <div className="flex items-center justify-between mb-1">
      <label className="block text-xs text-gray-500 dark:text-gray-400">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {recommended && <span className="text-blue-500 text-[10px] ml-1">реком.</span>}
      </label>
    </div>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white text-base"
    />
    {helperText && (
      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{helperText}</p>
    )}
  </div>
);