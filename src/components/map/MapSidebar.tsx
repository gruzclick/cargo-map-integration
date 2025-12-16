import Icon from '@/components/ui/icon';
import MapFilters, { FilterState } from '../MapFilters';
import RouteSearchPanel from './RouteSearchPanel';
import CargoVehicleSelector from './CargoVehicleSelector';
import StatusSelector from './StatusSelector';
import { MapMarker } from './MapTypes';

interface MapSidebarProps {
  showSidebar: boolean;
  activeTab: 'stats' | 'search';
  setActiveTab: (tab: 'stats' | 'search') => void;
  setShowSidebar: (show: boolean) => void;
  isPublic: boolean;
  filters: FilterState;
  handleFilterChange: (filters: FilterState) => void;
  routeSearch: { from: string; to: string };
  setRouteSearch: (search: { from: string; to: string }) => void;
  setUserLocation: (location: { lat: number; lng: number } | null) => void;
  cargoBlockExpanded: boolean;
  setCargoBlockExpanded: (expanded: boolean) => void;
  driverBlockExpanded: boolean;
  setDriverBlockExpanded: (expanded: boolean) => void;
  setLastInteraction: (time: number) => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: () => void;
  handleCargoTypeClick: (type: 'box' | 'pallet' | 'oversized', isDriver: boolean) => void;
  handleVehicleTypeClick: (type: 'car' | 'truck' | 'semi', isClient: boolean) => void;
  cargoStatus: string;
  setCargoStatus: (status: string) => void;
  driverStatus: string;
  setDriverStatus: (status: string) => void;
  filteredMarkers: MapMarker[];
}

const MapSidebar = ({
  showSidebar,
  activeTab,
  setActiveTab,
  setShowSidebar,
  isPublic,
  filters,
  handleFilterChange,
  routeSearch,
  setRouteSearch,
  setUserLocation,
  cargoBlockExpanded,
  setCargoBlockExpanded,
  driverBlockExpanded,
  setDriverBlockExpanded,
  setLastInteraction,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  handleCargoTypeClick,
  handleVehicleTypeClick,
  cargoStatus,
  setCargoStatus,
  driverStatus,
  setDriverStatus,
  filteredMarkers,
}: MapSidebarProps) => {
  if (!showSidebar) return null;

  const cargoCount = filteredMarkers.filter(m => m.type === 'cargo').length;
  const driverCount = filteredMarkers.filter(m => m.type === 'driver').length;

  return (
    <div 
      onClick={() => setLastInteraction(Date.now())}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="absolute top-20 left-1/2 md:left-3 md:top-20 -translate-x-1/2 md:translate-x-0 max-h-[calc(100vh-5.5rem)] w-[calc(100%-1.5rem)] md:w-56 bg-white/10 dark:bg-gray-900/10 backdrop-blur-3xl border border-white/30 dark:border-gray-700/30 shadow-2xl rounded-2xl z-10 overflow-hidden animate-slide-in-left flex flex-col touch-pan-y overscroll-contain"
    >
      <div className="flex items-center justify-between p-2 gap-2">
        <div className="flex items-center gap-2 flex-1">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 px-3 py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'search'
                ? 'bg-white/60 dark:bg-gray-800/60 text-gray-900 dark:text-white shadow-md'
                : 'text-gray-700 dark:text-gray-400 hover:bg-white/30 dark:hover:bg-gray-800/30'
            }`}
          >
            <Icon name="Search" size={14} />
            <span>Поиск</span>
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 px-3 py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'stats'
                ? 'bg-white/60 dark:bg-gray-800/60 text-gray-900 dark:text-white shadow-md'
                : 'text-gray-700 dark:text-gray-400 hover:bg-white/30 dark:hover:bg-gray-800/30'
            }`}
          >
            <Icon name="BarChart3" size={14} />
            <span>Статистика</span>
          </button>
        </div>
        <button
          onClick={() => setShowSidebar(false)}
          className="p-2 rounded-lg text-gray-700 dark:text-gray-400 hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all"
          title="Свернуть"
        >
          <Icon name="ChevronLeft" size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {activeTab === 'stats' && (
          <div className="space-y-3">
            {!isPublic && (
              <>
                <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-3xl rounded-xl border border-white/30 dark:border-gray-700/30 overflow-hidden">
                  <div 
                    onClick={() => {
                      setCargoBlockExpanded(!cargoBlockExpanded);
                      setLastInteraction(Date.now());
                    }}
                    className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-white/5 dark:hover:bg-gray-800/5 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Icon name="Package" size={16} className="text-orange-500" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">Грузы</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-orange-500">{cargoCount}</span>
                      <Icon 
                        name={cargoBlockExpanded ? "ChevronUp" : "ChevronDown"} 
                        size={16} 
                        className="text-gray-700 dark:text-gray-400"
                      />
                    </div>
                  </div>
                  {cargoBlockExpanded && (
                    <div className="px-3 pb-3 pt-1">
                      <StatusSelector 
                        type="cargo"
                        selectedStatus={cargoStatus}
                        onStatusChange={setCargoStatus}
                      />
                    </div>
                  )}
                </div>

                <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-3xl rounded-xl border border-white/30 dark:border-gray-700/30 overflow-hidden">
                  <div 
                    onClick={() => {
                      setDriverBlockExpanded(!driverBlockExpanded);
                      setLastInteraction(Date.now());
                    }}
                    className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-white/5 dark:hover:bg-gray-800/5 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Icon name="Truck" size={16} className="text-blue-500" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">Водители</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-blue-500">{driverCount}</span>
                      <Icon 
                        name={driverBlockExpanded ? "ChevronUp" : "ChevronDown"} 
                        size={16} 
                        className="text-gray-700 dark:text-gray-400"
                      />
                    </div>
                  </div>
                  {driverBlockExpanded && (
                    <div className="px-3 pb-3 pt-1">
                      <StatusSelector 
                        type="driver"
                        selectedStatus={driverStatus}
                        onStatusChange={setDriverStatus}
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'search' && (
          <div className="space-y-2">
            {!isPublic && (
              <MapFilters onFilterChange={handleFilterChange} />
            )}
            
            {filters.userType !== 'all' && (
              <div className="p-2">
                <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-1.5">Показать</h3>
                <CargoVehicleSelector 
                  filters={filters}
                  onCargoTypeClick={handleCargoTypeClick}
                  onVehicleTypeClick={handleVehicleTypeClick}
                />
              </div>
            )}
            
            <div className="p-2">
              <RouteSearchPanel 
                routeSearch={routeSearch} 
                onRouteChange={setRouteSearch}
                onLocationDetected={setUserLocation}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapSidebar;
