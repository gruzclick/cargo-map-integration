import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface StatusSelectorProps {
  userType: 'driver' | 'client';
  status: string;
  onStatusChange: (status: string) => void;
}

const StatusSelector = ({ userType, status, onStatusChange }: StatusSelectorProps) => {
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isDateTimeOpen, setIsDateTimeOpen] = useState(false);
  const [isSpaceOpen, setIsSpaceOpen] = useState(false);
  const [cargoType, setCargoType] = useState<'boxes' | 'pallets'>('boxes');
  const [cargoQuantity, setCargoQuantity] = useState('');

  const handleScheduledClick = () => {
    if (status === 'scheduled' && scheduledDate && scheduledTime) {
      setIsDateTimeOpen(true);
    } else {
      setIsDateTimeOpen(true);
    }
  };

  const handleSaveDateTime = () => {
    if (scheduledDate && scheduledTime) {
      onStatusChange('scheduled');
      setIsDateTimeOpen(false);
    }
  };

  const handleSaveSpace = () => {
    if (cargoQuantity) {
      onStatusChange('has_space');
      setIsSpaceOpen(false);
    }
  };

  if (userType === 'driver') {
    return (
      <div className="flex flex-col gap-1.5">
        <Button
          variant={status === 'free' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onStatusChange('free')}
          className="justify-start text-[10px] md:text-xs h-7 md:h-8 border-0"
          style={status === 'free' ? { backgroundColor: '#22c55e' } : {}}
        >
          <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5" />
          Легковые
        </Button>
        <Popover open={isSpaceOpen} onOpenChange={setIsSpaceOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={status === 'has_space' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsSpaceOpen(true)}
              className="justify-start text-[10px] md:text-xs h-7 md:h-8 border-0"
              style={status === 'has_space' ? { backgroundColor: '#eab308' } : {}}
            >
              <div className="w-2 h-2 rounded-full bg-yellow-500 mr-1.5" />
              {cargoQuantity ? `Грузовые (${cargoQuantity} ${cargoType === 'boxes' ? 'коробок' : 'паллет'})` : 'Грузовые'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3" align="start">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Укажите свободное место</h4>
              <RadioGroup value={cargoType} onValueChange={(value) => setCargoType(value as 'boxes' | 'pallets')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="boxes" id="boxes" />
                  <Label htmlFor="boxes" className="text-sm cursor-pointer">Коробки</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pallets" id="pallets" />
                  <Label htmlFor="pallets" className="text-sm cursor-pointer">Паллеты</Label>
                </div>
              </RadioGroup>
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Количество</label>
                <Input
                  type="number"
                  min="1"
                  value={cargoQuantity}
                  onChange={(e) => setCargoQuantity(e.target.value)}
                  placeholder="Введите количество"
                  className="text-xs h-8"
                />
              </div>
              <Button
                size="sm"
                onClick={handleSaveSpace}
                disabled={!cargoQuantity}
                className="w-full h-8 text-xs"
              >
                Сохранить
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Button
        variant={status === 'ready' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onStatusChange('ready')}
        className="justify-start text-[10px] md:text-xs h-7 md:h-8 border-0"
        style={status === 'ready' ? { backgroundColor: '#22c55e' } : {}}
      >
        <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5" />
        Паллеты
      </Button>
      <Popover open={isDateTimeOpen} onOpenChange={setIsDateTimeOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={status === 'scheduled' ? 'default' : 'outline'}
            size="sm"
            onClick={handleScheduledClick}
            className="justify-start text-[10px] md:text-xs h-7 md:h-8 border-0"
            style={status === 'scheduled' ? { backgroundColor: '#eab308' } : {}}
          >
            <div className="w-2 h-2 rounded-full bg-yellow-500 mr-1.5" />
            {scheduledDate && scheduledTime 
              ? `Короба ${scheduledDate} в ${scheduledTime}` 
              : 'Короба'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-3" align="start">
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Укажите дату и время готовности</h4>
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Дата</label>
              <Input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="text-xs h-8"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Время</label>
              <Input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="text-xs h-8"
              />
            </div>
            <Button
              size="sm"
              onClick={handleSaveDateTime}
              disabled={!scheduledDate || !scheduledTime}
              className="w-full h-8 text-xs"
            >
              Сохранить
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default StatusSelector;