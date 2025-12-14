import Icon from '@/components/ui/icon';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

interface IndexDesktopNavigationProps {
  userType: string;
}

const IndexDesktopNavigation = ({ userType }: IndexDesktopNavigationProps) => {
  return (
    <TabsList className="hidden md:grid w-full max-w-4xl mx-auto grid-cols-3 md:grid-cols-5 mb-2 bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl border border-gray-200/20 dark:border-gray-700/30 p-1.5 rounded-2xl shadow-lg">
      <TabsTrigger value="map" className="rounded-xl data-[state=active]:bg-white/80 dark:data-[state=active]:bg-gray-800/80 data-[state=active]:backdrop-blur-xl data-[state=active]:shadow-md text-xs md:text-sm">
        <Icon name="Map" size={16} className="mr-2" />
        Карта
      </TabsTrigger>
      {userType === 'client' && (
        <>
          <TabsTrigger value="delivery" className="rounded-xl data-[state=active]:bg-white/80 dark:data-[state=active]:bg-gray-800/80 data-[state=active]:backdrop-blur-xl data-[state=active]:shadow-md text-xs md:text-sm">
            <Icon name="Plus" size={16} className="mr-2" />
            Поставка
          </TabsTrigger>
          <TabsTrigger value="documents" className="rounded-xl data-[state=active]:bg-white/80 dark:data-[state=active]:bg-gray-800/80 data-[state=active]:backdrop-blur-xl data-[state=active]:shadow-md text-xs md:text-sm">
            <Icon name="FileText" size={16} className="mr-2" />
            Документы
          </TabsTrigger>
        </>
      )}
      {userType === 'carrier' && (
        <>
          <TabsTrigger value="orders" className="rounded-xl data-[state=active]:bg-white/80 dark:data-[state=active]:bg-gray-800/80 data-[state=active]:backdrop-blur-xl data-[state=active]:shadow-md text-xs md:text-sm">
            <Icon name="List" size={16} className="mr-2" />
            Заказы
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="rounded-xl data-[state=active]:bg-white/80 dark:data-[state=active]:bg-gray-800/80 data-[state=active]:backdrop-blur-xl data-[state=active]:shadow-md text-xs md:text-sm">
            <Icon name="Truck" size={16} className="mr-2" />
            Автопарк
          </TabsTrigger>
        </>
      )}
      <TabsTrigger value="history" className="rounded-xl data-[state=active]:bg-white/80 dark:data-[state=active]:bg-gray-800/80 data-[state=active]:backdrop-blur-xl data-[state=active]:shadow-md text-xs md:text-sm">
        <Icon name="History" size={16} className="mr-2" />
        История
      </TabsTrigger>
      <TabsTrigger value="more" className="rounded-xl data-[state=active]:bg-white/80 dark:data-[state=active]:bg-gray-800/80 data-[state=active]:backdrop-blur-xl data-[state=active]:shadow-md text-xs md:text-sm">
        <Icon name="MoreHorizontal" size={16} className="mr-2" />
        Ещё
      </TabsTrigger>
    </TabsList>
  );
};

export default IndexDesktopNavigation;
