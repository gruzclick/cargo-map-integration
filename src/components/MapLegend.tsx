import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { BoxIcon, PalletIcon } from '@/components/ui/custom-icons';

const MapLegend = () => {
  return (
    <Card className="border-0 shadow-sm rounded-xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm w-64">
      <CardContent className="p-4">
        <h3 className="font-semibold text-sm mb-3 text-gray-900 dark:text-gray-100">Легенда карты</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Типы грузов</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BoxIcon size={28} />
                <span className="text-sm text-gray-800 dark:text-gray-200">Коробки</span>
              </div>
              <div className="flex items-center gap-2">
                <PalletIcon size={28} />
                <span className="text-sm text-gray-800 dark:text-gray-200">Паллеты</span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Транспорт</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-gray-900 dark:bg-gray-100 rounded-lg flex items-center justify-center">
                  <Icon name="Car" size={16} className="text-white dark:text-gray-900" />
                </div>
                <span className="text-sm text-gray-800 dark:text-gray-200">Легковой</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-gray-900 dark:bg-gray-100 rounded-lg flex items-center justify-center">
                  <Icon name="Truck" size={16} className="text-white dark:text-gray-900" />
                </div>
                <span className="text-sm text-gray-800 dark:text-gray-200">Грузовой</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-gray-900 dark:bg-gray-100 rounded-lg flex items-center justify-center">
                  <Icon name="Container" size={16} className="text-white dark:text-gray-900" />
                </div>
                <span className="text-sm text-gray-800 dark:text-gray-200">Седельный</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MapLegend;