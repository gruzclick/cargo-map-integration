import Icon from '@/components/ui/icon';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

interface IndexMobileNavigationProps {
  userType: string;
}

const IndexMobileNavigation = ({ userType }: IndexMobileNavigationProps) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
      <TabsList className="grid w-full grid-cols-4 h-16 bg-transparent p-0">
        <TabsTrigger value="map" className="flex-col gap-1 rounded-none data-[state=active]:bg-transparent data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=inactive]:text-gray-500">
          <Icon name="Map" size={20} />
          <span className="text-[10px]">Карта</span>
        </TabsTrigger>
        {userType === 'client' && (
          <TabsTrigger value="delivery" className="flex-col gap-1 rounded-none data-[state=active]:bg-transparent data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=inactive]:text-gray-500">
            <Icon name="Plus" size={20} />
            <span className="text-[10px]">Поставка</span>
          </TabsTrigger>
        )}
        {userType === 'carrier' && (
          <TabsTrigger value="orders" className="flex-col gap-1 rounded-none data-[state=active]:bg-transparent data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=inactive]:text-gray-500">
            <Icon name="List" size={20} />
            <span className="text-[10px]">Заказы</span>
          </TabsTrigger>
        )}
        <TabsTrigger value="history" className="flex-col gap-1 rounded-none data-[state=active]:bg-transparent data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=inactive]:text-gray-500">
          <Icon name="History" size={20} />
          <span className="text-[10px]">История</span>
        </TabsTrigger>
        <TabsTrigger value="more" className="flex-col gap-1 rounded-none data-[state=active]:bg-transparent data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=inactive]:text-gray-500">
          <Icon name="MoreHorizontal" size={20} />
          <span className="text-[10px]">Ещё</span>
        </TabsTrigger>
      </TabsList>
    </div>
  );
};

export default IndexMobileNavigation;
