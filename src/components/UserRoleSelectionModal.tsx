import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import CargoShipperForm from '@/components/CargoShipperForm';
import CargoCarrierForm from '@/components/CargoCarrierForm';
import { saveOrder, addNotification } from '@/utils/orderStorage';
import { OrderShipper, OrderCarrier } from '@/types/order';

interface UserRoleSelectionModalProps {
  user: any;
  onComplete: () => void;
}

type Step = 'role-selection' | 'shipper-form' | 'carrier-form' | 'success';

const UserRoleSelectionModal = ({ user, onComplete }: UserRoleSelectionModalProps) => {
  const [step, setStep] = useState<Step>('role-selection');
  const [successMessage, setSuccessMessage] = useState('');

  const handleShipperComplete = async (items: any[]) => {
    const order: OrderShipper = {
      id: crypto.randomUUID(),
      type: 'shipper',
      userId: user.id,
      userName: user.name || user.email,
      userPhone: items[0]?.contactPhone || '',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: items
    };
    
    saveOrder(order);
    setSuccessMessage(`Заявка создана!`);
    setTimeout(() => {
      setSuccessMessage('');
      setStep('role-selection');
    }, 2000);
  };

  const handleCarrierComplete = async (vehicles: any[]) => {
    const order: OrderCarrier = {
      id: crypto.randomUUID(),
      type: 'carrier',
      userId: user.id,
      userName: user.name || user.email,
      userPhone: vehicles[0]?.driverPhone || '',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      vehicles: vehicles
    };
    
    saveOrder(order);
    setSuccessMessage(`Заявка создана!`);
    setTimeout(() => {
      setSuccessMessage('');
      setStep('role-selection');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {step === 'role-selection' && (
          <div className="p-8 relative">
            <button
              onClick={onComplete}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors z-10"
            >
              <Icon name="X" size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
            
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mb-4">
                <Icon name="Truck" size={32} className="text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Добро пожаловать!</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Выберите, что вы хотите сделать
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => setStep('shipper-form')}
                className="group relative p-8 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-600 dark:hover:border-blue-500 transition-all hover:shadow-xl bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/10 dark:to-gray-800"
              >
                <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Icon name="Package" size={80} />
                </div>
                
                <div className="relative">
                  <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon name="Package" size={32} className="text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2">Отправить груз</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    Создайте заявку на доставку груза до склада маркетплейса
                  </p>
                  
                  <div className="space-y-2 text-left">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Icon name="CheckCircle" size={16} className="text-green-600 flex-shrink-0" />
                      <span>Выбор склада из базы</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Icon name="CheckCircle" size={16} className="text-green-600 flex-shrink-0" />
                      <span>Термонаклейки 75×120 и 58×40</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Icon name="CheckCircle" size={16} className="text-green-600 flex-shrink-0" />
                      <span>Несколько грузов за раз</span>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <div className="inline-flex items-center gap-2 text-blue-600 font-medium">
                      Начать
                      <Icon name="ArrowRight" size={20} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setStep('carrier-form')}
                className="group relative p-8 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-green-600 dark:hover:border-green-500 transition-all hover:shadow-xl bg-gradient-to-br from-green-50 to-white dark:from-green-900/10 dark:to-gray-800"
              >
                <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Icon name="Truck" size={80} />
                </div>
                
                <div className="relative">
                  <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon name="Truck" size={32} className="text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2">Перевезти груз</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    Зарегистрируйте автомобиль и получайте заказы на доставку
                  </p>
                  
                  <div className="space-y-2 text-left">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Icon name="CheckCircle" size={16} className="text-green-600 flex-shrink-0" />
                      <span>Регистрация водителя и авто</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Icon name="CheckCircle" size={16} className="text-green-600 flex-shrink-0" />
                      <span>Проверка госномера</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Icon name="CheckCircle" size={16} className="text-green-600 flex-shrink-0" />
                      <span>Несколько автомобилей</span>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <div className="inline-flex items-center gap-2 text-green-600 font-medium">
                      Начать
                      <Icon name="ArrowRight" size={20} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </button>
            </div>


          </div>
        )}

        {step === 'shipper-form' && (
          <CargoShipperForm
            onComplete={handleShipperComplete}
            onBack={() => setStep('role-selection')}
          />
        )}

        {step === 'carrier-form' && (
          <CargoCarrierForm
            onComplete={handleCarrierComplete}
            onBack={() => setStep('role-selection')}
          />
        )}

      </div>
      
      {successMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-[60] flex items-center gap-3">
          <Icon name="CheckCircle" size={24} />
          <span>Заявка создана!</span>
        </div>
      )}
    </div>
  );
};

export default UserRoleSelectionModal;