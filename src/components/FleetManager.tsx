import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import Icon from './ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Vehicle {
  id: string;
  type: string;
  brand: string;
  model: string;
  year: string;
  plate: string;
  capacity: string;
  status: 'available' | 'busy' | 'maintenance';
  availability: 'today' | 'permanent';
}

export default function FleetManager() {
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: '1',
      type: 'van_small',
      brand: 'ГАЗ',
      model: 'Газель Next',
      year: '2021',
      plate: 'А123БВ777',
      capacity: '1.5',
      status: 'available',
      availability: 'permanent'
    }
  ]);

  const [newVehicle, setNewVehicle] = useState({
    type: 'van_small',
    brand: '',
    model: '',
    year: '',
    plate: '',
    capacity: '',
    availability: 'permanent' as 'today' | 'permanent'
  });

  const vehicleTypes = [
    { value: 'car_small', label: 'Легковой автомобиль' },
    { value: 'van_small', label: 'Малый фургон (Газель)' },
    { value: 'van_medium', label: 'Средний фургон' },
    { value: 'van_large', label: 'Большой фургон' },
    { value: 'truck_1.5t', label: 'Грузовик до 1.5т' },
    { value: 'truck_3t', label: 'Грузовик до 3т' },
    { value: 'truck_5t', label: 'Грузовик до 5т' },
    { value: 'truck_10t', label: 'Грузовик до 10т' },
    { value: 'truck_20t', label: 'Грузовик до 20т' },
    { value: 'truck_trailer', label: 'Грузовик с прицепом' },
    { value: 'truck_refrigerator', label: 'Рефрижератор' },
    { value: 'truck_isothermal', label: 'Изотермический фургон' },
    { value: 'truck_flatbed', label: 'Бортовой грузовик' },
    { value: 'truck_container', label: 'Контейнеровоз' },
    { value: 'semi_truck', label: 'Седельный тягач' }
  ];

  const handleAddVehicle = () => {
    if (!newVehicle.brand || !newVehicle.model || !newVehicle.plate || !newVehicle.capacity) {
      toast({
        title: 'Заполните все поля',
        variant: 'destructive'
      });
      return;
    }

    const vehicle: Vehicle = {
      id: Date.now().toString(),
      ...newVehicle,
      status: 'available'
    };

    setVehicles([...vehicles, vehicle]);
    setNewVehicle({
      type: 'van_small',
      brand: '',
      model: '',
      year: '',
      plate: '',
      capacity: '',
      availability: 'permanent'
    });

    toast({
      title: 'Автомобиль добавлен',
      description: `${newVehicle.brand} ${newVehicle.model} успешно добавлен в автопарк`
    });
  };

  const handleDeleteVehicle = (id: string) => {
    setVehicles(vehicles.filter(v => v.id !== id));
    toast({
      title: 'Автомобиль удалён',
      description: 'Автомобиль удалён из автопарка'
    });
  };

  const handleStatusChange = (id: string, status: Vehicle['status']) => {
    setVehicles(vehicles.map(v => v.id === id ? { ...v, status } : v));
    toast({
      title: 'Статус изменён',
      description: `Статус автомобиля обновлён`
    });
  };

  const getStatusBadge = (status: Vehicle['status']) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Доступен</Badge>;
      case 'busy':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Занят</Badge>;
      case 'maintenance':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Ремонт</Badge>;
    }
  };

  const getAvailabilityBadge = (availability: Vehicle['availability']) => {
    return availability === 'today' 
      ? <Badge variant="outline" className="text-xs">Только сегодня</Badge>
      : <Badge variant="outline" className="text-xs">Постоянно</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-border/50">
        <CardHeader className="bg-gradient-to-r from-accent/10 to-orange-500/10 border-b">
          <CardTitle className="flex items-center gap-2">
            <Icon name="PlusCircle" size={24} className="text-accent" />
            Добавить автомобиль
          </CardTitle>
          <CardDescription>Добавьте транспорт в ваш автопарк</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Тип транспорта</Label>
              <Select value={newVehicle.type} onValueChange={(val) => setNewVehicle({ ...newVehicle, type: val })}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {vehicleTypes.map(vt => (
                    <SelectItem key={vt.value} value={vt.value}>{vt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Доступность</Label>
              <Select value={newVehicle.availability} onValueChange={(val: 'today' | 'permanent') => setNewVehicle({ ...newVehicle, availability: val })}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="permanent">Постоянно доступен</SelectItem>
                  <SelectItem value="today">Только сегодня</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Марка</Label>
              <Input className="h-11 rounded-xl" placeholder="ГАЗ" value={newVehicle.brand} onChange={(e) => setNewVehicle({ ...newVehicle, brand: e.target.value })} />
            </div>
            <div>
              <Label>Модель</Label>
              <Input className="h-11 rounded-xl" placeholder="Газель Next" value={newVehicle.model} onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })} />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Год выпуска</Label>
              <Input className="h-11 rounded-xl" placeholder="2021" value={newVehicle.year} onChange={(e) => setNewVehicle({ ...newVehicle, year: e.target.value })} />
            </div>
            <div>
              <Label>Гос. номер</Label>
              <Input className="h-11 rounded-xl" placeholder="А123БВ777" value={newVehicle.plate} onChange={(e) => setNewVehicle({ ...newVehicle, plate: e.target.value })} />
            </div>
            <div>
              <Label>Грузоподъёмность (т)</Label>
              <Input className="h-11 rounded-xl" type="number" step="0.1" placeholder="1.5" value={newVehicle.capacity} onChange={(e) => setNewVehicle({ ...newVehicle, capacity: e.target.value })} />
            </div>
          </div>

          <Button onClick={handleAddVehicle} className="w-full h-11 rounded-xl gap-2 bg-gradient-to-r from-accent to-orange-600 hover:from-accent/90 hover:to-orange-600/90">
            <Icon name="PlusCircle" size={18} />
            Добавить автомобиль
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-border/50">
        <CardHeader className="bg-gradient-to-r from-accent/10 to-orange-500/10 border-b">
          <CardTitle className="flex items-center gap-2">
            <Icon name="Truck" size={24} className="text-accent" />
            Мой автопарк ({vehicles.length})
          </CardTitle>
          <CardDescription>Управление вашим транспортом</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {vehicles.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Icon name="Truck" size={48} className="mx-auto mb-4 opacity-30" />
              <p>У вас пока нет автомобилей в автопарке</p>
            </div>
          ) : (
            <div className="space-y-4">
              {vehicles.map(vehicle => (
                <Card key={vehicle.id} className="border-border/50 hover:border-accent/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4 flex-1">
                        <div className="w-14 h-14 bg-gradient-to-br from-accent/20 to-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Icon name="Truck" size={28} className="text-accent" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-lg">{vehicle.brand} {vehicle.model}</h3>
                            {getStatusBadge(vehicle.status)}
                            {getAvailabilityBadge(vehicle.availability)}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Icon name="Calendar" size={14} />
                              <span>{vehicle.year || 'Н/Д'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Icon name="Hash" size={14} />
                              <span>{vehicle.plate}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Icon name="Package" size={14} />
                              <span>{vehicle.capacity}т</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Icon name="Tag" size={14} />
                              <span>{vehicleTypes.find(vt => vt.value === vehicle.type)?.label}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Select value={vehicle.status} onValueChange={(val: Vehicle['status']) => handleStatusChange(vehicle.id, val)}>
                              <SelectTrigger className="h-9 w-[140px] text-xs rounded-lg">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="available">Доступен</SelectItem>
                                <SelectItem value="busy">Занят</SelectItem>
                                <SelectItem value="maintenance">Ремонт</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteVehicle(vehicle.id)} className="h-9 rounded-lg">
                              <Icon name="Trash2" size={14} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-accent/5 border-accent/30 shadow-lg">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Icon name="Info" size={20} className="text-accent flex-shrink-0 mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-semibold text-accent">Управление автопарком</p>
              <ul className="text-muted-foreground space-y-0.5 list-disc list-inside">
                <li>Добавляйте все доступные автомобили для получения большего количества заказов</li>
                <li>"Только сегодня" — автомобиль временно доступен (например, арендованный)</li>
                <li>"Постоянно" — ваш собственный транспорт, всегда в наличии</li>
                <li>Обновляйте статус при выполнении заказа или ремонте</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}