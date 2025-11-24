import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface UserAddress {
  id: string;
  type: 'warehouse' | 'office';
  name: string;
  address: string;
  city: string;
  postcode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

interface AddressesTabProps {
  user: any;
}

export const AddressesTab = ({ user }: AddressesTabProps) => {
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const funcUrls = await import('../../../backend/func2url.json');
      const response = await fetch(funcUrls.profile, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Id': user.id
        }
      });
      const data = await response.json();
      if (response.ok) {
        setAddresses(data.addresses.map((a: any) => ({
          id: a.id,
          type: a.type,
          name: a.name,
          address: a.address,
          city: a.city,
          postcode: a.postcode,
          country: a.country,
          phone: a.phone,
          isDefault: a.is_default
        })) || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки адресов:', error);
    }
  };

  const handleSaveAddress = async (address: Partial<UserAddress>) => {
    try {
      const funcUrls = await import('../../../backend/func2url.json');
      const response = await fetch(funcUrls.profile, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Id': user.id
        },
        body: JSON.stringify({
          type: 'address',
          address_type: address.type || 'warehouse',
          name: address.name,
          address: address.address,
          city: address.city,
          postcode: address.postcode,
          country: address.country,
          phone: address.phone,
          is_default: address.isDefault
        })
      });

      if (response.ok) {
        toast({
          title: 'Адрес сохранен',
          description: 'Данные успешно обновлены'
        });
        loadAddresses();
        setShowAddressForm(false);
        setEditingAddress(null);
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Удалить этот адрес?')) return;
    
    try {
      const funcUrls = await import('../../../backend/func2url.json');
      const response = await fetch(funcUrls.profile, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Id': user.id
        },
        body: JSON.stringify({
          type: 'address',
          id: addressId
        })
      });

      if (response.ok) {
        toast({ title: 'Адрес удален' });
        loadAddresses();
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="bg-white dark:bg-[#212e3a]">
      <div className="p-4">
        <button
          onClick={() => setShowAddressForm(true)}
          className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Icon name="Plus" size={20} />
          Добавить адрес
        </button>
      </div>
      
      {addresses.length === 0 ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <Icon name="MapPin" size={48} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">Нет сохраненных адресов</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-[#2b3943]">
          {addresses.map((addr) => (
            <div key={addr.id} className="p-4 hover:bg-gray-50 dark:hover:bg-[#1c2733] transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon name={addr.type === 'warehouse' ? 'Warehouse' : 'Building2'} size={18} className="text-blue-500 flex-shrink-0" />
                    <span className="font-medium text-gray-900 dark:text-white truncate">{addr.name}</span>
                    {addr.isDefault && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded flex-shrink-0">
                        По умолчанию
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{addr.address}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {addr.city}, {addr.postcode} • {addr.phone}
                  </p>
                </div>
                <div className="flex gap-1 ml-2">
                  <button
                    onClick={() => { setEditingAddress(addr); setShowAddressForm(true); }}
                    className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <Icon name="Edit" size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Icon name="Trash2" size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {showAddressForm && (
        <AddressForm
          address={editingAddress}
          onSave={handleSaveAddress}
          onClose={() => { setShowAddressForm(false); setEditingAddress(null); }}
        />
      )}
    </div>
  );
};

const AddressForm = ({ address, onSave, onClose }: any) => {
  const [formData, setFormData] = useState({
    type: address?.type || 'warehouse',
    name: address?.name || '',
    address: address?.address || '',
    city: address?.city || '',
    postcode: address?.postcode || '',
    country: address?.country || 'Россия',
    phone: address?.phone || '',
    isDefault: address?.isDefault || false
  });

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-[60]">
      <div className="w-full sm:max-w-md bg-white dark:bg-[#212e3a] sm:rounded-t-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-[#212e3a] border-b border-gray-200 dark:border-[#2b3943] p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {address ? 'Редактировать адрес' : 'Добавить адрес'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2b3943] rounded-lg">
            <Icon name="X" size={20} />
          </button>
        </div>
        
        <div className="p-4 space-y-3">
          <div className="bg-gray-50 dark:bg-[#1c2733] rounded-lg p-3">
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Тип</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white text-base"
            >
              <option value="warehouse">Склад</option>
              <option value="office">Офис</option>
            </select>
          </div>
          
          <div className="bg-gray-50 dark:bg-[#1c2733] rounded-lg p-3">
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Название</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Например: Главный склад"
              className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white text-base"
            />
          </div>
          
          <div className="bg-gray-50 dark:bg-[#1c2733] rounded-lg p-3">
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Адрес</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Улица, дом"
              className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white text-base"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-[#1c2733] rounded-lg p-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Город</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white text-base"
              />
            </div>
            <div className="bg-gray-50 dark:bg-[#1c2733] rounded-lg p-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Индекс</label>
              <input
                type="text"
                value={formData.postcode}
                onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white text-base"
              />
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-[#1c2733] rounded-lg p-3">
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Телефон</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+7"
              className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white text-base"
            />
          </div>
          
          <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#1c2733] rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="w-5 h-5 accent-blue-500"
            />
            <span className="text-sm text-gray-900 dark:text-white">Использовать по умолчанию</span>
          </label>
          
          <button
            onClick={() => onSave(formData)}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors mt-4"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};