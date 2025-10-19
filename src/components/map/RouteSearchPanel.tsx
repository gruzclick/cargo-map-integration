import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface RouteSearchPanelProps {
  routeSearch: { from: string; to: string };
  onRouteChange: (route: { from: string; to: string }) => void;
}

const RouteSearchPanel = ({ routeSearch, onRouteChange }: RouteSearchPanelProps) => {
  return (
    <div className="mb-3 md:mb-4">
      <h3 className="text-sm md:text-base font-semibold mb-2 flex items-center gap-2">
        <Icon name="Route" size={16} className="text-primary" />
        Поиск по маршруту
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Input
          placeholder="Откуда"
          value={routeSearch.from}
          onChange={(e) => onRouteChange({ ...routeSearch, from: e.target.value })}
          className="text-xs md:text-sm"
        />
        <Input
          placeholder="Куда"
          value={routeSearch.to}
          onChange={(e) => onRouteChange({ ...routeSearch, to: e.target.value })}
          className="text-xs md:text-sm"
        />
      </div>
    </div>
  );
};

export default RouteSearchPanel;
