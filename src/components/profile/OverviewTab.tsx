import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface OverviewTabProps {
  mockUserName: string;
  userType: 'client' | 'driver';
}

const OverviewTab = ({ mockUserName, userType }: OverviewTabProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const hasData = mockUserName && mockUserName.trim() !== '';
  const [userStatus, setUserStatus] = useState<'cargo' | 'vehicle' | null>(null);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('user_status') as 'cargo' | 'vehicle' | null;
    setUserStatus(saved);
    
    const adminToken = localStorage.getItem('admin_token');
    if (adminToken) {
      setHasAdminAccess(true);
      setUserRoles(['admin']);
    }
  }, []);

  const handleStatusChange = (newStatus: 'cargo' | 'vehicle') => {
    setUserStatus(newStatus);
    localStorage.setItem('user_status', newStatus);
    toast({
      title: 'Статус изменен',
      description: `Теперь вы отображаетесь как "${newStatus === 'cargo' ? 'Отправитель груза' : 'Водитель с транспортом'}"`
    });
    setTimeout(() => window.location.reload(), 500);
  };

  return (
    <div className="space-y-4">
      {hasAdminAccess && (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="ShieldCheck" size={20} />
              Административный доступ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              У вас есть права администратора. Вы можете управлять платформой.
            </p>
            <Button 
              onClick={() => navigate('/admin')} 
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Icon name="Settings" size={18} className="mr-2" />
              Перейти в админ-панель
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="RefreshCw" size={20} />
            Переключение статуса
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Выберите свой текущий статус на сайте
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleStatusChange('cargo')}
              className={`p-4 rounded-xl border-2 transition-all ${
                userStatus === 'cargo'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-lg scale-105'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
              }`}
            >
              <Icon name="Package" size={32} className={`mx-auto mb-2 ${userStatus === 'cargo' ? 'text-blue-500' : 'text-gray-400'}`} />
              <div className={`font-semibold ${userStatus === 'cargo' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                Отправить груз
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Ищу транспорт
              </div>
            </button>
            
            <button
              onClick={() => handleStatusChange('vehicle')}
              className={`p-4 rounded-xl border-2 transition-all ${
                userStatus === 'vehicle'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/30 shadow-lg scale-105'
                  : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700'
              }`}
            >
              <Icon name="Car" size={32} className={`mx-auto mb-2 ${userStatus === 'vehicle' ? 'text-green-500' : 'text-gray-400'}`} />
              <div className={`font-semibold ${userStatus === 'vehicle' ? 'text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'}`}>
                Предложить транспорт
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Ищу грузы
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Package" size={20} />
              Доставки
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">0</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Всего выполнено</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Star" size={20} />
              Рейтинг
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-400 dark:text-gray-600">—</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Нет оценок</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="DollarSign" size={20} />
              Заработано
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600 dark:text-green-400">0 ₽</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">За всё время</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Личная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!hasData ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Icon name="User" size={48} className="mx-auto mb-3 opacity-50" />
              <p>Заполните профиль в настройках</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                  {mockUserName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-lg text-gray-900 dark:text-gray-100">{mockUserName}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {userType === 'driver' ? 'Водитель-перевозчик' : 'Клиент'}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Телефон</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">Не указан</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Email</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">Не указан</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Транспорт</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">Не указан</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Статус</div>
                  <div className="font-medium text-green-600 dark:text-green-400">✓ Активен</div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTab;