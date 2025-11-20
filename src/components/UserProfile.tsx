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

interface Vehicle {
  id: string;
  type: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  capacity: number;
  color: string;
}

interface UserProfileProps {
  user: any;
  onClose: () => void;
}

export const UserProfile = ({ user, onClose }: UserProfileProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'personal' | 'addresses' | 'vehicles'>('personal');
  
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone_number || '');
  const [telegram, setTelegram] = useState(user?.telegram || '');
  const [email, setEmail] = useState(user?.email || '');
  const [company, setCompany] = useState(user?.company || '');
  const [inn, setInn] = useState(user?.inn || '');
  
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    loadAddresses();
    loadVehicles();
  }, []);

  const loadAddresses = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/f06efb37-9437-4df8-8032-f2ba53b2e2d6', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_addresses',
          user_id: user.id
        })
      });
      const data = await response.json();
      if (response.ok) {
        setAddresses(data.addresses || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки адресов:', error);
    }
  };

  const loadVehicles = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/f06efb37-9437-4df8-8032-f2ba53b2e2d6', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_vehicles',
          user_id: user.id
        })
      });
      const data = await response.json();
      if (response.ok) {
        setVehicles(data.vehicles || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки транспорта:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/f06efb37-9437-4df8-8032-f2ba53b2e2d6', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_profile',
          user_id: user.id,
          full_name: fullName,
          phone_number: phone,
          telegram,
          email,
          company,
          inn
        })
      });

      if (response.ok) {
        toast({
          title: 'Профиль обновлен',
          description: 'Ваши данные успешно сохранены'
        });
      } else {
        throw new Error('Ошибка сохранения');
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleSaveAddress = async (address: Partial<UserAddress>) => {
    try {
      const response = await fetch('https://functions.poehali.dev/f06efb37-9437-4df8-8032-f2ba53b2e2d6', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: editingAddress ? 'update_address' : 'create_address',
          user_id: user.id,
          address_id: editingAddress?.id,
          ...address
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
      const response = await fetch('https://functions.poehali.dev/f06efb37-9437-4df8-8032-f2ba53b2e2d6', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_address',
          user_id: user.id,
          address_id: addressId
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

  const handleSaveVehicle = async (vehicle: Partial<Vehicle>) => {
    try {
      const response = await fetch('https://functions.poehali.dev/f06efb37-9437-4df8-8032-f2ba53b2e2d6', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: editingVehicle ? 'update_vehicle' : 'create_vehicle',
          user_id: user.id,
          vehicle_id: editingVehicle?.id,
          ...vehicle
        })
      });

      if (response.ok) {
        toast({
          title: 'Транспорт сохранен',
          description: 'Данные успешно обновлены'
        });
        loadVehicles();
        setShowVehicleForm(false);
        setEditingVehicle(null);
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!confirm('Удалить это транспортное средство?')) return;
    
    try {
      const response = await fetch('https://functions.poehali.dev/f06efb37-9437-4df8-8032-f2ba53b2e2d6', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_vehicle',
          user_id: user.id,
          vehicle_id: vehicleId
        })
      });

      if (response.ok) {
        toast({ title: 'Транспорт удален' });
        loadVehicles();
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
    <div className="fixed inset-0 bg-[#f4f4f5] dark:bg-[#18222d] z-50 overflow-y-auto">
      <div className="min-h-screen">
        <div className="sticky top-0 bg-white dark:bg-[#212e3a] border-b border-gray-200 dark:border-[#2b3943] z-10">
          <div className="flex items-center justify-between px-4 py-3 max-w-3xl mx-auto">
            <button onClick={onClose} className="p-2 -ml-2 text-blue-500 hover:bg-gray-100 dark:hover:bg-[#2b3943] rounded-lg transition-colors">
              <Icon name="ArrowLeft" size={24} />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Настройки</h1>
            <div className="w-10"></div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="flex border-b border-gray-200 dark:border-[#2b3943] bg-white dark:bg-[#212e3a]">
            <button
              onClick={() => setActiveTab('personal')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'personal'
                  ? 'text-blue-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Личные данные
              {activeTab === 'personal' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'addresses'
                  ? 'text-blue-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Адреса
              {activeTab === 'addresses' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('vehicles')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'vehicles'
                  ? 'text-blue-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Транспорт
              {activeTab === 'vehicles' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
              )}
            </button>
          </div>

          {activeTab === 'personal' && (
            <div className="bg-white dark:bg-[#212e3a]">
              <div className="p-4 space-y-2">
                <SettingItem label="ФИО" value={fullName} onChange={setFullName} />
                <SettingItem label="Телефон" value={phone} onChange={setPhone} type="tel" />
                <SettingItem label="Telegram" value={telegram} onChange={setTelegram} placeholder="@username" />
                <SettingItem label="Email" value={email} onChange={setEmail} type="email" />
                <SettingItem label="Компания" value={company} onChange={setCompany} />
                <SettingItem label="ИНН" value={inn} onChange={setInn} />
              </div>
              <div className="p-4">
                <button
                  onClick={handleSaveProfile}
                  className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
                >
                  Сохранить изменения
                </button>
              </div>
            </div>
          )}

          {activeTab === 'addresses' && (
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
            </div>
          )}

          {activeTab === 'vehicles' && (
            <div className="bg-white dark:bg-[#212e3a]">
              <div className="p-4">
                <button
                  onClick={() => setShowVehicleForm(true)}
                  className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Icon name="Plus" size={20} />
                  Добавить транспорт
                </button>
              </div>
              
              {vehicles.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <Icon name="Truck" size={48} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Нет добавленных транспортных средств</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-[#2b3943]">
                  {vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="p-4 hover:bg-gray-50 dark:hover:bg-[#1c2733] transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon name="Truck" size={18} className="text-orange-500 flex-shrink-0" />
                            <span className="font-medium text-gray-900 dark:text-white">
                              {vehicle.brand} {vehicle.model}
                            </span>
                            <span className="text-sm text-gray-500">({vehicle.year})</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {vehicle.type} • {vehicle.licensePlate}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {vehicle.capacity} кг • {vehicle.color}
                          </p>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <button
                            onClick={() => { setEditingVehicle(vehicle); setShowVehicleForm(true); }}
                            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          >
                            <Icon name="Edit" size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteVehicle(vehicle.id)}
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
            </div>
          )}
        </div>
      </div>
      
      {showAddressForm && (
        <AddressForm
          address={editingAddress}
          onSave={handleSaveAddress}
          onClose={() => { setShowAddressForm(false); setEditingAddress(null); }}
        />
      )}
      
      {showVehicleForm && (
        <VehicleForm
          vehicle={editingVehicle}
          onSave={handleSaveVehicle}
          onClose={() => { setShowVehicleForm(false); setEditingVehicle(null); }}
        />
      )}
    </div>
  );
};

const SettingItem = ({ label, value, onChange, type = 'text', placeholder = '' }: any) => (
  <div className="bg-gray-50 dark:bg-[#1c2733] rounded-lg p-3">
    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white text-base"
    />
  </div>
);

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

const VehicleForm = ({ vehicle, onSave, onClose }: any) => {
  const [formData, setFormData] = useState({
    type: vehicle?.type || 'Грузовик',
    brand: vehicle?.brand || '',
    model: vehicle?.model || '',
    year: vehicle?.year || new Date().getFullYear(),
    licensePlate: vehicle?.licensePlate || '',
    capacity: vehicle?.capacity || 0,
    color: vehicle?.color || ''
  });

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-[60]">
      <div className="w-full sm:max-w-md bg-white dark:bg-[#212e3a] sm:rounded-t-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-[#212e3a] border-b border-gray-200 dark:border-[#2b3943] p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {vehicle ? 'Редактировать транспорт' : 'Добавить транспорт'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2b3943] rounded-lg">
            <Icon name="X" size={20} />
          </button>
        </div>
        
        <div className="p-4 space-y-3">
          <div className="bg-gray-50 dark:bg-[#1c2733] rounded-lg p-3">
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Тип транспорта</label>
            <input
              type="text"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              placeholder="Грузовик, Фургон..."
              className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white text-base"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-[#1c2733] rounded-lg p-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Марка</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="КАМАЗ, ГАЗ..."
                className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white text-base"
              />
            </div>
            <div className="bg-gray-50 dark:bg-[#1c2733] rounded-lg p-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Модель</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="3310, Валдай..."
                className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white text-base"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-[#1c2733] rounded-lg p-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Год выпуска</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white text-base"
              />
            </div>
            <div className="bg-gray-50 dark:bg-[#1c2733] rounded-lg p-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Номер</label>
              <input
                type="text"
                value={formData.licensePlate}
                onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                placeholder="А123БВ777"
                className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white text-base"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-[#1c2733] rounded-lg p-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Грузоподъемность (кг)</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white text-base"
              />
            </div>
            <div className="bg-gray-50 dark:bg-[#1c2733] rounded-lg p-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Цвет</label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="Белый, Синий..."
                className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white text-base"
              />
            </div>
          </div>
          
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
