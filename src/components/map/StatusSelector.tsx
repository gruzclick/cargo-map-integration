import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

interface StatusSelectorProps {
  userType: 'driver' | 'client';
  status: string;
  onStatusChange: (status: string) => void;
}

const StatusSelector = ({ userType, status, onStatusChange }: StatusSelectorProps) => {
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isDateTimeOpen, setIsDateTimeOpen] = useState(false);

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

  if (userType === 'driver') {
    return (
      <Card className="border border-gray-200/20 dark:border-gray-700/30 shadow-lg bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl">
        <CardContent className="p-2 md:p-2.5">
          <div className="flex flex-col gap-1.5">
            <Button
              variant={status === 'free' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onStatusChange('free')}
              className="justify-start text-[10px] md:text-xs h-7 md:h-8 border-0"
              style={status === 'free' ? { backgroundColor: '#22c55e' } : {}}
            >
              <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5" />
              Свободен
            </Button>
            <Button
              variant={status === 'has_space' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onStatusChange('has_space')}
              className="justify-start text-[10px] md:text-xs h-7 md:h-8 border-0"
              style={status === 'has_space' ? { backgroundColor: '#eab308' } : {}}
            >
              <div className="w-2 h-2 rounded-full bg-yellow-500 mr-1.5" />
              Есть места
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200/20 dark:border-gray-700/30 shadow-lg bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl">
      <CardContent className="p-2 md:p-2.5">
        <div className="flex flex-col gap-1.5">
          <Button
            variant={status === 'ready' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStatusChange('ready')}
            className="justify-start text-[10px] md:text-xs h-7 md:h-8 border-0"
            style={status === 'ready' ? { backgroundColor: '#22c55e' } : {}}
          >
            <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5" />
            Готов к отгрузке
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
                  ? `Будет готов ${scheduledDate} в ${scheduledTime}` 
                  : 'Будет готов'}
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
      </CardContent>
    </Card>
  );
};

export default StatusSelector;