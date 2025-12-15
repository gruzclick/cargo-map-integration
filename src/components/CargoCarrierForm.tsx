import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { searchWarehouses, type MarketplaceWarehouse } from '@/data/marketplaceWarehouses';

interface Vehicle {
  id: string;
  driverName: string;
  driverPhone: string;
  driverLicenseNumber: string;
  carBrand: string;
  carModel: string;
  carNumber: string;
  carPhoto: File | null;
  carNumberPhoto: File | null;
  carNumberReadable: boolean | null;
  capacity: {
    boxes: number;
    pallets: number;
  };
  warehouse: MarketplaceWarehouse | null;
}

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

  const checkLicensePlate = async (vehicleId: string, file: File) => {
    updateVehicle(vehicleId, 'carNumberPhoto', file);
    
    // Простая проверка читаемости по размеру и формату
    const img = new Image();
    const reader = new FileReader();
    
    reader.onload = (e) => {
      img.src = e.target?.result as string;
      img.onload = () => {
        // Базовая проверка: размер изображения должен быть достаточным
        const isReadable = img.width >= 800 && img.height >= 600;
        updateVehicle(vehicleId, 'carNumberReadable', isReadable);
        
        if (!isReadable) {
          alert('⚠️ Фото с госномером нечеткое или слишком маленькое. Пожалуйста, загрузите фото лучшего качества (минимум 800×600px)');
        }
      };
    };
    
    reader.readAsDataURL(file);
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

  const isVehicleValid = (vehicle: Vehicle) => {
    return (
      vehicle.driverName &&
      vehicle.driverPhone &&
      vehicle.driverLicenseNumber &&
      vehicle.carBrand &&
      vehicle.carModel &&
      vehicle.carNumber &&
      vehicle.warehouse &&
      vehicle.carNumberPhoto &&
      vehicle.carNumberReadable === true &&
      (vehicle.capacity.boxes > 0 || vehicle.capacity.pallets > 0)
    );
  };

  const canSubmit = vehicles.every(isVehicleValid);

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto px-1">
      <div className="flex items-center gap-3 sticky top-0 bg-white dark:bg-gray-900 py-4 border-b z-10">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <Icon name="ArrowLeft" size={20} />
        </Button>
        <div>
          <h2 className="text-xl font-bold">Перевозка груза</h2>
          <p className="text-sm text-gray-500">Данные о водителях и автомобилях</p>
        </div>
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
          <div key={vehicle.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Данные автомобиля</h3>
              {vehicles.length > 1 && (
                <Button variant="ghost" size="sm" onClick={() => removeVehicle(vehicle.id)} className="text-red-600">
                  <Icon name="Trash2" size={16} className="mr-2" />
                  Удалить
                </Button>
              )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <Icon name="Info" size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  Все поля обязательны для заполнения. Фото госномера должно быть четким и читаемым.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">ФИО водителя *</label>
              <input
                type="text"
                value={vehicle.driverName}
                onChange={(e) => updateVehicle(vehicle.id, 'driverName', e.target.value)}
                placeholder="Иванов Иван Иванович"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Телефон водителя *</label>
              <input
                type="tel"
                value={vehicle.driverPhone}
                onChange={(e) => updateVehicle(vehicle.id, 'driverPhone', e.target.value)}
                placeholder="+7 (999) 123-45-67"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Номер водительского удостоверения *</label>
              <input
                type="text"
                value={vehicle.driverLicenseNumber}
                onChange={(e) => updateVehicle(vehicle.id, 'driverLicenseNumber', e.target.value)}
                placeholder="99 99 999999"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-2">Марка авто *</label>
                <input
                  type="text"
                  value={vehicle.carBrand}
                  onChange={(e) => updateVehicle(vehicle.id, 'carBrand', e.target.value)}
                  placeholder="ГАЗель"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Модель *</label>
                <input
                  type="text"
                  value={vehicle.carModel}
                  onChange={(e) => updateVehicle(vehicle.id, 'carModel', e.target.value)}
                  placeholder="Next"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Госномер *</label>
              <input
                type="text"
                value={vehicle.carNumber}
                onChange={(e) => updateVehicle(vehicle.id, 'carNumber', e.target.value.toUpperCase())}
                placeholder="А123БВ199"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 uppercase"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Фото авто с госномером * 
                {vehicle.carNumberReadable === false && (
                  <span className="text-red-600 ml-2">⚠️ Требуется более четкое фото</span>
                )}
                {vehicle.carNumberReadable === true && (
                  <span className="text-green-600 ml-2">✓ Фото принято</span>
                )}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) checkLicensePlate(vehicle.id, file);
                }}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              />
              <p className="text-xs text-gray-500 mt-1">
                Минимальное разрешение: 800×600px. Госномер должен быть четко виден.
              </p>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium mb-2">Склад назначения сегодня *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={warehouseSearch[vehicle.id] || ''}
                  onChange={(e) => handleWarehouseSearch(vehicle.id, e.target.value)}
                  placeholder="Начните вводить: Wildberries, Ozon, Москва..."
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    updateVehicle(vehicle.id, 'warehouse', { marketplace: 'Любой склад', city: '', address: '', code: '' } as MarketplaceWarehouse);
                    setWarehouseSearch(prev => ({ ...prev, [vehicle.id]: 'Любой склад' }));
                  }}
                  className="whitespace-nowrap"
                >
                  Любой склад
                </Button>
              </div>
              {warehouseResults[vehicle.id]?.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {warehouseResults[vehicle.id].map((warehouse, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleWarehouseSelect(vehicle.id, warehouse)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b last:border-b-0"
                    >
                      <div className="font-medium text-sm">{warehouse.marketplace}</div>
                      <div className="text-xs text-gray-500">{warehouse.city}</div>
                      <div className="text-xs text-gray-400 truncate">{warehouse.address}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Вместимость автомобиля *</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Коробов</label>
                  <input
                    type="number"
                    min="0"
                    value={vehicle.capacity.boxes}
                    onChange={(e) => updateCapacity(vehicle.id, 'boxes', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Паллет</label>
                  <input
                    type="number"
                    min="0"
                    value={vehicle.capacity.pallets}
                    onChange={(e) => updateCapacity(vehicle.id, 'pallets', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  />
                </div>
              </div>
            </div>
          </div>
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