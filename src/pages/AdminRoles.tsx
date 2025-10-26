import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
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

interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'moderator' | 'support';
  active: boolean;
  createdAt: string;
}

const permissions = {
  superadmin: [
    'Полный доступ ко всем разделам',
    'Управление администраторами',
    'Настройки системы',
    'Резервное копирование',
    'Удаление данных'
  ],
  moderator: [
    'Управление пользователями',
    'Управление заказами',
    'Управление транспортом',
    'Просмотр аналитики',
    'Управление контентом'
  ],
  support: [
    'Просмотр обращений',
    'Ответы в поддержке',
    'Просмотр пользователей',
    'Просмотр заказов'
  ]
};

export default function AdminRoles() {
  const { toast } = useToast();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: '',
    role: 'support' as 'superadmin' | 'moderator' | 'support'
  });

  const handleCreateAdmin = () => {
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive'
      });
      return;
    }

    const admin: Admin = {
      id: Date.now().toString(),
      name: newAdmin.name,
      email: newAdmin.email,
      role: newAdmin.role,
      active: true,
      createdAt: new Date().toLocaleDateString('ru-RU')
    };

    setAdmins([...admins, admin]);
    setNewAdmin({ name: '', email: '', password: '', role: 'support' });
    toast({
      title: 'Администратор создан',
      description: `${admin.name} добавлен с ролью ${getRoleLabel(admin.role)}`
    });
  };

  const handleToggleActive = (id: string) => {
    setAdmins(admins.map(a => a.id === id ? { ...a, active: !a.active } : a));
    toast({
      title: 'Статус изменен',
      description: 'Доступ администратора обновлен'
    });
  };

  const handleDeleteAdmin = (id: string) => {
    if (!window.confirm('Удалить администратора? Это действие необратимо.')) return;
    setAdmins(admins.filter(a => a.id !== id));
    toast({
      title: 'Администратор удален',
      variant: 'destructive'
    });
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      superadmin: 'Суперадмин',
      moderator: 'Модератор',
      support: 'Техподдержка'
    };
    return labels[role];
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      superadmin: 'destructive',
      moderator: 'default',
      support: 'secondary'
    };
    return <Badge variant={variants[role]}>{getRoleLabel(role)}</Badge>;
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
              <Icon name="Shield" size={32} />
              Роли администраторов
            </h1>
            <p className="text-muted-foreground">Управление доступом и полномочиями</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="ShieldAlert" size={20} className="text-red-500" />
                Суперадмин
              </CardTitle>
              <CardDescription>Полный доступ ко всем функциям</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {permissions.superadmin.map((perm, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Icon name="CheckCircle" size={16} className="text-green-500 mt-0.5" />
                    {perm}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="ShieldCheck" size={20} className="text-blue-500" />
                Модератор
              </CardTitle>
              <CardDescription>Управление контентом и пользователями</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {permissions.moderator.map((perm, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Icon name="CheckCircle" size={16} className="text-blue-500 mt-0.5" />
                    {perm}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Headphones" size={20} className="text-orange-500" />
                Техподдержка
              </CardTitle>
              <CardDescription>Работа с обращениями клиентов</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {permissions.support.map((perm, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Icon name="CheckCircle" size={16} className="text-orange-500 mt-0.5" />
                    {perm}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Добавить администратора</CardTitle>
            <CardDescription>Создание нового пользователя с правами доступа</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="admin-name">ФИО</Label>
                <Input
                  id="admin-name"
                  placeholder="Иванов Иван Иванович"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@example.com"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-password">Пароль</Label>
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="Минимум 8 символов"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-role">Роль</Label>
                <Select value={newAdmin.role} onValueChange={(val: any) => setNewAdmin({ ...newAdmin, role: val })}>
                  <SelectTrigger id="admin-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="superadmin">Суперадмин</SelectItem>
                    <SelectItem value="moderator">Модератор</SelectItem>
                    <SelectItem value="support">Техподдержка</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleCreateAdmin} className="w-full">
              <Icon name="UserPlus" size={16} className="mr-2" />
              Создать администратора
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Список администраторов ({admins.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {admins.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="Users" size={48} className="mx-auto mb-4 opacity-20" />
                <p>Администраторы не добавлены</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ФИО</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Роль</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Добавлен</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">{admin.name}</TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>{getRoleBadge(admin.role)}</TableCell>
                      <TableCell>
                        <Badge variant={admin.active ? 'default' : 'secondary'}>
                          {admin.active ? 'Активен' : 'Отключен'}
                        </Badge>
                      </TableCell>
                      <TableCell>{admin.createdAt}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(admin.id)}
                          >
                            <Icon name={admin.active ? "UserX" : "UserCheck"} size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAdmin(admin.id)}
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
