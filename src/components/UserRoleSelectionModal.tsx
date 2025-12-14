import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import CargoShipperForm from '@/components/CargoShipperForm';
import CargoCarrierForm from '@/components/CargoCarrierForm';

interface UserRoleSelectionModalProps {
  user: any;
  onComplete: () => void;
}

type Step = 'role-selection' | 'shipper-form' | 'carrier-form';

const UserRoleSelectionModal = ({ user, onComplete }: UserRoleSelectionModalProps) => {
  const [step, setStep] = useState<Step>('role-selection');

  const handleShipperComplete = async (items: any[]) => {
    console.log('Shipper cargo items:', items);
    
    // Здесь будет отправка данных на сервер
    // TODO: Реализовать API endpoint для создания заявок грузоотправителя
    
    alert(`✅ Создано заявок: ${items.length}\n\nВаши заявки будут видны перевозчикам. Ожидайте предложений!`);
    onComplete();
  };

  const handleCarrierComplete = async (vehicles: any[]) => {
    console.log('Carrier vehicles:', vehicles);
    
    // Здесь будет отправка данных на сервер
    // TODO: Реализовать API endpoint для регистрации перевозчиков
    
    alert(`✅ Зарегистрировано автомобилей: ${vehicles.length}\n\nВаш профиль перевозчика активирован. Вы можете просматривать доступные грузы!`);
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {step === 'role-selection' && (
          <div className="p-8">
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

            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start gap-3">
                <Icon name="Shield" size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                    Безопасность превыше всего
                  </p>
                  <p className="text-yellow-800 dark:text-yellow-200">
                    Все перевозчики проходят проверку документов. Грузы застрахованы. Рейтинговая система защищает от мошенников.
                  </p>
                </div>
              </div>
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
    </div>
  );
};

export default UserRoleSelectionModal;
