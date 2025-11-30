import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { secureLocalStorage } from '@/utils/security';

interface RoleSelectionModalProps {
  user: any;
  onComplete: () => void;
}

export const RoleSelectionModal = ({ user, onComplete }: RoleSelectionModalProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState<'role' | 'status'>('role');
  const [role, setRole] = useState<'carrier' | 'logist' | 'client' | null>(null);
  const [carrierStatus, setCarrierStatus] = useState<'free' | 'has_space'>('free');
  const [clientStatus, setClientStatus] = useState<'ready_now' | 'ready_later'>('ready_now');
  const [readyDate, setReadyDate] = useState('');
  const [readyTime, setReadyTime] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = [
    {
      id: 'carrier' as const,
      title: 'Перевозчик',
      description: 'У меня есть транспорт для перевозки грузов',
      icon: 'Truck'
    },
    {
      id: 'logist' as const,
      title: 'Логист',
      description: 'Я организую перевозки и работаю с обеими сторонами',
      icon: 'Users'
    },
    {
      id: 'client' as const,
      title: 'Клиент',
      description: 'Мне нужно отправить груз',
      icon: 'Package'
    }
  ];

  const handleRoleSelect = (selectedRole: 'carrier' | 'logist' | 'client') => {
    setRole(selectedRole);
    setStep('status');
  };

  const handleSave = async () => {
    if (!role) {
      toast({
        title: 'Ошибка',
        description: 'Выберите роль',
        variant: 'destructive'
      });
      return;
    }

    if (clientStatus === 'ready_later' && (!readyDate || !readyTime)) {
      toast({
        title: 'Ошибка',
        description: 'Укажите дату и время готовности',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const readyDateTime = clientStatus === 'ready_later' && readyDate && readyTime
        ? new Date(`${readyDate}T${readyTime}`).toISOString()
        : null;

      let backendSuccess = false;

      try {
        const response = await fetch('https://functions.poehali.dev/f06efb37-9437-4df8-8032-f2ba53b2e2d6', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update_role_status',
            user_id: user.user_id || user.id,
            phone_number: user.phone,
            role,
            carrier_status: role === 'carrier' || role === 'logist' ? carrierStatus : null,
            client_status: role === 'client' || role === 'logist' ? clientStatus : null,
            client_ready_date: readyDateTime
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            backendSuccess = true;
            
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                async (position) => {
                  try {
                    await fetch('https://functions.poehali.dev/f06efb37-9437-4df8-8032-f2ba53b2e2d6', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        action: 'update_profile',
                        user_id: user.user_id || user.id,
                        phone_number: user.phone,
                        current_lat: position.coords.latitude,
                        current_lng: position.coords.longitude
                      })
                    });
                  } catch (err) {
                    console.error('Failed to update location:', err);
                  }
                }
              );
            }
          }
        }
      } catch (backendError) {
        console.log('Backend unavailable, using local storage:', backendError);
      }

      if (!backendSuccess) {
        console.log('Saving role and status to local storage');
        const userData = secureLocalStorage.get('user_data');
        if (userData) {
          const updatedUser = JSON.parse(userData);
          updatedUser.role = role;
          updatedUser.role_status_set = true;
          updatedUser.carrier_status = role === 'carrier' || role === 'logist' ? carrierStatus : null;
          updatedUser.client_status = role === 'client' || role === 'logist' ? clientStatus : null;
          updatedUser.client_ready_date = readyDateTime;
          console.log('Updated user data:', updatedUser);
          secureLocalStorage.set('user_data', JSON.stringify(updatedUser));
          console.log('User data saved successfully');
        } else {
          console.error('No user_data found in storage');
        }
        
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              localStorage.setItem('user_location', JSON.stringify({
                lat: position.coords.latitude,
                lng: position.coords.longitude
              }));
            }
          );
        }
      }

      toast({
        title: 'Роль и статус установлены',
        description: 'Ваш профиль настроен'
      });

      setTimeout(() => {
        onComplete();
      }, 500);
    } catch (error: any) {
      console.error('Ошибка сохранения роли:', error);
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось сохранить данные',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#212e3a] rounded-2xl max-w-lg w-full p-6 space-y-6 relative">
        <button
          onClick={onComplete}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label="Закрыть"
        >
          <Icon name="X" size={24} />
        </button>
        
        {step === 'role' && (
          <>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Выберите вашу роль
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Это поможет нам настроить интерфейс под ваши задачи
              </p>
            </div>

            <div className="space-y-3">
              {roles.map((roleOption) => (
                <button
                  key={roleOption.id}
                  onClick={() => handleRoleSelect(roleOption.id)}
                  className="w-full p-4 border-2 border-gray-200 dark:border-[#2b3943] rounded-xl hover:border-blue-500 dark:hover:border-blue-500 transition-all flex items-center gap-4 text-left group"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                    <Icon 
                      name={roleOption.icon as any} 
                      size={24} 
                      className="text-blue-600 dark:text-blue-400 group-hover:text-white"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {roleOption.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {roleOption.description}
                    </p>
                  </div>
                  <Icon 
                    name="ChevronRight" 
                    size={20} 
                    className="text-gray-400 group-hover:text-blue-500"
                  />
                </button>
              ))}
            </div>
          </>
        )}

        {step === 'status' && role && (
          <>
            <div className="space-y-2">
              <button
                onClick={() => setStep('role')}
                className="text-blue-500 hover:text-blue-600 flex items-center gap-1"
              >
                <Icon name="ChevronLeft" size={20} />
                Назад
              </button>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Укажите ваш статус
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                {role === 'carrier' && 'Текущее состояние вашего транспорта'}
                {role === 'client' && 'Готовность груза к отправке'}
                {role === 'logist' && 'Укажите статусы для обеих ролей'}
              </p>
            </div>

            <div className="space-y-4">
              {(role === 'carrier' || role === 'logist') && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Статус транспорта
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setCarrierStatus('free')}
                      className={`p-3 border-2 rounded-lg transition-all ${
                        carrierStatus === 'free'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-[#2b3943]'
                      }`}
                    >
                      <Icon 
                        name="CheckCircle2" 
                        size={20} 
                        className={carrierStatus === 'free' ? 'text-blue-500 mx-auto mb-1' : 'text-gray-400 mx-auto mb-1'}
                      />
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Свободен
                      </p>
                    </button>
                    <button
                      onClick={() => setCarrierStatus('has_space')}
                      className={`p-3 border-2 rounded-lg transition-all ${
                        carrierStatus === 'has_space'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-[#2b3943]'
                      }`}
                    >
                      <Icon 
                        name="TrendingUp" 
                        size={20} 
                        className={carrierStatus === 'has_space' ? 'text-blue-500 mx-auto mb-1' : 'text-gray-400 mx-auto mb-1'}
                      />
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Есть места
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {(role === 'client' || role === 'logist') && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Готовность груза
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setClientStatus('ready_now')}
                      className={`p-3 border-2 rounded-lg transition-all ${
                        clientStatus === 'ready_now'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-[#2b3943]'
                      }`}
                    >
                      <Icon 
                        name="Zap" 
                        size={20} 
                        className={clientStatus === 'ready_now' ? 'text-blue-500 mx-auto mb-1' : 'text-gray-400 mx-auto mb-1'}
                      />
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Готов сейчас
                      </p>
                    </button>
                    <button
                      onClick={() => setClientStatus('ready_later')}
                      className={`p-3 border-2 rounded-lg transition-all ${
                        clientStatus === 'ready_later'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-[#2b3943]'
                      }`}
                    >
                      <Icon 
                        name="Clock" 
                        size={20} 
                        className={clientStatus === 'ready_later' ? 'text-blue-500 mx-auto mb-1' : 'text-gray-400 mx-auto mb-1'}
                      />
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Будет готов
                      </p>
                    </button>
                  </div>

                  {clientStatus === 'ready_later' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Дата
                        </label>
                        <input
                          type="date"
                          value={readyDate}
                          onChange={(e) => setReadyDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-[#2b3943] rounded-lg bg-white dark:bg-[#1c2733] text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Время
                        </label>
                        <input
                          type="time"
                          value={readyTime}
                          onChange={(e) => setReadyTime(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-[#2b3943] rounded-lg bg-white dark:bg-[#1c2733] text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors mt-6"
              >
                {loading ? 'Сохранение...' : 'Продолжить'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};