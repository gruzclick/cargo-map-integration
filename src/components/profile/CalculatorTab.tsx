import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useState } from 'react';
import PriceCalculator from '@/components/PriceCalculator';

const CalculatorTab = () => {
  const [distance, setDistance] = useState('');
  const [weight, setWeight] = useState('');

  const calculatePrice = () => {
    const distanceNum = parseFloat(distance);
    const weightNum = parseFloat(weight);
    
    if (isNaN(distanceNum) || isNaN(weightNum)) {
      return 0;
    }
    
    const baseRate = 50;
    const distanceRate = 15;
    const weightRate = 100;
    
    return baseRate + (distanceNum * distanceRate) + (weightNum * weightRate);
  };

  const estimatedPrice = calculatePrice();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Calculator" size={20} />
            Быстрый расчёт стоимости
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Расстояние (км)</label>
              <Input
                type="number"
                placeholder="100"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Вес груза (кг)</label>
              <Input
                type="number"
                placeholder="500"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
          </div>

          {estimatedPrice > 0 && (
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-sm text-green-700 dark:text-green-300 mb-1">
                Примерная стоимость
              </div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {estimatedPrice.toLocaleString('ru-RU')} ₽
              </div>
              <div className="text-xs text-green-600 dark:text-green-400 mt-2">
                * Итоговая цена зависит от типа транспорта и условий доставки
              </div>
            </div>
          )}

          <Button variant="outline" className="w-full">
            <Icon name="FileText" size={16} className="mr-2" />
            Создать коммерческое предложение
          </Button>
        </CardContent>
      </Card>

      <PriceCalculator />
    </div>
  );
};

export default CalculatorTab;
