import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const CargoInsurance = () => {
  const { toast } = useToast();
  const [cargoValue, setCargoValue] = useState('');
  const [insuranceCost, setInsuranceCost] = useState(0);

  const calculateInsurance = () => {
    const value = parseFloat(cargoValue);
    if (value > 0) {
      const cost = value * 0.015;
      setInsuranceCost(cost);
    }
  };

  const handlePurchase = () => {
    toast({
      title: 'Страховка оформлена',
      description: `Ваш груз застрахован на сумму ${parseFloat(cargoValue).toLocaleString()} ₽`
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Shield" size={20} />
          Страхование грузов
        </CardTitle>
        <CardDescription>
          Защитите свой груз от повреждений и утраты
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-2 border-blue-500/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <Icon name="Shield" size={32} className="mx-auto text-blue-600 mb-2" />
                <h3 className="font-semibold mb-1">Базовая</h3>
                <p className="text-2xl font-bold text-blue-600 mb-2">1.5%</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">от стоимости груза</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Icon name="ShieldCheck" size={32} className="mx-auto text-green-600 mb-2" />
                <h3 className="font-semibold mb-1">Расширенная</h3>
                <p className="text-2xl font-bold text-green-600 mb-2">2.5%</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">+ форс-мажор</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Icon name="ShieldAlert" size={32} className="mx-auto text-purple-600 mb-2" />
                <h3 className="font-semibold mb-1">Премиум</h3>
                <p className="text-2xl font-bold text-purple-600 mb-2">3.5%</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">+ полное покрытие</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">Калькулятор страховки</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="cargo-value">Стоимость груза (₽)</Label>
                <Input
                  id="cargo-value"
                  type="number"
                  placeholder="100000"
                  value={cargoValue}
                  onChange={(e) => setCargoValue(e.target.value)}
                  className="mt-1.5"
                />
              </div>

              <Button onClick={calculateInsurance} className="w-full">
                Рассчитать стоимость
              </Button>

              {insuranceCost > 0 && (
                <div className="p-4 bg-white dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Стоимость страховки:</span>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {insuranceCost.toLocaleString()} ₽
                    </span>
                  </div>
                  <Button onClick={handlePurchase} className="w-full">
                    <Icon name="ShieldCheck" size={18} className="mr-2" />
                    Оформить страховку
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2 text-sm">
          <p className="font-semibold">Что покрывает страховка:</p>
          <div className="space-y-1 text-gray-600 dark:text-gray-400">
            <p className="flex items-center gap-2">
              <Icon name="Check" size={14} className="text-green-600" />
              Повреждение груза при транспортировке
            </p>
            <p className="flex items-center gap-2">
              <Icon name="Check" size={14} className="text-green-600" />
              Утрата груза
            </p>
            <p className="flex items-center gap-2">
              <Icon name="Check" size={14} className="text-green-600" />
              ДТП с участием транспорта
            </p>
            <p className="flex items-center gap-2">
              <Icon name="Check" size={14} className="text-green-600" />
              Хищение груза
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CargoInsurance;
