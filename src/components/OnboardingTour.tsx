import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface TourStep {
  title: string;
  description: string;
  target?: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const driverSteps: TourStep[] = [
  {
    title: 'Добро пожаловать, водитель!',
    description: 'Давайте быстро покажем, как найти грузы и начать зарабатывать.',
    position: 'center'
  },
  {
    title: 'Выберите свой статус',
    description: 'Укажите, свободны вы, есть места или автомобиль заполнен. Это поможет клиентам найти вас на карте.',
    position: 'top'
  },
  {
    title: 'Карта грузов в реальном времени',
    description: 'Здесь отображаются все доступные грузы. Зелёные — готовы к отгрузке, жёлтые — будут готовы ко времени.',
    position: 'top'
  },
  {
    title: 'Поиск по маршруту',
    description: 'Введите откуда и куда едете — система покажет грузы по вашему маршруту. Можно сохранить маршрут в избранное!',
    position: 'top'
  },
  {
    title: 'Типы грузов',
    description: 'Выберите, какие грузы готовы везти: коробки, паллеты или негабарит. Система покажет подходящие заказы.',
    position: 'top'
  }
];

const clientSteps: TourStep[] = [
  {
    title: 'Добро пожаловать, клиент!',
    description: 'Покажем, как быстро найти надёжного перевозчика для вашего груза.',
    position: 'center'
  },
  {
    title: 'Статус груза',
    description: 'Укажите готовность груза: "Готов к отгрузке" (зелёный на карте) или "Будет готов ко времени" (жёлтый).',
    position: 'top'
  },
  {
    title: 'Карта водителей онлайн',
    description: 'Все свободные водители отображаются на карте. Зелёные — свободны, жёлтые — есть места, красные — заняты.',
    position: 'top'
  },
  {
    title: 'Поиск по маршруту',
    description: 'Введите маршрут доставки — система найдёт водителей, которые едут в нужном направлении.',
    position: 'top'
  },
  {
    title: 'Выбор транспорта',
    description: 'Укажите тип транспорта и параметры груза. Для легкового — только коробки, для грузового — паллеты и негабарит.',
    position: 'top'
  }
];

interface OnboardingTourProps {
  userRole: 'driver' | 'client' | null;
  onComplete: () => void;
}

const OnboardingTour = ({ userRole, onComplete }: OnboardingTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem(`onboarding_${userRole}_completed`);
    if (!hasSeenTour && userRole) {
      setIsVisible(true);
    }
  }, [userRole]);

  if (!isVisible || !userRole) return null;

  const steps = userRole === 'driver' ? driverSteps : clientSteps;
  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem(`onboarding_${userRole}_completed`, 'true');
    setIsVisible(false);
    onComplete();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" onClick={handleSkip} />
      
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <Card className="max-w-md w-full pointer-events-auto animate-scale-in">
          <CardContent className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <Icon name={userRole === 'driver' ? 'Truck' : 'Package'} size={20} className="text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-1">{currentStepData.title}</h3>
                <p className="text-sm text-muted-foreground">{currentStepData.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    index <= currentStep ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={handleSkip} className="text-xs">
                Пропустить
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {currentStep + 1} из {steps.length}
                </span>
                <Button onClick={handleNext} size="sm">
                  {currentStep < steps.length - 1 ? 'Далее' : 'Понятно'}
                  <Icon name="ChevronRight" size={16} className="ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default OnboardingTour;
