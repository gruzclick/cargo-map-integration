import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CalculatorResult {
  basePrice: number;
  additionalServices: number;
  total: number;
  pricePerKm: number;
}

const PriceCalculator = () => {
  const [distance, setDistance] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [vehicleType, setVehicleType] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [unloading, setUnloading] = useState(false);
  const [insurance, setInsurance] = useState(false);
  const [express, setExpress] = useState(false);
  const [result, setResult] = useState<CalculatorResult | null>(null);

  const vehicleRates: Record<string, number> = {
    'light': 25,
    'medium': 35,
    'heavy': 50,
    'mega': 70
  };

  const calculatePrice = () => {
    const dist = parseFloat(distance);
    const wt = parseFloat(weight);

    if (!dist || !wt || !vehicleType) {
      alert('Заполните все поля');
      return;
    }

    const ratePerKm = vehicleRates[vehicleType];
    const basePrice = dist * ratePerKm;

    let additionalServices = 0;
    if (loading) additionalServices += 1000;
    if (unloading) additionalServices += 1000;
    if (insurance) additionalServices += basePrice * 0.03;
    if (express) additionalServices += basePrice * 0.2;

    const total = basePrice + additionalServices;

    setResult({
      basePrice,
      additionalServices,
      total,
      pricePerKm: ratePerKm
    });
  };

  const currency = localStorage.getItem('user_currency') || '₽';

  return (
    <Card className="max-w-2xl mx-auto border-none shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Calculator" size={24} className="text-purple-500" />
          Калькулятор стоимости доставки
        </CardTitle>
        <CardDescription>
          Рассчитайте примерную стоимость перевозки груза
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="distance">Расстояние (км)</Label>
            <Input
              id="distance"
              type="number"
              placeholder="500"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">Вес груза (кг)</Label>
            <Input
              id="weight"
              type="number"
              placeholder="1000"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="vehicle">Тип транспорта</Label>
          <Select value={vehicleType} onValueChange={setVehicleType}>
            <SelectTrigger id="vehicle">
              <SelectValue placeholder="Выберите тип транспорта" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Легкий (до 1.5т) - 25{currency}/км</SelectItem>
              <SelectItem value="medium">Средний (до 5т) - 35{currency}/км</SelectItem>
              <SelectItem value="heavy">Тяжелый (до 20т) - 50{currency}/км</SelectItem>
              <SelectItem value="mega">Фура (20т+) - 70{currency}/км</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Label className="text-sm font-semibold">Дополнительные услуги</Label>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Package" size={16} className="text-blue-500" />
              <span className="text-sm">Погрузка</span>
            </div>
            <Button
              variant={loading ? "default" : "outline"}
              size="sm"
              onClick={() => setLoading(!loading)}
            >
              {loading ? '✓' : '+'} 1000{currency}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="PackageOpen" size={16} className="text-green-500" />
              <span className="text-sm">Разгрузка</span>
            </div>
            <Button
              variant={unloading ? "default" : "outline"}
              size="sm"
              onClick={() => setUnloading(!unloading)}
            >
              {unloading ? '✓' : '+'} 1000{currency}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Shield" size={16} className="text-purple-500" />
              <span className="text-sm">Страхование груза (3%)</span>
            </div>
            <Button
              variant={insurance ? "default" : "outline"}
              size="sm"
              onClick={() => setInsurance(!insurance)}
            >
              {insurance ? '✓ Вкл' : '+ Добавить'}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Zap" size={16} className="text-yellow-500" />
              <span className="text-sm">Срочная доставка (+20%)</span>
            </div>
            <Button
              variant={express ? "default" : "outline"}
              size="sm"
              onClick={() => setExpress(!express)}
            >
              {express ? '✓ Вкл' : '+ Добавить'}
            </Button>
          </div>
        </div>

        <Button 
          onClick={calculatePrice} 
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          size="lg"
        >
          <Icon name="Calculator" size={18} className="mr-2" />
          Рассчитать стоимость
        </Button>

        {result && (
          <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-xl border-2 border-blue-200 dark:border-blue-800 animate-scale-in">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">Базовая стоимость:</span>
                <span className="font-semibold">{result.basePrice.toFixed(0)} {currency}</span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">Доп. услуги:</span>
                <span className="font-semibold">{result.additionalServices.toFixed(0)} {currency}</span>
              </div>

              <div className="border-t-2 border-dashed border-gray-300 dark:border-gray-600 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Итого:</span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {result.total.toFixed(0)} {currency}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  ≈ {result.pricePerKm} {currency}/км
                </p>
              </div>

              <div className="mt-4 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  💡 <strong>Это примерная стоимость.</strong> Финальная цена определяется 
                  водителем с учётом сложности маршрута, времени суток и других факторов.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PriceCalculator;
