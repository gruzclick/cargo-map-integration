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
      <Card className="border border-gray-200/20 dark:border-gray-700/30 shadow-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl animate-scale-in">
        <CardContent className="p-3 md:p-4">
          <h3 className="text-sm md:text-base font-semibold mb-2 flex items-center gap-2">
            <Icon name="Truck" size={16} className="text-green-500" />
            Статус водителя
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Button
              variant={status === 'free' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onStatusChange('free')}
              className="justify-start text-xs h-9 bg-green-500 hover:bg-green-600 border-green-500"
              style={status === 'free' ? { backgroundColor: '#22c55e' } : {}}
            >
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
              Свободен
            </Button>
            <Button
              variant={status === 'has_space' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onStatusChange('has_space')}
              className="justify-start text-xs h-9"
              style={status === 'has_space' ? { backgroundColor: '#eab308' } : {}}
            >
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2" />
              Есть места
            </Button>
            <Button
              variant={status === 'full' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onStatusChange('full')}
              className="justify-start text-xs h-9"
              style={status === 'full' ? { backgroundColor: '#ef4444' } : {}}
            >
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2" />
              Нет мест
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200/20 dark:border-gray-700/30 shadow-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl animate-scale-in">
      <CardContent className="p-3 md:p-4">
        <h3 className="text-sm md:text-base font-semibold mb-2 flex items-center gap-2">
          <Icon name="Package" size={16} className="text-sky-500" />
          Статус груза
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Button
            variant={status === 'ready' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStatusChange('ready')}
            className="justify-start text-xs h-9"
            style={status === 'ready' ? { backgroundColor: '#22c55e' } : {}}
          >
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
            Готов к отгрузке
          </Button>
          <Button
            variant={status === 'scheduled' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStatusChange('scheduled')}
            className="justify-start text-xs h-9"
            style={status === 'scheduled' ? { backgroundColor: '#eab308' } : {}}
          >
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2" />
            Будет готов ко времени
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusSelector;
