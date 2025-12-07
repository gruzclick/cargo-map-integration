import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { PersonalDataTab } from './profile/PersonalDataTab';
import { AddressesTab } from './profile/AddressesTab';
import { VehiclesTab } from './profile/VehiclesTab';
import { secureLocalStorage } from '@/utils/security';

interface UserProfileProps {
  user: any;
  onClose: () => void;
}

export const UserProfile = ({ user, onClose }: UserProfileProps) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'addresses' | 'vehicles'>('personal');
  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  useEffect(() => {
    const handleUserUpdate = (event: CustomEvent) => {
      console.log('UserProfile received update:', event.detail);
      setCurrentUser(event.detail);
    };

    window.addEventListener('userDataUpdated', handleUserUpdate as EventListener);
    return () => window.removeEventListener('userDataUpdated', handleUserUpdate as EventListener);
  }, []);

  return (
    <div className="fixed inset-0 bg-[#f4f4f5] dark:bg-[#18222d] z-50 overflow-y-auto">
      <div className="min-h-screen">
        <div className="sticky top-0 bg-white dark:bg-[#212e3a] border-b border-gray-200 dark:border-[#2b3943] z-10">
          <div className="flex items-center justify-between px-4 py-3 max-w-3xl mx-auto">
            <button onClick={onClose} className="p-2 -ml-2 text-blue-500 hover:bg-gray-100 dark:hover:bg-[#2b3943] rounded-lg transition-colors">
              <Icon name="ArrowLeft" size={24} />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Настройки</h1>
            <div className="w-10"></div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="flex border-b border-gray-200 dark:border-[#2b3943] bg-white dark:bg-[#212e3a]">
            <button
              onClick={() => setActiveTab('personal')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'personal'
                  ? 'text-blue-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Личные данные
              {activeTab === 'personal' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'addresses'
                  ? 'text-blue-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Адреса
              {activeTab === 'addresses' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('vehicles')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'vehicles'
                  ? 'text-blue-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Транспорт
              {activeTab === 'vehicles' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
              )}
            </button>
          </div>

          {activeTab === 'personal' && <PersonalDataTab user={currentUser} />}
          {activeTab === 'addresses' && <AddressesTab user={currentUser} />}
          {activeTab === 'vehicles' && <VehiclesTab user={currentUser} />}
        </div>
      </div>
    </div>
  );
};