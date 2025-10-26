import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Vehicle {
  id: string;
  driverId: string;
  driverName: string;
  brand: string;
  model: string;
  plateNumber: string;
  type: string;
  status: 'active' | 'inactive' | 'maintenance';
  totalTrips: number;
}

export default function AdminTransport() {
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive', icon: string, text: string }> = {
      active: { variant: 'default', icon: 'CheckCircle', text: 'Активен' },
      inactive: { variant: 'secondary', icon: 'Circle', text: 'Неактивен' },
      maintenance: { variant: 'destructive', icon: 'Wrench', text: 'На ремонте' }
    };
    const config = variants[status];
    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon name={config.icon as any} size={12} />
        {config.text}
      </Badge>
    );
  };

  const handleChangeStatus = (vehicleId: string, newStatus: 'active' | 'inactive' | 'maintenance') => {
    setVehicles(vehicles.map(v => v.id === vehicleId ? { ...v, status: newStatus } : v));
    toast({
      title: 'Статус обновлен',
      description: 'Статус транспорта успешно изменен'
    });
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    if (!window.confirm('Удалить транспортное средство? Это действие необратимо.')) return;
    setVehicles(vehicles.filter(v => v.id !== vehicleId));
    toast({
      title: 'ТС удалено',
      description: 'Транспортное средство удалено из базы',
      variant: 'destructive'
    });
  };

  const filteredVehicles = vehicles.filter(v => {
    const matchesFilter = filter === 'all' || v.status === filter;
    const matchesSearch = v.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         v.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: vehicles.length,
    active: vehicles.filter(v => v.status === 'active').length,
    maintenance: vehicles.filter(v => v.status === 'maintenance').length,
    inactive: vehicles.filter(v => v.status === 'inactive').length
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => window.history.back()}>
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Icon name="Truck" size={32} />
              Управление транспортом
            </h1>
            <p className="text-muted-foreground">База автомобилей и статистика</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Всего ТС</CardDescription>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Активных</CardDescription>
              <CardTitle className="text-3xl text-green-600">{stats.active}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>На ремонте</CardDescription>
              <CardTitle className="text-3xl text-orange-600">{stats.maintenance}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Неактивных</CardDescription>
              <CardTitle className="text-3xl text-gray-600">{stats.inactive}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>База транспортных средств</CardTitle>
              <Button>
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить ТС
              </Button>
            </div>
            <CardDescription>Все зарегистрированные автомобили водителей</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Поиск по водителю, номеру, марке..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  <SelectItem value="active">Активные</SelectItem>
                  <SelectItem value="inactive">Неактивные</SelectItem>
                  <SelectItem value="maintenance">На ремонте</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredVehicles.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Icon name="Truck" size={64} className="mx-auto mb-4 opacity-20" />
                <p className="text-lg">Транспортные средства не добавлены</p>
                <p className="text-sm">Нажмите "Добавить ТС" чтобы зарегистрировать автомобиль</p>
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Водитель</TableHead>
                      <TableHead>Автомобиль</TableHead>
                      <TableHead className="hidden md:table-cell">Гос. номер</TableHead>
                      <TableHead className="hidden lg:table-cell">Тип</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead className="hidden md:table-cell">Рейсы</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVehicles.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell className="font-medium">{vehicle.driverName}</TableCell>
                        <TableCell>{vehicle.brand} {vehicle.model}</TableCell>
                        <TableCell className="font-mono hidden md:table-cell">{vehicle.plateNumber}</TableCell>
                        <TableCell className="hidden lg:table-cell">{vehicle.type}</TableCell>
                        <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                        <TableCell className="hidden md:table-cell">{vehicle.totalTrips}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Select
                              value={vehicle.status}
                              onValueChange={(val) => handleChangeStatus(vehicle.id, val as any)}
                            >
                              <SelectTrigger className="w-24 md:w-32 h-8 text-xs md:text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Активен</SelectItem>
                                <SelectItem value="inactive">Неактивен</SelectItem>
                                <SelectItem value="maintenance">Ремонт</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteVehicle(vehicle.id)}
                            >
                              <Icon name="Trash2" size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}