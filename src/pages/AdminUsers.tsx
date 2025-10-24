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
  user_type: 'client' | 'carrier';
  company_name?: string;
  blocked: boolean;
  created_at: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('user_data') || '{}');
    const realUsers: User[] = currentUser.id ? [
      { 
        id: currentUser.id, 
        phone: currentUser.phone || 'Не указан', 
        user_type: currentUser.user_type || 'client', 
        company_name: currentUser.full_name || currentUser.organization_name || 'Текущий пользователь', 
        blocked: false, 
        created_at: new Date().toISOString().split('T')[0]
      }
    ] : [];
    setUsers(realUsers);
    setFilteredUsers(realUsers);
  }, []);

  useEffect(() => {
    const filtered = users.filter(user => 
      user.phone.includes(searchQuery) || 
      (user.company_name?.toLowerCase().includes(searchQuery.toLowerCase()))
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
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Поиск по телефону или компании..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => handleBulkAction('block')}
                disabled={selectedUsers.size === 0}
              >
                <Icon name="Ban" size={16} className="mr-2" />
                Заблокировать
              </Button>
              <Button
                variant="outline"
                onClick={() => handleBulkAction('unblock')}
                disabled={selectedUsers.size === 0}
              >
                <Icon name="Unlock" size={16} className="mr-2" />
                Разблокировать
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleBulkAction('delete')}
                disabled={selectedUsers.size === 0}
              >
                <Icon name="Trash2" size={16} className="mr-2" />
                Удалить
              </Button>
            </div>

            {selectedUsers.size > 0 && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-sm text-blue-400">
                  Выбрано пользователей: {selectedUsers.size}
                </p>
              </div>
            )}

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                        onCheckedChange={selectAll}
                      />
                    </TableHead>
                    <TableHead>Телефон</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Компания</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дата регистрации</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedUsers.has(user.id)}
                          onCheckedChange={() => toggleUserSelection(user.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{user.phone}</TableCell>
                      <TableCell>
                        <Badge variant={user.user_type === 'client' ? 'default' : 'secondary'}>
                          <Icon 
                            name={user.user_type === 'client' ? 'Package' : 'Truck'} 
                            size={12} 
                            className="mr-1" 
                          />
                          {user.user_type === 'client' ? 'Клиент' : 'Перевозчик'}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.company_name || '—'}</TableCell>
                      <TableCell>
                        {user.blocked ? (
                          <Badge variant="destructive">
                            <Icon name="Ban" size={12} className="mr-1" />
                            Заблокирован
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <Icon name="CheckCircle" size={12} className="mr-1" />
                            Активен
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString('ru-RU')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          {user.blocked ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => unblockUsers([user.id])}
                            >
                              <Icon name="Unlock" size={14} className="mr-1" />
                              Разблокировать
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => blockUsers([user.id])}
                            >
                              <Icon name="Ban" size={14} className="mr-1" />
                              Заблокировать
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteUsers([user.id])}
                          >
                            <Icon name="Trash2" size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
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