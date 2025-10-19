import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface StatusSelectorProps {
  userType: 'driver' | 'client';
  status: string;
  onStatusChange: (status: string) => void;
}

const StatusSelector = ({ userType, status, onStatusChange }: StatusSelectorProps) => {
  if (userType === 'driver') {
    return (
      <Card className="border border-gray-200/20 dark:border-gray-700/30 shadow-lg bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl">
        <CardContent className="p-2 md:p-2.5">
          <div className="flex flex-col gap-1.5">
            <Button
              variant={status === 'free' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onStatusChange('free')}
              className="justify-start text-[10px] md:text-xs h-7 md:h-8"
              style={status === 'free' ? { backgroundColor: '#22c55e' } : {}}
            >
              <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5" />
              Свободен
            </Button>
            <Button
              variant={status === 'has_space' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onStatusChange('has_space')}
              className="justify-start text-[10px] md:text-xs h-7 md:h-8"
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
            className="justify-start text-[10px] md:text-xs h-7 md:h-8"
            style={status === 'ready' ? { backgroundColor: '#22c55e' } : {}}
          >
            <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5" />
            Готов к отгрузке
          </Button>
          <Button
            variant={status === 'scheduled' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStatusChange('scheduled')}
            className="justify-start text-[10px] md:text-xs h-7 md:h-8"
            style={status === 'scheduled' ? { backgroundColor: '#eab308' } : {}}
          >
            <div className="w-2 h-2 rounded-full bg-yellow-500 mr-1.5" />
            Будет готов ко времени
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusSelector;