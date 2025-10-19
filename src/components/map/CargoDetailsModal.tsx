import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CargoTypeIcon from '../CargoTypeIcon';
import { CargoDetailsModal as CargoDetailsModalType } from './MapTypes';

interface CargoDetailsModalProps {
  modal: CargoDetailsModalType | null;
  details: { quantity: string; weight: string; volume: string };
  onDetailsChange: (details: { quantity: string; weight: string; volume: string }) => void;
  onSubmit: () => void;
  onClose: () => void;
}

const CargoDetailsModal = ({ modal, details, onDetailsChange, onSubmit, onClose }: CargoDetailsModalProps) => {
  if (!modal) return null;

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
            <CargoTypeIcon type={modal.type} size={20} />
            {modal.type === 'box' ? 'Коробки' : modal.type === 'pallet' ? 'Паллеты' : 'Негабарит'}
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Количество</label>
              <Input
                type="number"
                placeholder="Введите количество"
                value={details.quantity}
                onChange={(e) => onDetailsChange({ ...details, quantity: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Вес (кг)</label>
              <Input
                type="number"
                placeholder="Введите вес"
                value={details.weight}
                onChange={(e) => onDetailsChange({ ...details, weight: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Объем (м³)</label>
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
              Применить
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

export default CargoDetailsModal;
