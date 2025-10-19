import Icon from './ui/icon';

interface CargoTypeIconProps {
  type: string;
  size?: number;
  className?: string;
}

const CargoTypeIcon = ({ type, size = 20, className = '' }: CargoTypeIconProps) => {
  const iconMap: Record<string, { icon: string; isCustom?: boolean }> = {
    box: { icon: 'Package' },
    pallet: { icon: 'Layers' },
    container: { icon: 'Container' },
    bulk: { icon: 'ShoppingBag' },
    liquid: { icon: 'Droplet' },
    oversized: { icon: 'custom', isCustom: true }
  };

  const config = iconMap[type] || { icon: 'Package' };

  if (config.isCustom && type === 'oversized') {
    return (
      <div 
        className={`inline-flex items-center justify-center font-bold ${className}`}
        style={{ 
          width: size, 
          height: size, 
          fontSize: size * 0.7,
          fontFamily: 'monospace'
        }}
      >
        Н
      </div>
    );
  }

  return <Icon name={config.icon} size={size} className={className} />;
};

export default CargoTypeIcon;
