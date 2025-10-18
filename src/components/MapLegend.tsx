import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { BoxIcon, PalletIcon } from '@/components/ui/custom-icons';

const MapLegend = () => {
  return (
    <Card className="border-0 shadow-sm rounded-xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm w-48">
      <CardContent className="p-3">
        <h3 className="font-semibold text-xs mb-3 text-gray-900 dark:text-gray-100">Легенда карты</h3>
        
        <div className="space-y-3">
          <div>
            <p className="text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-1.5">Типы грузов:</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <BoxIcon size={24} />
                <span className="text-[11px] text-gray-700 dark:text-gray-300">Коробки</span>
              </div>
              <div className="flex items-center gap-2">
                <PalletIcon size={24} />
                <span className="text-[11px] text-gray-700 dark:text-gray-300">Паллеты</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200/50 dark:border-gray-700/50 pt-2">
            <p className="text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-1.5">Типы транспорта:</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-900 dark:bg-gray-100 rounded-lg flex items-center justify-center">
                  <Icon name="Car" size={14} className="text-white dark:text-gray-900" />
                </div>
                <span className="text-[11px] text-gray-700 dark:text-gray-300">Легковой</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-900 dark:bg-gray-100 rounded-lg flex items-center justify-center">
                  <Icon name="Truck" size={14} className="text-white dark:text-gray-900" />
                </div>
                <span className="text-[11px] text-gray-700 dark:text-gray-300">Грузовой</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-900 dark:bg-gray-100 rounded-lg flex items-center justify-center">
                  <Icon name="Container" size={14} className="text-white dark:text-gray-900" />
                </div>
                <span className="text-[11px] text-gray-700 dark:text-gray-300">Седельный</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MapLegend;