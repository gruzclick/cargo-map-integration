import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from '@/components/ui/checkbox';

interface User {
  id: string;
  phone: string;
  email: string;
  full_name: string;
  user_type: string;
  entity_type: string;
  email_verified: boolean;
  phone_verified: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      let allUsers: User[] = [];

      try {
        const response = await fetch('https://functions.poehali.dev/f06efb37-9437-4df8-8032-f2ba53b2e2d6', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'get_all_users'
          })
        });

        const data = await response.json();
        
        if (data.users) {
          allUsers = data.users;
        }
      } catch (error) {
        console.log('Backend недоступен, загружаю локальных пользователей');
      }

      const savedUsers = localStorage.getItem('registered_users');
      if (savedUsers) {
        const localUsers = JSON.parse(savedUsers);
        allUsers = [...allUsers, ...localUsers];
      }

      setUsers(allUsers);
      setFilteredUsers(allUsers);
      toast({
        title: 'Пользователи загружены',
        description: `Всего пользователей: ${allUsers.length}`
      });
    } catch (error) {
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить пользователей',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = users.filter(user => 
      user.phone.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const selectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const deleteUsers = (userIds: string[]) => {
    if (!window.confirm(`Удалить ${userIds.length} пользователей навсегда? Это действие необратимо.`)) {
      return;
    }
    
    const updatedUsers = users.filter(user => !userIds.includes(user.id));
    setUsers(updatedUsers);
    setFilteredUsers(updatedUsers.filter(user => 
      user.phone.includes(searchQuery) || 
      (user.company_name?.toLowerCase().includes(searchQuery.toLowerCase()))
    ));
    setSelectedUsers(new Set());
    toast({
      title: 'Пользователи удалены',
      description: `Удалено пользователей: ${userIds.length}`,
      variant: 'destructive'
    });
  };

  const blockUsers = (userIds: string[]) => {
    const updatedUsers = users.map(user => 
      userIds.includes(user.id) ? { ...user, blocked: true } : user
    );
    setUsers(updatedUsers);
    setFilteredUsers(updatedUsers.filter(user => 
      user.phone.includes(searchQuery) || 
      (user.company_name?.toLowerCase().includes(searchQuery.toLowerCase()))
    ));
    setSelectedUsers(new Set());
    toast({
      title: 'Пользователи заблокированы',
      description: `Заблокировано пользователей: ${userIds.length}`,
    });
  };

  const unblockUsers = (userIds: string[]) => {
    const updatedUsers = users.map(user => 
      userIds.includes(user.id) ? { ...user, blocked: false } : user
    );
    setUsers(updatedUsers);
    setFilteredUsers(updatedUsers.filter(user => 
      user.phone.includes(searchQuery) || 
      (user.company_name?.toLowerCase().includes(searchQuery.toLowerCase()))
    ));
    setSelectedUsers(new Set());
    toast({
      title: 'Пользователи разблокированы',
      description: `Разблокировано пользователей: ${userIds.length}`,
    });
  };

  const handleBulkAction = (action: 'block' | 'unblock' | 'delete') => {
    if (selectedUsers.size === 0) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Выберите хотя бы одного пользователя',
      });
      return;
    }

    const selectedUserIds = Array.from(selectedUsers);
    if (action === 'block') {
      blockUsers(selectedUserIds);
    } else if (action === 'unblock') {
      unblockUsers(selectedUserIds);
    } else if (action === 'delete') {
      deleteUsers(selectedUserIds);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
          >
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <h1 className="text-3xl font-bold">Управление пользователями</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="Users" size={24} />
                Пользователи платформы
              </div>
              <Badge variant="secondary">
                Всего: {users.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Поиск по email, телефону или имени..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button onClick={loadUsers} variant="outline">
                <Icon name="RefreshCw" size={16} className="mr-2" />
                Обновить
              </Button>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  onClick={() => handleBulkAction('block')}
                  disabled={selectedUsers.size === 0}
                  className="flex-1 md:flex-none"
                >
                  <Icon name="Ban" size={16} className="mr-2" />
                  <span className="hidden sm:inline">Заблокировать</span>
                  <span className="sm:hidden">Блок</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleBulkAction('unblock')}
                  disabled={selectedUsers.size === 0}
                  className="flex-1 md:flex-none"
                >
                  <Icon name="Unlock" size={16} className="mr-2" />
                  <span className="hidden sm:inline">Разблокировать</span>
                  <span className="sm:hidden">Разблок</span>
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleBulkAction('delete')}
                  disabled={selectedUsers.size === 0}
                  className="flex-1 md:flex-none"
                >
                  <Icon name="Trash2" size={16} className="mr-2" />
                  Удалить
                </Button>
              </div>
            </div>

            {selectedUsers.size > 0 && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-sm text-blue-400">
                  Выбрано пользователей: {selectedUsers.size}
                </p>
              </div>
            )}

            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                        onCheckedChange={selectAll}
                      />
                    </TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Имя</TableHead>
                    <TableHead className="hidden sm:table-cell">Телефон</TableHead>
                    <TableHead className="hidden sm:table-cell">Тип</TableHead>
                    <TableHead className="hidden md:table-cell">Юр. лицо</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="hidden lg:table-cell">Дата регистрации</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <Icon name="Loader2" size={24} className="animate-spin mx-auto mb-2" />
                        <p className="text-muted-foreground">Загрузка пользователей...</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Пользователи не найдены
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedUsers.has(user.id)}
                          onCheckedChange={() => toggleUserSelection(user.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>{user.full_name}</TableCell>
                      <TableCell className="hidden sm:table-cell">{user.phone}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant={user.user_type === 'client' ? 'default' : user.user_type === 'carrier' ? 'secondary' : 'outline'}>
                          <Icon 
                            name={user.user_type === 'client' ? 'Package' : user.user_type === 'carrier' ? 'Truck' : 'ClipboardList'} 
                            size={12} 
                            className="mr-1" 
                          />
                          {user.user_type === 'client' ? 'Клиент' : user.user_type === 'carrier' ? 'Водитель' : 'Логист'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">
                          {user.entity_type === 'individual' ? 'Физ. лицо' : user.entity_type === 'self_employed' ? 'Самозанятый' : 'Юр. лицо'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className="w-fit">
                            <Icon name={user.status === 'active' ? 'CheckCircle' : 'XCircle'} size={12} className="mr-1" />
                            {user.status === 'active' ? 'Активен' : 'Неактивен'}
                          </Badge>
                          {user.email_verified && (
                            <Badge variant="outline" className="w-fit text-xs">
                              <Icon name="Mail" size={10} className="mr-1" />
                              Email ✓
                            </Badge>
                          )}
                          {user.phone_verified && (
                            <Badge variant="outline" className="w-fit text-xs">
                              <Icon name="Phone" size={10} className="mr-1" />
                              Телефон ✓
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {new Date(user.created_at).toLocaleDateString('ru-RU', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: 'numeric' 
                        })}
                      </TableCell>
                    </TableRow>
                  ))
                  )}
                </TableBody>
              </Table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Icon name="Search" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Пользователи не найдены
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}