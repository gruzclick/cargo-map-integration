import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface RoleAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: User | null;
  selectedRole: string;
  onRoleChange: (role: string) => void;
  availableRoles: Role[];
  onAssignRole: () => void;
}

export function RoleAssignmentDialog({
  open,
  onOpenChange,
  selectedUser,
  selectedRole,
  onRoleChange,
  availableRoles,
  onAssignRole,
}: RoleAssignmentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Назначить роль пользователю</DialogTitle>
          <DialogDescription>
            {selectedUser && (
              <span>Назначение роли для: <strong>{selectedUser.full_name}</strong> ({selectedUser.email})</span>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Выберите роль</label>
            <Select value={selectedRole} onValueChange={onRoleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите роль..." />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map(role => (
                  <SelectItem key={role.id} value={role.id}>
                    <div className="flex items-center gap-2">
                      <Icon name="Shield" size={14} />
                      <div>
                        <div className="font-medium">{role.name}</div>
                        <div className="text-xs text-muted-foreground">{role.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedUser && selectedUser.roles && selectedUser.roles.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Текущие роли</label>
              <div className="flex flex-wrap gap-2">
                {selectedUser.roles.map(role => (
                  <Badge key={role} variant="secondary">
                    {availableRoles.find(r => r.id === role)?.name || role}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={onAssignRole}>
            <Icon name="Plus" size={16} className="mr-2" />
            Назначить роль
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
