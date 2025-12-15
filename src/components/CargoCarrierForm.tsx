import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { searchWarehouses, type MarketplaceWarehouse } from '@/data/marketplaceWarehouses';
import { Vehicle } from './cargo-carrier/types';
import { VehicleCard } from './cargo-carrier/VehicleCard';
import { isVehicleValid, checkLicensePlateReadability } from './cargo-carrier/VehicleValidation';

interface CargoCarrierFormProps {
  onComplete: (vehicles: Vehicle[]) => void;
  onBack: () => void;
}

const CargoCarrierForm = ({ onComplete, onBack }: CargoCarrierFormProps) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([{
    id: crypto.randomUUID(),
    driverName: '',
    driverPhone: '',
    driverLicenseNumber: '',
    carBrand: '',
    carModel: '',
    carNumber: '',
    carPhoto: null,
    carNumberPhoto: null,
    carNumberReadable: null,
    capacity: { boxes: 0, pallets: 0 },
    warehouse: null
  }]);

  const [warehouseSearch, setWarehouseSearch] = useState<{[key: string]: string}>({});
  const [warehouseResults, setWarehouseResults] = useState<{[key: string]: MarketplaceWarehouse[]}>({});
  const [editingVehicle, setEditingVehicle] = useState<string | null>(vehicles[0].id);

  const handleWarehouseSearch = (vehicleId: string, query: string) => {
    setWarehouseSearch(prev => ({ ...prev, [vehicleId]: query }));
    if (query.length >= 2) {
      const results = searchWarehouses(query);
      setWarehouseResults(prev => ({ ...prev, [vehicleId]: results }));
    } else {
      setWarehouseResults(prev => ({ ...prev, [vehicleId]: [] }));
    }
  };

  const handleWarehouseSelect = (vehicleId: string, warehouse: MarketplaceWarehouse) => {
    setVehicles(vehicles => vehicles.map(v => 
      v.id === vehicleId ? { ...v, warehouse } : v
    ));
    setWarehouseSearch(prev => ({ 
      ...prev, 
      [vehicleId]: `${warehouse.marketplace} - ${warehouse.city}` 
    }));
    setWarehouseResults(prev => ({ ...prev, [vehicleId]: [] }));
  };

  const updateVehicle = (vehicleId: string, field: keyof Vehicle, value: any) => {
    setVehicles(vehicles => vehicles.map(v => 
      v.id === vehicleId ? { ...v, [field]: value } : v
    ));
  };

  const updateCapacity = (vehicleId: string, type: 'boxes' | 'pallets', value: number) => {
    setVehicles(vehicles => vehicles.map(v => 
      v.id === vehicleId ? { ...v, capacity: { ...v.capacity, [type]: value } } : v
    ));
  };

  const checkLicensePlate = (vehicleId: string, file: File) => {
    updateVehicle(vehicleId, 'carNumberPhoto', file);
    checkLicensePlateReadability(file, (isReadable) => {
      updateVehicle(vehicleId, 'carNumberReadable', isReadable);
    });
  };

  const addVehicle = () => {
    const newVehicle: Vehicle = {
      id: crypto.randomUUID(),
      driverName: '',
      driverPhone: '',
      driverLicenseNumber: '',
      carBrand: '',
      carModel: '',
      carNumber: '',
      carPhoto: null,
      carNumberPhoto: null,
      carNumberReadable: null,
      capacity: { boxes: 0, pallets: 0 },
      warehouse: null
    };
    setVehicles([...vehicles, newVehicle]);
    setEditingVehicle(newVehicle.id);
  };

  const removeVehicle = (vehicleId: string) => {
    if (vehicles.length > 1) {
      setVehicles(vehicles.filter(v => v.id !== vehicleId));
      setEditingVehicle(vehicles[0].id);
    }
  };

  const canSubmit = vehicles.every(isVehicleValid);

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto px-1">
      <div className="flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900 py-4 border-b z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <div>
            <h2 className="text-xl font-bold">Перевозка груза</h2>
            <p className="text-sm text-gray-500">Данные о водителях и автомобилях</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onBack}>
          <Icon name="X" size={20} />
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 items-center">
        {vehicles.map((vehicle, index) => (
          <button
            key={vehicle.id}
            onClick={() => setEditingVehicle(vehicle.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              editingVehicle === vehicle.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200'
            }`}
          >
            <Icon name="Truck" size={16} className="inline mr-2" />
            {vehicle.carBrand && vehicle.carNumber 
              ? `${vehicle.carBrand} ${vehicle.carNumber}`
              : `Автомобиль #${index + 1}`
            }
            {isVehicleValid(vehicle) && (
              <Icon name="CheckCircle" size={14} className="inline ml-2 text-green-400" />
            )}
          </button>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={addVehicle}
          className="whitespace-nowrap"
        >
          <Icon name="Plus" size={16} className="mr-2" />
          Добавить
        </Button>
      </div>

      {vehicles.map(vehicle => (
        editingVehicle === vehicle.id && (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            canDelete={vehicles.length > 1}
            warehouseSearch={warehouseSearch[vehicle.id] || ''}
            warehouseResults={warehouseResults[vehicle.id] || []}
            onUpdate={(field, value) => updateVehicle(vehicle.id, field, value)}
            onUpdateCapacity={(type, value) => updateCapacity(vehicle.id, type, value)}
            onWarehouseSearch={(query) => handleWarehouseSearch(vehicle.id, query)}
            onWarehouseSelect={(warehouse) => handleWarehouseSelect(vehicle.id, warehouse)}
            onLicensePlateUpload={(file) => checkLicensePlate(vehicle.id, file)}
            onDelete={() => removeVehicle(vehicle.id)}
            onSetAnyWarehouse={() => {
              updateVehicle(vehicle.id, 'warehouse', { 
                marketplace: 'Любой склад', 
                city: '', 
                address: '', 
                code: '' 
              } as MarketplaceWarehouse);
              setWarehouseSearch(prev => ({ ...prev, [vehicle.id]: 'Любой склад' }));
            }}
          />
        )
      ))}

      <div className="flex gap-3 sticky bottom-0 bg-white dark:bg-gray-900 py-4 border-t">
        <Button
          onClick={() => onComplete(vehicles)}
          disabled={!canSubmit}
          className="w-full"
        >
          Создать заявку
        </Button>
      </div>
    </div>
  );
};

export default CargoCarrierForm;
