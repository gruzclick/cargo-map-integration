import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { VehicleDetailsModal as VehicleDetailsModalType } from './MapTypes';

interface VehicleDetailsModalProps {
  modal: VehicleDetailsModalType | null;
  details: { boxCount: string; palletCount: string; oversizedCount: string; volume: string };
  onDetailsChange: (details: { boxCount: string; palletCount: string; oversizedCount: string; volume: string }) => void;
  onSubmit: () => void;
  onClose: () => void;
}

const VehicleDetailsModal = ({ modal, details, onDetailsChange, onSubmit, onClose }: VehicleDetailsModalProps) => {
  if (!modal) return null;

  const showBoxes = modal.type !== 'truck';
  const showPallets = modal.type !== 'car';

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <Card 
        className="max-w-sm w-full animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <CardContent className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Icon name={modal.type === 'car' ? 'Car' : modal.type === 'truck' ? 'Truck' : 'Container'} size={20} />
            {modal.type === 'car' ? 'Легковой' : modal.type === 'truck' ? 'Грузовой' : 'Тягач'}
          </h3>
          <div className="space-y-3">
            {showBoxes && (
              <div>
                <label className="text-sm font-medium mb-1 block">Количество коробок</label>
                <Input
                  type="number"
                  placeholder="Введите количество"
                  value={details.boxCount}
                  onChange={(e) => onDetailsChange({ ...details, boxCount: e.target.value })}
                />
              </div>
            )}
            {showPallets && (
              <>
                <div>
                  <label className="text-sm font-medium mb-1 block">Количество паллет</label>
                  <Input
                    type="number"
                    placeholder="Введите количество"
                    value={details.palletCount}
                    onChange={(e) => onDetailsChange({ ...details, palletCount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Негабаритных паллет</label>
                  <Input
                    type="number"
                    placeholder="Введите количество"
                    value={details.oversizedCount}
                    onChange={(e) => onDetailsChange({ ...details, oversizedCount: e.target.value })}
                  />
                </div>
              </>
            )}
            <div>
              <label className="text-sm font-medium mb-1 block">Объем груза (м³)</label>
              <Input
                type="number"
                placeholder="Введите объем"
                value={details.volume}
                onChange={(e) => onDetailsChange({ ...details, volume: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={onSubmit} className="flex-1">
              Найти
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Отмена
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VehicleDetailsModal;