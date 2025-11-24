import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
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
  roles?: string[];
}

interface Role {
  id: string;
  name: string;
  description: string;
  level: number;
}

interface UsersDataTableProps {
  users: User[];
  loading: boolean;
  selectedUsers: Set<string>;
  availableRoles: Role[];
  onToggleUserSelection: (userId: string) => void;
  onSelectAll: () => void;
  onOpenRoleDialog: (user: User) => void;
}

export function UsersDataTable({
  users,
  loading,
  selectedUsers,
  availableRoles,
  onToggleUserSelection,
  onSelectAll,
  onOpenRoleDialog,
}: UsersDataTableProps) {
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedUsers.size === users.length && users.length > 0}
                onCheckedChange={onSelectAll}
              />
            </TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Имя</TableHead>
            <TableHead className="hidden sm:table-cell">Телефон</TableHead>
            <TableHead className="hidden sm:table-cell">Тип</TableHead>
            <TableHead className="hidden md:table-cell">Юр. лицо</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead className="hidden md:table-cell">Роли</TableHead>
            <TableHead className="hidden lg:table-cell">Дата регистрации</TableHead>
            <TableHead>Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-8">
                <Icon name="Loader2" size={24} className="animate-spin mx-auto mb-2" />
                <p className="text-muted-foreground">Загрузка пользователей...</p>
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                Пользователи не найдены
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedUsers.has(user.id)}
                    onCheckedChange={() => onToggleUserSelection(user.id)}
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
                <TableCell className="hidden md:table-cell">
                  {user.roles && user.roles.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map(role => (
                        <Badge key={role} variant="secondary" className="text-xs">
                          <Icon name="Shield" size={10} className="mr-1" />
                          {availableRoles.find(r => r.id === role)?.name || role}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {new Date(user.created_at).toLocaleDateString('ru-RU', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric' 
                  })}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenRoleDialog(user)}
                  >
                    <Icon name="UserPlus" size={14} className="mr-1" />
                    <span className="hidden sm:inline">Роль</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
