import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { MapMarker } from './MapTypes';

interface MarkerDetailsModalProps {
  marker: MapMarker | null;
  onClose: () => void;
}

const MarkerDetailsModal = ({ marker, onClose }: MarkerDetailsModalProps) => {
  if (!marker) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <Card 
        className="max-w-md w-full animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold">{marker.name}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <Icon name="X" size={18} />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{marker.details}</p>
          {marker.type === 'cargo' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Icon name="Package" size={16} className="text-sky-500" />
                <span className="text-sm">Тип: {marker.cargoType === 'box' ? 'Коробки' : marker.cargoType === 'pallet' ? 'Паллеты' : 'Негабарит'}</span>
              </div>
              {marker.quantity && (
                <div className="flex items-center gap-2">
                  <Icon name="Hash" size={16} />
                  <span className="text-sm">Количество: {marker.quantity}</span>
                </div>
              )}
              {marker.weight && (
                <div className="flex items-center gap-2">
                  <Icon name="Weight" size={16} />
                  <span className="text-sm">Вес: {marker.weight} кг</span>
                </div>
              )}
            </div>
          )}
          {marker.type === 'driver' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Icon name="Truck" size={16} className="text-green-500" />
                <span className="text-sm">Транспорт: {marker.vehicleCategory === 'car' ? 'Легковой' : marker.vehicleCategory === 'truck' ? 'Грузовой' : 'Тягач'}</span>
              </div>
              {marker.capacity && (
                <div className="flex items-center gap-2">
                  <Icon name="Weight" size={16} />
                  <span className="text-sm">Грузоподъемность: {marker.capacity} кг</span>
                </div>
              )}
              {marker.rating && (
                <div className="flex items-center gap-2">
                  <Icon name="Star" size={16} className="text-yellow-500" />
                  <span className="text-sm">Рейтинг: {marker.rating}/5</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MarkerDetailsModal;
