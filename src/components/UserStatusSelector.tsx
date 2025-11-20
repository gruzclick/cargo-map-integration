import { useState } from 'react';
import Icon from '@/components/ui/icon';

interface UserStatusSelectorProps {
  onStatusSelect: (status: 'cargo' | 'vehicle') => void;
}

export const UserStatusSelector = ({ onStatusSelect }: UserStatusSelectorProps) => {
  const [selected, setSelected] = useState<'cargo' | 'vehicle' | null>(null);

  const handleSelect = (status: 'cargo' | 'vehicle') => {
    setSelected(status);
    onStatusSelect(status);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#212e3a] rounded-2xl max-w-md w-full p-6 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Добро пожаловать!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Выберите, что вы хотите сделать
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => handleSelect('cargo')}
            className={`p-6 rounded-xl border-2 transition-all ${
              selected === 'cargo'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <div className={`p-4 rounded-full ${
                selected === 'cargo' 
                  ? 'bg-blue-500' 
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}>
                <Icon 
                  name="Package" 
                  size={32} 
                  className={selected === 'cargo' ? 'text-white' : 'text-gray-600 dark:text-gray-300'} 
                />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Отправить груз
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Найду водителя для доставки
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleSelect('vehicle')}
            className={`p-6 rounded-xl border-2 transition-all ${
              selected === 'vehicle'
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600'
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <div className={`p-4 rounded-full ${
                selected === 'vehicle' 
                  ? 'bg-orange-500' 
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}>
                <Icon 
                  name="Truck" 
                  size={32} 
                  className={selected === 'vehicle' ? 'text-white' : 'text-gray-600 dark:text-gray-300'} 
                />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Предложить транспорт
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Найду заказы для перевозки
                </p>
              </div>
            </div>
          </button>
        </div>

        {selected && (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            Вы сможете изменить это в настройках
          </div>
        )}
      </div>
    </div>
  );
};
