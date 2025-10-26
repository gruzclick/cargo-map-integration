import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { secureLocalStorage } from '@/utils/security';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const DataManagement = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const deleteData = async (table: string, displayName: string) => {
    setLoading(true);
    try {
      const token = secureLocalStorage.get('admin_token');
      
      const response = await fetch('https://functions.poehali.dev/f06efb37-9437-4df8-8032-f2ba53b2e2d6', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Auth-Token': token || ''
        },
        body: JSON.stringify({
          action: 'delete_table_data',
          table
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: '✅ Данные удалены',
          description: `${displayName}: удалено ${data.deleted_count} записей`,
        });
      } else {
        throw new Error(data.error || 'Ошибка удаления');
      }
    } catch (error) {
      console.error('Ошибка удаления данных:', error);
      toast({
        title: '❌ Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось удалить данные',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setDeleteTarget(null);
    }
  };

  const clearAllTestData = async () => {
    setLoading(true);
    try {
      const token = secureLocalStorage.get('admin_token');
      
      const response = await fetch('https://functions.poehali.dev/f06efb37-9437-4df8-8032-f2ba53b2e2d6', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Auth-Token': token || ''
        },
        body: JSON.stringify({
          action: 'clear_all_test_data'
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: '✅ Все тестовые данные удалены',
          description: `Удалено записей: ${JSON.stringify(data.deleted)}`,
        });
      } else {
        throw new Error(data.error || 'Ошибка удаления');
      }
    } catch (error) {
      console.error('Ошибка очистки данных:', error);
      toast({
        title: '❌ Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось очистить данные',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setDeleteTarget(null);
    }
  };

  const dataCategories = [
    {
      id: 'users',
      table: 'users',
      title: 'Пользователи',
      description: 'Удалить всех пользователей (клиенты и перевозчики)',
      icon: 'Users',
      color: 'text-blue-600'
    },
    {
      id: 'drivers',
      table: 'drivers',
      title: 'Водители',
      description: 'Удалить всех водителей из системы',
      icon: 'Truck',
      color: 'text-green-600'
    },
    {
      id: 'cargo',
      table: 'cargo',
      title: 'Грузы',
      description: 'Удалить все грузы и заявки',
      icon: 'Package',
      color: 'text-orange-600'
    },
    {
      id: 'deliveries',
      table: 'deliveries',
      title: 'Доставки',
      description: 'Удалить все записи о доставках',
      icon: 'ShoppingCart',
      color: 'text-purple-600'
    },
    {
      id: 'login_logs',
      table: 'login_logs',
      title: 'Логи входа',
      description: 'Очистить историю входов в систему',
      icon: 'FileText',
      color: 'text-gray-600'
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
            <Icon name="Database" size={24} />
            Управление данными
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Удаление тестовых данных из базы данных
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dataCategories.map((category) => (
          <Card key={category.id} className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <Icon name={category.icon as any} size={24} className={category.color} />
                {category.title}
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                {category.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setDeleteTarget(category.id)}
                disabled={loading}
                variant="destructive"
                className="w-full"
              >
                <Icon name="Trash2" size={16} className="mr-2" />
                Удалить
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="text-red-900 dark:text-red-100 flex items-center gap-2">
            <Icon name="AlertTriangle" size={24} />
            Опасная зона
          </CardTitle>
          <CardDescription className="text-red-700 dark:text-red-300">
            Удалить ВСЕ тестовые данные из всех таблиц (необратимо!)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => setDeleteTarget('all')}
            disabled={loading}
            variant="destructive"
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            <Icon name="Trash2" size={16} className="mr-2" />
            Очистить ВСЕ данные
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={deleteTarget !== null} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <Icon name="AlertTriangle" size={24} className="text-red-600" />
              Подтверждение удаления
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              {deleteTarget === 'all' 
                ? 'Вы уверены, что хотите удалить ВСЕ тестовые данные? Это действие необратимо и удалит все записи из всех таблиц.'
                : `Вы уверены, что хотите удалить все данные из категории "${dataCategories.find(c => c.id === deleteTarget)?.title}"? Это действие необратимо.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700">
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget === 'all') {
                  clearAllTestData();
                } else {
                  const category = dataCategories.find(c => c.id === deleteTarget);
                  if (category) {
                    deleteData(category.table, category.title);
                  }
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Да, удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
