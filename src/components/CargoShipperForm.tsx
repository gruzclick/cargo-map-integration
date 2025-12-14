import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { searchWarehouses, type MarketplaceWarehouse } from '@/data/marketplaceWarehouses';
import { debounce } from '@/lib/debounce';

interface CargoItem {
  id: string;
  type: 'box' | 'pallet';
  quantity: number;
  warehouse: MarketplaceWarehouse | null;
  pickupAddress: string;
  pickupDate: string;
  pickupTime: string;
  photo: File | null;
  contactPhone: string;
}

interface YandexSuggestion {
  title: string;
  subtitle?: string;
  description: string;
}

interface CargoShipperFormProps {
  onComplete: (items: CargoItem[]) => void;
  onBack: () => void;
}

const CargoShipperForm = ({ onComplete, onBack }: CargoShipperFormProps) => {
  const [cargoItems, setCargoItems] = useState<CargoItem[]>([{
    id: crypto.randomUUID(),
    type: 'box',
    quantity: 1,
    warehouse: null,
    pickupAddress: '',
    pickupDate: '',
    pickupTime: '',
    photo: null,
    contactPhone: ''
  }]);
  
  const [warehouseSearch, setWarehouseSearch] = useState<{[key: string]: string}>({});
  const [warehouseResults, setWarehouseResults] = useState<{[key: string]: MarketplaceWarehouse[]}>({});
  const [addressSuggestions, setAddressSuggestions] = useState<{[key: string]: YandexSuggestion[]}>({});
  const [loadingAddresses, setLoadingAddresses] = useState<{[key: string]: boolean}>({});

  const handleWarehouseSearch = (itemId: string, query: string) => {
    setWarehouseSearch(prev => ({ ...prev, [itemId]: query }));
    if (query.length >= 2) {
      const results = searchWarehouses(query);
      setWarehouseResults(prev => ({ ...prev, [itemId]: results }));
    } else {
      setWarehouseResults(prev => ({ ...prev, [itemId]: [] }));
    }
  };

  const handleWarehouseSelect = (itemId: string, warehouse: MarketplaceWarehouse) => {
    setCargoItems(items => items.map(item => 
      item.id === itemId ? { ...item, warehouse } : item
    ));
    setWarehouseSearch(prev => ({ 
      ...prev, 
      [itemId]: `${warehouse.marketplace} - ${warehouse.city}, ${warehouse.address}` 
    }));
    setWarehouseResults(prev => ({ ...prev, [itemId]: [] }));
  };

  const searchYandexAddress = useCallback(
    debounce(async (itemId: string, query: string) => {
      if (query.length < 3) {
        setAddressSuggestions(prev => ({ ...prev, [itemId]: [] }));
        return;
      }

      setLoadingAddresses(prev => ({ ...prev, [itemId]: true }));
      
      try {
        const response = await fetch(
          `https://suggest-maps.yandex.ru/v1/suggest?apikey=YOUR_KEY&text=${encodeURIComponent(query)}&results=5&types=house`
        );
        const data = await response.json();
        
        const suggestions: YandexSuggestion[] = data.results?.map((item: any) => ({
          title: item.title?.text || '',
          subtitle: item.subtitle?.text,
          description: item.title?.text || ''
        })) || [];
        
        setAddressSuggestions(prev => ({ ...prev, [itemId]: suggestions }));
      } catch (error) {
        console.error('Address search error:', error);
        setAddressSuggestions(prev => ({ ...prev, [itemId]: [] }));
      } finally {
        setLoadingAddresses(prev => ({ ...prev, [itemId]: false }));
      }
    }, 500),
    []
  );

  const handleAddressChange = (itemId: string, address: string) => {
    updateItem(itemId, 'pickupAddress', address);
    searchYandexAddress(itemId, address);
  };

  const selectAddress = (itemId: string, suggestion: YandexSuggestion) => {
    updateItem(itemId, 'pickupAddress', suggestion.description);
    setAddressSuggestions(prev => ({ ...prev, [itemId]: [] }));
  };

  const updateItem = (itemId: string, field: keyof CargoItem, value: any) => {
    setCargoItems(items => items.map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    ));
  };

  const addCargoItem = () => {
    setCargoItems([...cargoItems, {
      id: crypto.randomUUID(),
      type: 'box',
      quantity: 1,
      warehouse: null,
      pickupAddress: '',
      pickupDate: '',
      pickupTime: '',
      photo: null,
      contactPhone: ''
    }]);
  };

  const removeItem = (itemId: string) => {
    if (cargoItems.length > 1) {
      setCargoItems(items => items.filter(item => item.id !== itemId));
    }
  };

  const generateLabel = (item: CargoItem, format: '75x120' | '58x40') => {
    if (!item.warehouse || !item.pickupDate || !item.contactPhone) {
      alert('⚠️ Заполните все обязательные поля: склад назначения, дата и номер телефона');
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (format === '75x120') {
      canvas.width = 283; // 75mm at 96dpi
      canvas.height = 453; // 120mm at 96dpi
    } else {
      canvas.width = 219; // 58mm at 96dpi
      canvas.height = 151; // 40mm at 96dpi
    }

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    
    const centerX = canvas.width / 2;
    let y;
    const isLarge = format === '75x120';
    const titleSize = isLarge ? 16 : 12;
    const headerSize = isLarge ? 11 : 9;
    const textSize = isLarge ? 10 : 8;
    const boldSize = isLarge ? 13 : 10;
    const lineHeight = isLarge ? 20 : 14;
    const spacing = isLarge ? 10 : 6;
    
    y = isLarge ? 30 : 18;
    ctx.font = `bold ${titleSize}px Arial`;
    ctx.fillText('ИНФОРМАЦИЯ ДЛЯ ВОДИТЕЛЯ', centerX, y);
    
    y += isLarge ? 25 : 16;
    ctx.font = `${headerSize}px Arial`;
    ctx.fillText('Склад назначения:', centerX, y);
    
    y += lineHeight;
    ctx.font = `bold ${textSize}px Arial`;
    ctx.fillText(`${item.warehouse.marketplace}`, centerX, y);
    
    y += isLarge ? 16 : 12;
    ctx.font = `${textSize}px Arial`;
    const maxChars = isLarge ? 35 : 28;
    const addressLines = item.warehouse.address.match(new RegExp(`.{1,${maxChars}}`, 'g')) || [];
    addressLines.forEach(line => {
      ctx.fillText(line.trim(), centerX, y);
      y += isLarge ? 14 : 10;
    });
    
    y += spacing;
    ctx.font = `${headerSize}px Arial`;
    ctx.fillText('Дата поставки:', centerX, y);
    
    y += lineHeight;
    ctx.font = `bold ${boldSize}px Arial`;
    ctx.fillText(new Date(item.pickupDate).toLocaleDateString('ru-RU'), centerX, y);
    
    y += isLarge ? 25 : 16;
    ctx.font = `${headerSize}px Arial`;
    ctx.fillText('Контакт:', centerX, y);
    
    y += lineHeight;
    ctx.font = `bold ${boldSize}px Arial`;
    ctx.fillText(item.contactPhone, centerX, y);
    
    y += isLarge ? 25 : 16;
    ctx.font = `${textSize}px Arial`;
    ctx.fillText(`${item.type === 'box' ? 'Короб' : 'Паллет'} - ${item.quantity} шт`, centerX, y);

    const link = document.createElement('a');
    link.download = `label_${format}_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const isItemValid = (item: CargoItem) => {
    return item.warehouse && item.pickupAddress && item.pickupDate && 
           item.pickupTime && item.contactPhone && item.quantity > 0;
  };

  const canSubmit = cargoItems.every(isItemValid);

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto px-1">
      <div className="flex items-center gap-3 sticky top-0 bg-white dark:bg-gray-900 py-4 border-b z-10">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <Icon name="ArrowLeft" size={20} />
        </Button>
        <div>
          <h2 className="text-xl font-bold">Отправка груза</h2>
          <p className="text-sm text-gray-500">Заполните данные для каждого груза</p>
        </div>
      </div>

      {cargoItems.map((item, index) => (
        <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-4 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Груз #{index + 1}</h3>
            {cargoItems.length > 1 && (
              <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)} className="text-red-600">
                <Icon name="Trash2" size={16} />
              </Button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Тип груза *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => updateItem(item.id, 'type', 'box')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  item.type === 'box'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon name="Package" size={32} className="mx-auto mb-2" />
                <div className="font-medium">Короб</div>
              </button>
              <button
                onClick={() => updateItem(item.id, 'type', 'pallet')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  item.type === 'pallet'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon name="Container" size={32} className="mx-auto mb-2" />
                <div className="font-medium">Паллет</div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Количество *</label>
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium mb-2">Склад назначения *</label>
            <input
              type="text"
              value={warehouseSearch[item.id] || ''}
              onChange={(e) => handleWarehouseSearch(item.id, e.target.value)}
              placeholder="Начните вводить: Wildberries, Ozon, Москва..."
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
            {warehouseResults[item.id]?.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {warehouseResults[item.id].map((warehouse, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleWarehouseSelect(item.id, warehouse)}
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

          <div className="relative">
            <label className="block text-sm font-medium mb-2">Адрес забора груза *</label>
            <input
              type="text"
              value={item.pickupAddress}
              onChange={(e) => handleAddressChange(item.id, e.target.value)}
              placeholder="Начните вводить: Москва, ул. Примерная..."
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
            {loadingAddresses[item.id] && (
              <div className="absolute right-3 top-10 text-gray-400">
                <Icon name="Loader2" size={16} className="animate-spin" />
              </div>
            )}
            {addressSuggestions[item.id]?.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {addressSuggestions[item.id].map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => selectAddress(item.id, suggestion)}
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2">Дата забора *</label>
              <input
                type="date"
                value={item.pickupDate}
                onChange={(e) => updateItem(item.id, 'pickupDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Время забора *</label>
              <input
                type="time"
                value={item.pickupTime}
                onChange={(e) => updateItem(item.id, 'pickupTime', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Контактный телефон *</label>
            <input
              type="tel"
              value={item.contactPhone}
              onChange={(e) => updateItem(item.id, 'contactPhone', e.target.value)}
              placeholder="+7 (999) 123-45-67"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Фото груза (опционально)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => updateItem(item.id, 'photo', e.target.files?.[0] || null)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
          </div>

          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium mb-3">Скачать термонаклейку:</p>
            <div className="flex gap-2">
              <Button
                onClick={() => generateLabel(item, '75x120')}
                disabled={!isItemValid(item)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Icon name="Download" size={16} className="mr-2" />
                75×120 мм
              </Button>
              <Button
                onClick={() => generateLabel(item, '58x40')}
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
      ))}

      <div className="flex gap-3 sticky bottom-0 bg-white dark:bg-gray-900 py-4 border-t">
        <Button
          onClick={addCargoItem}
          variant="outline"
          className="flex-1"
        >
          <Icon name="Plus" size={16} className="mr-2" />
          Добавить груз
        </Button>
        <Button
          onClick={() => onComplete(cargoItems)}
          disabled={!canSubmit}
          className="flex-1"
        >
          Создать заявку
        </Button>
      </div>
    </div>
  );
};

export default CargoShipperForm;