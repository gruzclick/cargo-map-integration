import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { BoxIcon, PalletIcon } from '@/components/ui/custom-icons';
import CargoTypeIcon from './CargoTypeIcon';

const MapLegend = () => {
  return (
    <Card className="border-0 shadow-md rounded-xl bg-card flex-1">
      <CardContent className="p-4 h-full">
        <div className="grid grid-cols-2 gap-4 h-full">
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-2">Типы грузов</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BoxIcon size={24} />
                <span className="text-xs">Коробки</span>
              </div>
              <div className="flex items-center gap-2">
                <PalletIcon size={24} />
                <span className="text-xs">Паллеты</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-sky-500 rounded-lg flex items-center justify-center">
                  <CargoTypeIcon type="oversized" size={16} className="text-white" />
                </div>
                <span className="text-xs">Негабарит</span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground font-medium mb-2">Транспорт</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-900 dark:bg-gray-100 rounded-lg flex items-center justify-center">
                  <Icon name="Car" size={14} className="text-white dark:text-gray-900" />
                </div>
                <span className="text-xs">Легковой</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-900 dark:bg-gray-100 rounded-lg flex items-center justify-center">
                  <Icon name="Truck" size={14} className="text-white dark:text-gray-900" />
                </div>
                <span className="text-xs">Грузовой</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-900 dark:bg-gray-100 rounded-lg flex items-center justify-center">
                  <Icon name="Container" size={14} className="text-white dark:text-gray-900" />
                </div>
                <span className="text-xs">Тягач</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MapLegend;