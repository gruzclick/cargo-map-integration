import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { ImageCropper } from '@/components/ImageCropper';

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
          company,
          inn,
          avatar
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
        <SettingItem label="ФИО" value={fullName} onChange={setFullName} />
        <SettingItem label="Телефон" value={phone} onChange={setPhone} type="tel" />
        <SettingItem label="Telegram" value={telegram} onChange={setTelegram} placeholder="@username" />
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
    </>
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