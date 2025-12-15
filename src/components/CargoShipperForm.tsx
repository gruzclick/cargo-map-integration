import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { searchWarehouses, type MarketplaceWarehouse } from '@/data/marketplaceWarehouses';
import { debounce } from '@/lib/debounce';
import { CargoItem, YandexSuggestion } from './cargo-shipper/types';
import { CargoItemCard } from './cargo-shipper/CargoItemCard';
import { isItemValid } from './cargo-shipper/LabelGenerator';

interface CargoShipperFormProps {
  onComplete: (items: CargoItem[]) => void;
  onBack: () => void;
}

const CargoShipperForm = ({ onComplete, onBack }: CargoShipperFormProps) => {
  const [cargoItems, setCargoItems] = useState<CargoItem[]>([{
    id: crypto.randomUUID(),
    boxQuantity: 0,
    palletQuantity: 0,
    warehouse: null,
    pickupAddress: '',
    pickupDate: '',
    pickupTime: '',
    photo: null,
    contactPhone: '',
    senderName: ''
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
        const apiKey = import.meta.env.VITE_YANDEX_MAPS_API_KEY || '';
        const response = await fetch(
          `https://suggest-maps.yandex.ru/v1/suggest?apikey=${apiKey}&text=${encodeURIComponent(query)}&results=5&types=house`
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
      boxQuantity: 0,
      palletQuantity: 0,
      warehouse: null,
      pickupAddress: '',
      pickupDate: '',
      pickupTime: '',
      photo: null,
      contactPhone: '',
      senderName: ''
    }]);
  };

  const removeItem = (itemId: string) => {
    if (cargoItems.length > 1) {
      setCargoItems(items => items.filter(item => item.id !== itemId));
    }
  };

  const canSubmit = cargoItems.every(isItemValid);

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto px-1">
      <div className="sticky top-0 bg-white dark:bg-gray-900 py-4 border-b z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <div>
              <h2 className="text-xl font-bold">Отправка груза</h2>
              <p className="text-sm text-gray-500">Заполните данные для каждого груза</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onBack}>
            <Icon name="X" size={20} />
          </Button>
        </div>
      </div>

      {cargoItems.map((item) => (
        <CargoItemCard
          key={item.id}
          item={item}
          canDelete={cargoItems.length > 1}
          warehouseSearch={warehouseSearch[item.id] || ''}
          warehouseResults={warehouseResults[item.id] || []}
          addressSuggestions={addressSuggestions[item.id] || []}
          loadingAddress={loadingAddresses[item.id] || false}
          onUpdate={(field, value) => updateItem(item.id, field, value)}
          onWarehouseSearch={(query) => handleWarehouseSearch(item.id, query)}
          onWarehouseSelect={(warehouse) => handleWarehouseSelect(item.id, warehouse)}
          onAddressChange={(address) => handleAddressChange(item.id, address)}
          onAddressSelect={(suggestion) => selectAddress(item.id, suggestion)}
          onPhotoUpload={(file) => updateItem(item.id, 'photo', file)}
          onDelete={() => removeItem(item.id)}
          onAddNew={addCargoItem}
        />
      ))}

      <div className="sticky bottom-0 bg-white dark:bg-gray-900 py-4 border-t">
        <Button
          onClick={() => onComplete(cargoItems)}
          disabled={!canSubmit}
          className="w-full"
        >
          Создать заявку
        </Button>
      </div>
    </div>
  );
};

export default CargoShipperForm;