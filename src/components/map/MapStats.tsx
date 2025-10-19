import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface MapStatsProps {
  cargoCount: number;
  driverCount: number;
}

const MapStats = ({ cargoCount, driverCount }: MapStatsProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-3 items-stretch">
      <Card className="border border-gray-200/20 dark:border-gray-700/30 shadow-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl flex-1 animate-scale-in">
        <CardContent className="p-3 md:p-5">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-sky-400 to-sky-600 rounded-xl flex items-center justify-center shadow-lg">
              <Icon name="Package" size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] md:text-xs text-gray-600 dark:text-gray-400">Грузов ожидает</p>
              <div className="flex items-center gap-2">
                <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">{cargoCount}</p>
                <Badge variant="secondary" className="text-[9px] md:text-[10px] px-1.5 py-0">в сети</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200/20 dark:border-gray-700/30 shadow-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl flex-1 animate-scale-in" style={{ animationDelay: '0.1s' }}>
        <CardContent className="p-3 md:p-5">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <Icon name="Truck" size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] md:text-xs text-gray-600 dark:text-gray-400">Водителей свободно</p>
              <div className="flex items-center gap-2">
                <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">{driverCount}</p>
                <Badge variant="secondary" className="text-[9px] md:text-[10px] px-1.5 py-0">активны</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MapStats;
