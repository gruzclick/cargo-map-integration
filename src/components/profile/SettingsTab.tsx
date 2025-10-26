import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import NotificationSettings from '@/components/NotificationSettings';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { secureLocalStorage } from '@/utils/security';

interface SettingsTabProps {
  entityType: string;
  onEntityTypeChange: (value: string) => void;
}

const SettingsTab = ({ entityType, onEntityTypeChange }: SettingsTabProps) => {
  const { toast } = useToast();
  const [userType, setUserType] = useState<'client' | 'carrier' | 'logist'>(
    secureLocalStorage.getItem('user_type') || 'client'
  );
  const [passportData, setPassportData] = useState({
    passport_series: secureLocalStorage.getItem('passport_series') || '',
    passport_number: secureLocalStorage.getItem('passport_number') || '',
    passport_date: secureLocalStorage.getItem('passport_date') || '',
    passport_issued_by: secureLocalStorage.getItem('passport_issued_by') || ''
  });

  const saveUserType = () => {
    secureLocalStorage.setItem('user_type', userType);
    const typeLabel = userType === 'client' ? 'заказчик' : userType === 'carrier' ? 'перевозчик' : 'логист';
    toast({
      title: 'Тип пользователя изменён',
      description: `Вы теперь ${typeLabel}`
    });
  };

  const savePassportData = () => {
    Object.entries(passportData).forEach(([key, value]) => {
      secureLocalStorage.setItem(key, value);
    });
    toast({
      title: 'Паспортные данные сохранены',
      description: 'Информация успешно обновлена'
    });
  };

  return (
    <div className="space-y-4">
      <NotificationSettings />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Globe" size={20} />
            Язык и валюта
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Язык интерфейса</label>
              <Select defaultValue="ru" onValueChange={(val) => {
                localStorage.setItem('user_language', val);
                toast({ title: 'Язык изменён', description: 'Интерфейс обновится при следующей загрузке' });
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ru">🇷🇺 Русский</SelectItem>
                  <SelectItem value="en">🇬🇧 English</SelectItem>
                  <SelectItem value="es">🇪🇸 Español</SelectItem>
                  <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                  <SelectItem value="fr">🇫🇷 Français</SelectItem>
                  <SelectItem value="zh">🇨🇳 中文</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Валюта</label>
              <Select defaultValue="RUB" onValueChange={(val) => {
                localStorage.setItem('user_currency', val);
                toast({ title: 'Валюта изменена', description: `Цены будут показаны в ${val}` });
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RUB">₽ Российский рубль (RUB)</SelectItem>
                  <SelectItem value="USD">$ Доллар США (USD)</SelectItem>
                  <SelectItem value="EUR">€ Евро (EUR)</SelectItem>
                  <SelectItem value="GBP">£ Фунт стерлингов (GBP)</SelectItem>
                  <SelectItem value="CNY">¥ Китайский юань (CNY)</SelectItem>
                  <SelectItem value="KZT">₸ Казахстанский тенге (KZT)</SelectItem>
                  <SelectItem value="BYN">Br Белорусский рубль (BYN)</SelectItem>
                  <SelectItem value="UAH">₴ Украинская гривна (UAH)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Users" size={20} />
            Тип пользователя
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Измените роль в системе: заказчик, перевозчик или логист
          </p>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Select value={userType} onValueChange={(val: 'client' | 'carrier' | 'logist') => setUserType(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Заказчик</SelectItem>
                  <SelectItem value="carrier">Перевозчик</SelectItem>
                  <SelectItem value="logist">Логист</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={saveUserType}>
              Сохранить
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Building" size={20} />
            Тип лица
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Изменить тип регистрации вашего аккаунта
          </p>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Select value={entityType} onValueChange={onEntityTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Физическое лицо</SelectItem>
                  <SelectItem value="self_employed">Самозанятый</SelectItem>
                  <SelectItem value="individual_entrepreneur">Индивидуальный предприниматель (ИП)</SelectItem>
                  <SelectItem value="legal">Юридическое лицо</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => {
              toast({
                title: 'Тип лица обновлён',
                description: 'Изменения сохранены в вашем профиле'
              });
            }}>
              Сохранить
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="CreditCard" size={20} />
            Паспортные данные
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Введите или обновите ваши паспортные данные для верификации
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Серия паспорта</label>
              <Input
                value={passportData.passport_series}
                onChange={(e) => setPassportData({ ...passportData, passport_series: e.target.value })}
                placeholder="1234"
                maxLength={4}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Номер паспорта</label>
              <Input
                value={passportData.passport_number}
                onChange={(e) => setPassportData({ ...passportData, passport_number: e.target.value })}
                placeholder="123456"
                maxLength={6}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Дата выдачи</label>
              <Input
                type="date"
                value={passportData.passport_date}
                onChange={(e) => setPassportData({ ...passportData, passport_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Кем выдан</label>
              <Input
                value={passportData.passport_issued_by}
                onChange={(e) => setPassportData({ ...passportData, passport_issued_by: e.target.value })}
                placeholder="Отдел УФМС..."
              />
            </div>
          </div>
          <Button onClick={savePassportData} className="w-full md:w-auto">
            Сохранить паспортные данные
          </Button>
        </CardContent>
      </Card>

      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <Icon name="Trash2" size={20} />
            Опасная зона
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Удаление аккаунта необратимо. Все ваши данные, история доставок и рейтинги будут безвозвратно удалены.
          </p>
          <Button 
            variant="destructive" 
            onClick={() => {
              if (window.confirm('Вы уверены? Это действие нельзя отменить. Все ваши данные будут удалены безвозвратно.')) {
                secureLocalStorage.clear();
                localStorage.clear();
                window.location.href = '/';
              }
            }}
            className="w-full md:w-auto"
          >
            <Icon name="Trash2" size={18} className="mr-2" />
            Удалить аккаунт навсегда
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Eye" size={20} />
            Специальные возможности
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Размер текста</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Выберите комфортный размер текста для всего приложения
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: 'small', label: 'Маленький', size: '14px' },
                  { value: 'medium', label: 'Средний', size: '16px' },
                  { value: 'large', label: 'Большой', size: '18px' },
                  { value: 'xlarge', label: 'Очень большой', size: '20px' }
                ].map(({ value, label, size }) => {
                  const currentSize = localStorage.getItem('textSize') || 'medium';
                  return (
                    <button
                      key={value}
                      onClick={() => {
                        localStorage.setItem('textSize', value);
                        window.dispatchEvent(new CustomEvent('textSizeChange', { detail: value }));
                        toast({
                          title: 'Размер текста изменён',
                          description: `Установлен ${label.toLowerCase()} размер текста`
                        });
                      }}
                      className={`p-4 border rounded-lg text-left transition-all ${
                        currentSize === value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="font-semibold mb-1">{label}</div>
                      <div className="text-muted-foreground" style={{ fontSize: size }}>
                        Aa
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsTab;