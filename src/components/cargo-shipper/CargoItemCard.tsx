import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { MarketplaceWarehouse } from '@/data/marketplaceWarehouses';
import { CargoItem, YandexSuggestion } from './types';
import { generateLabel, isItemValid, getCargoItemName } from './LabelGenerator';

interface CargoItemCardProps {
  item: CargoItem;
  canDelete: boolean;
  warehouseSearch: string;
  warehouseResults: MarketplaceWarehouse[];
  addressSuggestions: YandexSuggestion[];
  loadingAddress: boolean;
  onUpdate: (field: keyof CargoItem, value: any) => void;
  onWarehouseSearch: (query: string) => void;
  onWarehouseSelect: (warehouse: MarketplaceWarehouse) => void;
  onAddressChange: (address: string) => void;
  onAddressSelect: (suggestion: YandexSuggestion) => void;
  onPhotoUpload: (file: File) => void;
  onDelete: () => void;
  onAddNew: () => void;
}

export const CargoItemCard = ({
  item,
  canDelete,
  warehouseSearch,
  warehouseResults,
  addressSuggestions,
  loadingAddress,
  onUpdate,
  onWarehouseSearch,
  onWarehouseSelect,
  onAddressChange,
  onAddressSelect,
  onPhotoUpload,
  onDelete,
  onAddNew
}: CargoItemCardProps) => {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-4 bg-gray-50 dark:bg-gray-800/50">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{getCargoItemName(item)}</h3>
        {canDelete && (
          <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-600">
            <Icon name="Trash2" size={16} />
          </Button>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">Тип груза *</label>
          <Button
            onClick={onAddNew}
            variant="outline"
            size="sm"
          >
            <Icon name="Plus" size={14} className="mr-1" />
            Добавить груз
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Package" size={20} />
              <span className="font-medium text-sm">Короба</span>
            </div>
            <input
              type="number"
              min="0"
              value={item.boxQuantity}
              onChange={(e) => onUpdate('boxQuantity', parseInt(e.target.value) || 0)}
              placeholder="0"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
          </div>
          <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Container" size={20} />
              <span className="font-medium text-sm">Паллеты</span>
            </div>
            <input
              type="number"
              min="0"
              value={item.palletQuantity}
              onChange={(e) => onUpdate('palletQuantity', parseInt(e.target.value) || 0)}
              placeholder="0"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Имя отправителя *</label>
        <input
          type="text"
          value={item.senderName}
          onChange={(e) => onUpdate('senderName', e.target.value)}
          placeholder="Иванов Иван"
          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
        />
      </div>

      <div className="relative">
        <label className="block text-sm font-medium mb-2">Склад назначения *</label>
        <input
          type="text"
          value={warehouseSearch}
          onChange={(e) => onWarehouseSearch(e.target.value)}
          placeholder="Например: Вайлдберриз Подольск, Озон Тверь..."
          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
        />
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
        <p className="text-xs text-gray-500 mt-1">Можно ввести название склада без выбора из списка</p>
      </div>

      <div className="relative">
        <label className="block text-sm font-medium mb-2">Адрес погрузки груза *</label>
        <input
          type="text"
          value={item.pickupAddress}
          onChange={(e) => onAddressChange(e.target.value)}
          placeholder="Начните вводить: Москва, ул. Примерная..."
          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
        />
        {loadingAddress && (
          <div className="absolute right-3 top-10 text-gray-400">
            <Icon name="Loader2" size={16} className="animate-spin" />
          </div>
        )}
        {addressSuggestions.length > 0 && (
          <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {addressSuggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => onAddressSelect(suggestion)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b last:border-b-0"
              >
                <div className="font-medium text-sm">{suggestion.title}</div>
                {suggestion.subtitle && (
                  <div className="text-xs text-gray-500">{suggestion.subtitle}</div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Дата отгрузки на склад *</label>
        <input
          type="date"
          value={item.deliveryDate}
          onChange={(e) => onUpdate('deliveryDate', e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-2">Дата погрузки *</label>
          <input
            type="date"
            value={item.pickupDate}
            onChange={(e) => onUpdate('pickupDate', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Время погрузки *</label>
          <input
            type="time"
            value={item.pickupTime}
            onChange={(e) => onUpdate('pickupTime', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Как проехать</label>
        <textarea
          value={item.pickupInstructions}
          onChange={(e) => onUpdate('pickupInstructions', e.target.value)}
          placeholder="Укажите особенности проезда: нужен пропуск, въезд платный, идет ремонт дороги..."
          rows={3}
          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Телефон для связи *</label>
        <input
          type="tel"
          value={item.contactPhone}
          onChange={(e) => onUpdate('contactPhone', e.target.value)}
          placeholder="+7 (999) 123-45-67"
          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Фото груза</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onPhotoUpload(file);
          }}
          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Скачать термонаклейку</label>
        <div className="flex gap-2">
          <Button
            onClick={async () => await generateLabel(item, '75x120')}
            disabled={!isItemValid(item)}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Icon name="Download" size={16} className="mr-2" />
            120×75 мм
          </Button>
          <Button
            onClick={async () => await generateLabel(item, '58x40')}
            disabled={!isItemValid(item)}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Icon name="Download" size={16} className="mr-2" />
            58×40 мм
          </Button>
        </div>
      </div>
    </div>
  );
};