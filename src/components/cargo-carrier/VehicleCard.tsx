import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { MarketplaceWarehouse } from '@/data/marketplaceWarehouses';
import { Vehicle } from './types';

interface VehicleCardProps {
  vehicle: Vehicle;
  canDelete: boolean;
  warehouseSearch: string;
  warehouseResults: MarketplaceWarehouse[];
  onUpdate: (field: keyof Vehicle, value: any) => void;
  onUpdateCapacity: (type: 'boxes' | 'pallets', value: number) => void;
  onWarehouseSearch: (query: string) => void;
  onWarehouseSelect: (warehouse: MarketplaceWarehouse) => void;
  onLicensePlateUpload: (file: File) => void;
  onDelete: () => void;
  onSetAnyWarehouse: () => void;
}

export const VehicleCard = ({
  vehicle,
  canDelete,
  warehouseSearch,
  warehouseResults,
  onUpdate,
  onUpdateCapacity,
  onWarehouseSearch,
  onWarehouseSelect,
  onLicensePlateUpload,
  onDelete,
  onSetAnyWarehouse
}: VehicleCardProps) => {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Данные автомобиля</h3>
        {canDelete && (
          <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-600">
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
          onChange={(e) => onUpdate('driverName', e.target.value)}
          placeholder="Иванов Иван Иванович"
          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Телефон водителя *</label>
        <input
          type="tel"
          value={vehicle.driverPhone}
          onChange={(e) => onUpdate('driverPhone', e.target.value)}
          placeholder="+7 (999) 123-45-67"
          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Номер водительского удостоверения *</label>
        <input
          type="text"
          value={vehicle.driverLicenseNumber}
          onChange={(e) => onUpdate('driverLicenseNumber', e.target.value)}
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
            onChange={(e) => onUpdate('carBrand', e.target.value)}
            placeholder="ГАЗель"
            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Модель *</label>
          <input
            type="text"
            value={vehicle.carModel}
            onChange={(e) => onUpdate('carModel', e.target.value)}
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
          onChange={(e) => onUpdate('carNumber', e.target.value.toUpperCase())}
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
            if (file) onLicensePlateUpload(file);
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
            value={warehouseSearch}
            onChange={(e) => onWarehouseSearch(e.target.value)}
            placeholder="Начните вводить: Wildberries, Ozon, Москва..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          />
          <Button
            variant="outline"
            onClick={onSetAnyWarehouse}
            className="whitespace-nowrap"
          >
            Любой склад
          </Button>
        </div>
        {warehouseResults.length > 0 && (
          <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {warehouseResults.map((warehouse, idx) => (
              <button
                key={idx}
                onClick={() => onWarehouseSelect(warehouse)}
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
              onChange={(e) => onUpdateCapacity('boxes', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Паллет</label>
            <input
              type="number"
              min="0"
              value={vehicle.capacity.pallets}
              onChange={(e) => onUpdateCapacity('pallets', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
