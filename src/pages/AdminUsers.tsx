import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { UserManagementToolbar } from '@/components/admin/users/UserManagementToolbar';
import { UsersDataTable } from '@/components/admin/users/UsersDataTable';
import { RoleAssignmentDialog } from '@/components/admin/users/RoleAssignmentDialog';

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
  roles?: string[];
}

interface Role {
  id: string;
  name: string;
  description: string;
  level: number;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [availableRoles] = useState<Role[]>([
    { id: 'super_admin', name: 'Суперадмин', description: 'Полный доступ', level: 100 },
    { id: 'admin', name: 'Администратор', description: 'Управление платформой', level: 80 },
    { id: 'moderator', name: 'Модератор', description: 'Модерация контента', level: 60 },
    { id: 'support', name: 'Поддержка', description: 'Техподдержка', level: 40 },
    { id: 'analyst', name: 'Аналитик', description: 'Просмотр аналитики', level: 20 },
  ]);
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
      (user.email?.toLowerCase().includes(searchQuery.toLowerCase()))
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
      userIds.includes(user.id) ? { ...user, status: 'blocked' } : user
    );
    setUsers(updatedUsers);
    setFilteredUsers(updatedUsers.filter(user => 
      user.phone.includes(searchQuery) || 
      (user.email?.toLowerCase().includes(searchQuery.toLowerCase()))
    ));
    setSelectedUsers(new Set());
    toast({
      title: 'Пользователи заблокированы',
      description: `Заблокировано пользователей: ${userIds.length}`,
    });
  };

  const unblockUsers = (userIds: string[]) => {
    const updatedUsers = users.map(user => 
      userIds.includes(user.id) ? { ...user, status: 'active' } : user
    );
    setUsers(updatedUsers);
    setFilteredUsers(updatedUsers.filter(user => 
      user.phone.includes(searchQuery) || 
      (user.email?.toLowerCase().includes(searchQuery.toLowerCase()))
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

  const openRoleDialog = (user: User) => {
    setSelectedUser(user);
    setSelectedRole('');
    setRoleDialogOpen(true);
  };

  const assignRole = async () => {
    if (!selectedUser || !selectedRole) {
      toast({
        title: 'Ошибка',
        description: 'Выберите роль',
        variant: 'destructive'
      });
      return;
    }

    try {
      const adminToken = localStorage.getItem('admin_token');
      
      const response = await fetch('https://functions.poehali.dev/f06efb37-9437-4df8-8032-f2ba53b2e2d6', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': adminToken || ''
        },
        body: JSON.stringify({
          action: 'assign_role',
          user_id: selectedUser.id,
          role_id: selectedRole
        })
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Ошибка сервера');
      }

      const updatedUsers = users.map(u => 
        u.id === selectedUser.id 
          ? { ...u, roles: [...(u.roles || []), selectedRole] }
          : u
      );
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      setSelectedUser(updatedUsers.find(u => u.id === selectedUser.id) || null);

      toast({
        title: 'Роль назначена',
        description: `Пользователь ${selectedUser.full_name} теперь ${availableRoles.find(r => r.id === selectedRole)?.name}`
      });

      setSelectedRole('');
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось назначить роль',
        variant: 'destructive'
      });
    }
  };

  const removeRole = async (roleId: string) => {
    if (!selectedUser) return;

    try {
      const adminToken = localStorage.getItem('admin_token');
      
      const response = await fetch('https://functions.poehali.dev/f06efb37-9437-4df8-8032-f2ba53b2e2d6', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': adminToken || ''
        },
        body: JSON.stringify({
          action: 'remove_role',
          user_id: selectedUser.id,
          role_id: roleId
        })
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Ошибка сервера');
      }

      const updatedUsers = users.map(u => 
        u.id === selectedUser.id 
          ? { ...u, roles: (u.roles || []).filter(r => r !== roleId) }
          : u
      );
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      setSelectedUser(updatedUsers.find(u => u.id === selectedUser.id) || null);

      toast({
        title: 'Роль удалена',
        description: `Роль ${availableRoles.find(r => r.id === roleId)?.name} удалена`
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось удалить роль',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Users" size={24} />
              Пользователи платформы
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <UserManagementToolbar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onRefresh={loadUsers}
              selectedCount={selectedUsers.size}
              totalCount={users.length}
              onBulkAction={handleBulkAction}
            />

            <UsersDataTable
              users={filteredUsers}
              loading={loading}
              selectedUsers={selectedUsers}
              availableRoles={availableRoles}
              onToggleUserSelection={toggleUserSelection}
              onSelectAll={selectAll}
              onOpenRoleDialog={openRoleDialog}
            />

            {filteredUsers.length === 0 && !loading && (
              <div className="text-center py-12">
                <Icon name="Search" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Пользователи не найдены
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <RoleAssignmentDialog
          open={roleDialogOpen}
          onOpenChange={setRoleDialogOpen}
          selectedUser={selectedUser}
          selectedRole={selectedRole}
          onRoleChange={setSelectedRole}
          availableRoles={availableRoles}
          onAssignRole={assignRole}
          onRemoveRole={removeRole}
        />
      </div>
    </div>
  );
}