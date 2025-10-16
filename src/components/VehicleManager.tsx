import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import Icon from './ui/icon';
import { useToast } from './ui/use-toast';

interface Vehicle {
  id: string;
  photo: string;
  licensePlate: string;
  palletCapacity: number;
  boxCapacity: number;
  maxWeight: number;
  status: 'available' | 'assigned' | 'rest';
}

export default function VehicleManager() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [newVehicle, setNewVehicle] = useState({
    licensePlate: '',
    palletCapacity: '',
    boxCapacity: '',
    maxWeight: ''
  });
  const { toast } = useToast();

  const userId = localStorage.getItem('userId') || '';

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch(`https://functions.poehali.dev/b388f085-faa7-4aab-88a5-b45708b116eb?user_id=${userId}&action=get_vehicles`);
      const data = await response.json();
      setVehicles(data.vehicles || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addVehicle = async () => {
    if (!photoPreview || !newVehicle.licensePlate || !newVehicle.palletCapacity || 
        !newVehicle.boxCapacity || !newVehicle.maxWeight) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля и добавьте фото',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch('https://functions.poehali.dev/b388f085-faa7-4aab-88a5-b45708b116eb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_vehicle',
          user_id: userId,
          photo: photoPreview,
          licensePlate: newVehicle.licensePlate,
          palletCapacity: parseInt(newVehicle.palletCapacity),
          boxCapacity: parseInt(newVehicle.boxCapacity),
          maxWeight: parseInt(newVehicle.maxWeight)
        })
      });

      if (response.ok) {
        toast({
          title: 'Автомобиль добавлен!',
          description: `${newVehicle.licensePlate} успешно зарегистрирован`
        });
        setShowAddForm(false);
        setPhotoPreview('');
        setNewVehicle({ licensePlate: '', palletCapacity: '', boxCapacity: '', maxWeight: '' });
        fetchVehicles();
      }
    } catch (error) {
      console.error('Error adding vehicle:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Мои автомобили</h2>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Icon name="Plus" size={20} className="mr-2" />
          Добавить автомобиль
        </Button>
      </div>

      {showAddForm && (
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Регистрация автомобиля</h3>
          
          <div>
            <Label>Фото автомобиля с регистрационным знаком</Label>
            <Input type="file" accept="image/*" onChange={handlePhotoChange} className="mt-2" />
            {photoPreview && (
              <img src={photoPreview} alt="Preview" className="mt-4 w-full h-48 object-cover rounded-lg" />
            )}
          </div>

          <div>
            <Label>Регистрационный номер</Label>
            <Input
              value={newVehicle.licensePlate}
              onChange={(e) => setNewVehicle({ ...newVehicle, licensePlate: e.target.value })}
              placeholder="А123БВ777"
              className="mt-2"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Вместимость паллет</Label>
              <Input
                type="number"
                value={newVehicle.palletCapacity}
                onChange={(e) => setNewVehicle({ ...newVehicle, palletCapacity: e.target.value })}
                placeholder="20"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Вместимость коробок</Label>
              <Input
                type="number"
                value={newVehicle.boxCapacity}
                onChange={(e) => setNewVehicle({ ...newVehicle, boxCapacity: e.target.value })}
                placeholder="300"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Грузоподъемность (кг)</Label>
              <Input
                type="number"
                value={newVehicle.maxWeight}
                onChange={(e) => setNewVehicle({ ...newVehicle, maxWeight: e.target.value })}
                placeholder="5000"
                className="mt-2"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={addVehicle}>Добавить</Button>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>Отмена</Button>
          </div>
        </Card>
      )}

      <div className="grid gap-4">
        {vehicles.map((vehicle) => (
          <Card key={vehicle.id} className="p-4">
            <div className="flex gap-4">
              <img src={vehicle.photo} alt={vehicle.licensePlate} className="w-32 h-24 object-cover rounded-lg" />
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">{vehicle.licensePlate}</h3>
                  <div className={`px-3 py-1 rounded-full text-sm ${
                    vehicle.status === 'available' ? 'bg-green-500/20 text-green-400' :
                    vehicle.status === 'assigned' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {vehicle.status === 'available' ? 'Свободен' : 
                     vehicle.status === 'assigned' ? 'На маршруте' : 'Отдых'}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Icon name="Package" size={16} className="text-primary" />
                    <span>{vehicle.palletCapacity} паллет</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="Box" size={16} className="text-primary" />
                    <span>{vehicle.boxCapacity} коробок</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="Weight" size={16} className="text-primary" />
                    <span>{vehicle.maxWeight} кг</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
