import Icon from '@/components/ui/icon';

interface MapControlsProps {
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
  detectUserLocation: () => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: () => void;
}

const MapControls = ({
  showSidebar,
  setShowSidebar,
  detectUserLocation,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
}: MapControlsProps) => {
  return (
    <>
      {!showSidebar && (
        <button
          onClick={() => setShowSidebar(true)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="fixed top-20 left-4 z-[60] w-12 h-12 bg-white/90 dark:bg-gray-800/90 backdrop-blur-3xl border border-gray-300 dark:border-gray-600 shadow-2xl rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 active:scale-95 transition-all"
          title="Открыть панель (свайп вправо)"
        >
          <Icon name="Menu" size={20} className="text-gray-900 dark:text-white" />
        </button>
      )}

      <button
        onClick={detectUserLocation}
        className="fixed top-36 left-4 z-[60] w-12 h-12 bg-white/90 dark:bg-gray-800/90 backdrop-blur-3xl border border-gray-300 dark:border-gray-600 shadow-2xl rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 active:scale-95 transition-all"
        title="Моя геопозиция"
      >
        <Icon name="Navigation" size={20} className="text-gray-900 dark:text-white" />
      </button>
    </>
  );
};

export default MapControls;
