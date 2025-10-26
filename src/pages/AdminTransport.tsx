import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  documentsStatus: 'valid' | 'expiring' | 'expired';
  inspectionDate: string;
  insuranceExpiry: string;
  totalTrips: number;
}

const vehiclesData: Vehicle[] = [
  {
    id: '1',
    driverId: 'D001',
    driverName: 'Иванов Иван',
    brand: 'Mercedes-Benz',
    model: 'Sprinter',
    plateNumber: 'А123ВС77',
    type: 'Фургон',
    status: 'active',
    documentsStatus: 'valid',
    inspectionDate: '2025-06-15',
    insuranceExpiry: '2025-12-31',
    totalTrips: 342
  },
  {
    id: '2',
    driverId: 'D002',
    driverName: 'Петров Петр',
    brand: 'Ford',
    model: 'Transit',
    plateNumber: 'В456СЕ77',
    type: 'Фургон',
    status: 'active',
    documentsStatus: 'expiring',
    inspectionDate: '2025-02-20',
    insuranceExpiry: '2025-03-15',
    totalTrips: 285
  },
  {
    id: '3',
    driverId: 'D003',
    driverName: 'Сидоров Сидор',
    brand: 'Газель',
    model: 'Next',
    plateNumber: 'С789КА77',
    type: 'Бортовой',
    status: 'maintenance',
    documentsStatus: 'valid',
    inspectionDate: '2025-08-10',
    insuranceExpiry: '2025-11-20',
    totalTrips: 198
  },
];

export default function AdminTransport() {
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>(vehiclesData);
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

  const getDocsBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive', icon: string, text: string }> = {
      valid: { variant: 'default', icon: 'FileCheck', text: 'Документы ОК' },
      expiring: { variant: 'secondary', icon: 'AlertTriangle', text: 'Истекают' },
      expired: { variant: 'destructive', icon: 'AlertCircle', text: 'Истекли' }
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

  const filteredVehicles = vehicles.filter(v => {
    const matchesFilter = filter === 'all' || v.status === filter || v.documentsStatus === filter;
    const matchesSearch = v.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         v.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: vehicles.length,
    active: vehicles.filter(v => v.status === 'active').length,
    maintenance: vehicles.filter(v => v.status === 'maintenance').length,
    docsExpiring: vehicles.filter(v => v.documentsStatus === 'expiring' || v.documentsStatus === 'expired').length
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
            <p className="text-muted-foreground">База автомобилей, документы и техосмотр</p>
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
              <CardDescription>Проблемы с документами</CardDescription>
              <CardTitle className="text-3xl text-red-600">{stats.docsExpiring}</CardTitle>
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
                  <SelectItem value="expiring">Документы истекают</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Водитель</TableHead>
                    <TableHead>Автомобиль</TableHead>
                    <TableHead>Гос. номер</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Документы</TableHead>
                    <TableHead>Техосмотр</TableHead>
                    <TableHead>ОСАГО</TableHead>
                    <TableHead>Рейсы</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium">{vehicle.driverName}</TableCell>
                      <TableCell>{vehicle.brand} {vehicle.model}</TableCell>
                      <TableCell className="font-mono">{vehicle.plateNumber}</TableCell>
                      <TableCell>{vehicle.type}</TableCell>
                      <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                      <TableCell>{getDocsBadge(vehicle.documentsStatus)}</TableCell>
                      <TableCell className="text-sm">{vehicle.inspectionDate}</TableCell>
                      <TableCell className="text-sm">{vehicle.insuranceExpiry}</TableCell>
                      <TableCell>{vehicle.totalTrips}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="sm" title="Подробнее">
                            <Icon name="Info" size={16} />
                          </Button>
                          <Select
                            value={vehicle.status}
                            onValueChange={(val) => handleChangeStatus(vehicle.id, val as any)}
                          >
                            <SelectTrigger className="w-32 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Активен</SelectItem>
                              <SelectItem value="inactive">Неактивен</SelectItem>
                              <SelectItem value="maintenance">Ремонт</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="AlertTriangle" size={20} className="text-orange-500" />
                Требуют внимания
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Ford Transit (В456СЕ77)</p>
                    <p className="text-sm text-muted-foreground">ОСАГО истекает через 18 дней</p>
                  </div>
                  <Badge variant="secondary">Срочно</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Газель Next (С789КА77)</p>
                    <p className="text-sm text-muted-foreground">На ремонте 3 дня</p>
                  </div>
                  <Badge variant="destructive">Ремонт</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="History" size={20} />
                История техобслуживания
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Mercedes Sprinter (А123ВС77)</p>
                    <p className="text-sm text-muted-foreground">Замена масла - 15.01.2025</p>
                  </div>
                  <Icon name="CheckCircle" size={20} className="text-green-500" />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Ford Transit (В456СЕ77)</p>
                    <p className="text-sm text-muted-foreground">Замена тормозных колодок - 10.01.2025</p>
                  </div>
                  <Icon name="CheckCircle" size={20} className="text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
