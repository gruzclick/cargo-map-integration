import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface UserManagementToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  selectedCount: number;
  totalCount: number;
  onBulkAction: (action: 'block' | 'unblock' | 'delete') => void;
}

export function UserManagementToolbar({
  searchQuery,
  onSearchChange,
  onRefresh,
  selectedCount,
  totalCount,
  onBulkAction,
}: UserManagementToolbarProps) {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
          >
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <h1 className="text-3xl font-bold">Управление пользователями</h1>
        </div>
        <Button
          variant="ghost"
          onClick={() => window.location.href = '/profile'}
        >
          <Icon name="User" size={20} className="mr-2" />
          Профиль
        </Button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Badge variant="secondary">
          <Icon name="Users" size={16} className="mr-1" />
          Всего: {totalCount}
        </Badge>
      </div>

      <div className="flex flex-col md:flex-row gap-2">
        <div className="flex-1">
          <Input
            placeholder="Поиск по email, телефону или имени..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full"
          />
        </div>
        <Button onClick={onRefresh} variant="outline">
          <Icon name="RefreshCw" size={16} className="mr-2" />
          Обновить
        </Button>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => onBulkAction('block')}
            disabled={selectedCount === 0}
            className="flex-1 md:flex-none"
          >
            <Icon name="Ban" size={16} className="mr-2" />
            <span className="hidden sm:inline">Заблокировать</span>
            <span className="sm:hidden">Блок</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => onBulkAction('unblock')}
            disabled={selectedCount === 0}
            className="flex-1 md:flex-none"
          >
            <Icon name="Unlock" size={16} className="mr-2" />
            <span className="hidden sm:inline">Разблокировать</span>
            <span className="sm:hidden">Разблок</span>
          </Button>
          <Button
            variant="destructive"
            onClick={() => onBulkAction('delete')}
            disabled={selectedCount === 0}
            className="flex-1 md:flex-none"
          >
            <Icon name="Trash2" size={16} className="mr-2" />
            Удалить
          </Button>
        </div>
      </div>

      {selectedCount > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mt-4">
          <p className="text-sm text-blue-400">
            Выбрано пользователей: {selectedCount}
          </p>
        </div>
      )}
    </>
  );
}
