import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { ImageCropper } from '@/components/ImageCropper';

interface Vehicle {
  id: string;
  type: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  capacity: number;
  color: string;
  photo?: string;
}

interface VehiclesTabProps {
  user: any;
}

export const VehiclesTab = ({ user }: VehiclesTabProps) => {
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    loadVehicles();
  }, []);

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

const VehicleForm = ({ vehicle, onSave, onClose }: any) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    type: vehicle?.type || 'Грузовик',
    brand: vehicle?.brand || '',
    model: vehicle?.model || '',
    year: vehicle?.year || new Date().getFullYear(),
    licensePlate: vehicle?.licensePlate || '',
    capacity: vehicle?.capacity || 0,
    color: vehicle?.color || '',
    photo: vehicle?.photo || ''
  });
  const [tempPhoto, setTempPhoto] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('\u0420\u0430\u0437\u043c\u0435\u0440 \u0444\u0430\u0439\u043b\u0430 \u043d\u0435 \u0434\u043e\u043b\u0436\u0435\u043d \u043f\u0440\u0435\u0432\u044b\u0448\u0430\u0442\u044c 10 \u041c\u0411');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setTempPhoto(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedImage: string) => {
    setFormData({ ...formData, photo: croppedImage });
    setShowCropper(false);
    setTempPhoto(null);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setTempPhoto(null);
  };

  return (
    <>
      {showCropper && tempPhoto && (
        <ImageCropper
          image={tempPhoto}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={4 / 3}
          shape="rect"
        />
      )}
      
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
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-40 h-40 rounded-lg bg-gray-200 dark:bg-[#1c2733] flex items-center justify-center overflow-hidden">
                {formData.photo ? (
                  <img src={formData.photo} alt="Транспорт" className="w-full h-full object-cover" />
                ) : (
                  <Icon name="Truck" size={48} className="text-gray-400" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              >
                <Icon name="Camera" size={16} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
          </div>
          
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
    </>
  );
};