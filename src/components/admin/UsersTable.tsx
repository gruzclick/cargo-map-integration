import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface User {
  id: string;
  phone_number: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

interface UsersTableProps {
  users: User[];
  loading: boolean;
  onUpdateStatus: (userId: string, status: string) => void;
}

export const UsersTable = ({ users, loading, onUpdateStatus }: UsersTableProps) => {
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filteredUsers = users.filter(user => {
    const matchesSearch = userSearch === '' || 
      user.full_name.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.phone_number.toLowerCase().includes(userSearch.toLowerCase());
    
    const matchesRole = userRoleFilter === 'all' || user.role === userRoleFilter;
    const matchesStatus = userStatusFilter === 'all' || user.status === userStatusFilter;
    
    const userDate = new Date(user.created_at);
    const matchesDateFrom = !dateFrom || userDate >= new Date(dateFrom);
    const matchesDateTo = !dateTo || userDate <= new Date(dateTo + 'T23:59:59');
    
    return matchesSearch && matchesRole && matchesStatus && matchesDateFrom && matchesDateTo;
  });

  const exportToCSV = () => {
    const headers = ['ID', 'Телефон', 'ФИО', 'Email', 'Роль', 'Статус', 'Дата создания'];
    const rows = filteredUsers.map(user => [
      user.id,
      user.phone_number,
      user.full_name || '-',
      user.email || '-',
      user.role,
      user.status,
      new Date(user.created_at).toLocaleString('ru-RU')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-gray-900 dark:text-white">Управление пользователями</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">Просмотр и управление пользователями системы</CardDescription>
          </div>
          <Button onClick={exportToCSV} variant="outline" disabled={filteredUsers.length === 0}>
            <Icon name="Download" size={16} className="mr-2" />
            Экспорт CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4 flex-wrap">
          <Input
            placeholder="Поиск по имени, email, телефону..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="max-w-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          <select
            value={userRoleFilter}
            onChange={(e) => setUserRoleFilter(e.target.value)}
            className="px-3 py-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
          >
            <option value="all">Все роли</option>
            <option value="client">Клиент</option>
            <option value="carrier">Перевозчик</option>
          </select>
          <select
            value={userStatusFilter}
            onChange={(e) => setUserStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
          >
            <option value="all">Все статусы</option>
            <option value="active">Активные</option>
            <option value="inactive">Неактивные</option>
          </select>
          <Input
            type="date"
            placeholder="Дата с..."
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-40 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          <Input
            type="date"
            placeholder="Дата по..."
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-40 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
        {loading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Загрузка...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Icon name="Users" size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p>Нет пользователей</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left p-3 text-gray-600 dark:text-gray-400">ID</th>
                  <th className="text-left p-3 text-gray-600 dark:text-gray-400">Телефон</th>
                  <th className="text-left p-3 text-gray-600 dark:text-gray-400">ФИО</th>
                  <th className="text-left p-3 text-gray-600 dark:text-gray-400">Email</th>
                  <th className="text-left p-3 text-gray-600 dark:text-gray-400">Роль</th>
                  <th className="text-left p-3 text-gray-600 dark:text-gray-400">Статус</th>
                  <th className="text-left p-3 text-gray-600 dark:text-gray-400">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="p-3 text-gray-900 dark:text-gray-100 font-mono text-xs">{user.id.slice(0, 8)}...</td>
                    <td className="p-3 text-gray-900 dark:text-gray-100">{user.phone_number}</td>
                    <td className="p-3 text-gray-900 dark:text-gray-100">{user.full_name || '-'}</td>
                    <td className="p-3 text-gray-900 dark:text-gray-100">{user.email || '-'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.role === 'driver' ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' :
                        user.role === 'admin' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                        'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.status === 'active' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                        'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onUpdateStatus(user.id, user.status === 'active' ? 'blocked' : 'active')}
                        className="text-xs"
                      >
                        {user.status === 'active' ? 'Заблокировать' : 'Разблокировать'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};