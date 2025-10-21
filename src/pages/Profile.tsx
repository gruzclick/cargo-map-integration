import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DataExport from '@/components/DataExport';
import RatingSystem from '@/components/RatingSystem';
import PriceCalculator from '@/components/PriceCalculator';
import EmailAuth from '@/components/EmailAuth';
import NotificationSettings from '@/components/NotificationSettings';
import Icon from '@/components/ui/icon';
import { detectUserCountry, type CountryInfo } from '@/utils/countryDetection';

export default function Profile() {
  const [userType] = useState<'client' | 'driver'>('driver');
  const mockUserId = 'user-123';
  const mockUserName = 'Сергей Иванов';
  const [countryInfo, setCountryInfo] = useState<CountryInfo | null>(null);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [authMethod, setAuthMethod] = useState<'telegram' | 'email'>('telegram');

  useEffect(() => {
    const loadCountryInfo = async () => {
      const info = await detectUserCountry();
      setCountryInfo(info);
      if (info.isTelegramBlocked) {
        setAuthMethod('email');
      }
    };
    loadCountryInfo();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Мой профиль</h1>
          <p className="text-gray-600">Управление данными и настройками аккаунта</p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="overview">
              <Icon name="User" size={16} className="mr-2" />
              Обзор
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Icon name="Settings" size={16} className="mr-2" />
              Настройки
            </TabsTrigger>
            <TabsTrigger value="security">
              <Icon name="Shield" size={16} className="mr-2" />
              Безопасность
            </TabsTrigger>
            <TabsTrigger value="ratings">
              <Icon name="Star" size={16} className="mr-2" />
              Рейтинг
            </TabsTrigger>
            <TabsTrigger value="export">
              <Icon name="Download" size={16} className="mr-2" />
              Экспорт
            </TabsTrigger>
            <TabsTrigger value="calculator">
              <Icon name="Calculator" size={16} className="mr-2" />
              Калькулятор
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Package" size={20} />
                    Доставки
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-blue-600">127</div>
                  <div className="text-sm text-gray-600 mt-1">Всего выполнено</div>
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
                  <div className="text-4xl font-bold text-yellow-500">4.8</div>
                  <div className="text-sm text-gray-600 mt-1">Средняя оценка</div>
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
                  <div className="text-4xl font-bold text-green-600">1.2M ₽</div>
                  <div className="text-sm text-gray-600 mt-1">За всё время</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Личная информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                    СИ
                  </div>
                  <div>
                    <div className="font-semibold text-lg">{mockUserName}</div>
                    <div className="text-sm text-gray-600">
                      {userType === 'driver' ? 'Водитель-перевозчик' : 'Клиент'}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div>
                    <div className="text-sm text-gray-600">Телефон</div>
                    <div className="font-medium">+7 (999) 222-22-22</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Email</div>
                    <div className="font-medium">carrier@test.ru</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Транспорт</div>
                    <div className="font-medium">Грузовик средний (5 тонн)</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Статус</div>
                    <div className="font-medium text-green-600">✓ Активен</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <NotificationSettings />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Type" size={20} />
                  Размер текста
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
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
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-md p-4 flex items-start gap-3">
                  <Icon name="Info" size={20} className="text-blue-500 mt-0.5" />
                  <p className="text-sm">
                    Изменения применятся сразу ко всему приложению
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Mail" size={20} />
                  Подтверждение Email
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-md p-4 flex items-start gap-3">
                  <Icon name="AlertTriangle" size={20} className="text-yellow-500 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-yellow-600 dark:text-yellow-500">Email не подтверждён</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Подтвердите email для восстановления доступа к аккаунту в случае утери телефона
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Ваш email</label>
                    <div className="mt-1.5 flex gap-2">
                      <Input 
                        type="email" 
                        placeholder="example@email.com"
                        defaultValue="carrier@test.ru"
                      />
                    </div>
                  </div>

                  <Button className="w-full">
                    <Icon name="Send" size={18} className="mr-2" />
                    Отправить код подтверждения
                  </Button>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-md p-4">
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                      Зачем подтверждать email?
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1.5">
                      <li className="flex items-start gap-2">
                        <Icon name="Shield" size={14} className="text-blue-500 mt-0.5 shrink-0" />
                        <span><strong>Восстановление доступа</strong> — если потеряете телефон или SIM-карту, сможете восстановить аккаунт через email</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Icon name="Bell" size={14} className="text-blue-500 mt-0.5 shrink-0" />
                        <span><strong>Важные уведомления</strong> — получайте информацию о новых заказах, изменениях в системе и обновлениях безопасности</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Icon name="Lock" size={14} className="text-blue-500 mt-0.5 shrink-0" />
                        <span><strong>Дополнительная защита</strong> — подтверждённый email повышает доверие клиентов и защищает от мошенников</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Icon name="UserCheck" size={14} className="text-blue-500 mt-0.5 shrink-0" />
                        <span><strong>Верификация аккаунта</strong> — подтверждённые пользователи получают больше заказов (+25% в среднем)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="QrCode" size={20} />
                  QR-код для доступа
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Создайте QR-код для быстрого доступа к платформе с телефона
                </p>
                <Button onClick={() => window.location.href = '/qr'} className="w-full">
                  <Icon name="QrCode" size={18} className="mr-2" />
                  Открыть генератор QR-кода
                </Button>
                <div className="bg-muted/50 rounded-lg p-4 text-sm">
                  <p className="font-semibold mb-2">Зачем нужен QR-код:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Быстрый доступ с телефона без ввода URL</li>
                    <li>Можно распечатать на визитках</li>
                    <li>Удобно показывать клиентам</li>
                    <li>Скачать и использовать в рекламе</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Shield" size={20} />
                  Двухфакторная аутентификация (2FA)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {countryInfo && countryInfo.isTelegramBlocked && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-md p-4 flex items-start gap-3">
                    <Icon name="AlertCircle" size={20} className="text-yellow-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-500">Telegram недоступен в {countryInfo.countryName}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Для вашей страны автоматически включена email-аутентификация
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <h4 className="font-medium">Выберите метод аутентификации:</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      onClick={() => setAuthMethod('telegram')}
                      disabled={countryInfo?.isTelegramBlocked}
                      className={`p-4 border rounded-lg text-left transition-all ${
                        authMethod === 'telegram' && !countryInfo?.isTelegramBlocked
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      } ${countryInfo?.isTelegramBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Icon name="MessageCircle" size={24} className="text-blue-500" />
                        <span className="font-semibold">Telegram</span>
                        {countryInfo?.isTelegramBlocked && (
                          <span className="text-xs bg-red-500/20 text-red-500 px-2 py-1 rounded">Недоступен</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Коды приходят в Telegram бот
                      </p>
                    </button>

                    <button
                      onClick={() => setAuthMethod('email')}
                      className={`p-4 border rounded-lg text-left transition-all ${
                        authMethod === 'email'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Icon name="Mail" size={24} className="text-green-500" />
                        <span className="font-semibold">Email</span>
                        {countryInfo?.isTelegramBlocked && (
                          <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded">Рекомендуется</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Коды приходят на email
                      </p>
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button
                    onClick={() => setShow2FAModal(true)}
                    className="w-full"
                  >
                    <Icon name="Key" size={18} className="mr-2" />
                    Настроить {authMethod === 'telegram' ? 'Telegram' : 'Email'} 2FA
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-2">Текущие настройки:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Метод: {authMethod === 'telegram' ? 'Telegram Bot' : 'Email коды'}</li>
                    <li>• Страна: {countryInfo?.countryName || 'Определяется...'}</li>
                    <li>• Статус: <span className="text-green-600">Активно</span></li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ratings">
            <RatingSystem
              carrierId={mockUserId}
              carrierName={mockUserName}
              canReview={false}
            />
          </TabsContent>

          <TabsContent value="export">
            <div className="max-w-2xl mx-auto">
              <DataExport
                userId={mockUserId}
                userName={mockUserName}
              />
            </div>
          </TabsContent>

          <TabsContent value="calculator">
            <PriceCalculator />
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            <Icon name="ArrowLeft" size={16} className="mr-2" />
            Вернуться на главную
          </Button>
        </div>
      </div>

      {show2FAModal && authMethod === 'email' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full">
            <EmailAuth
              onSuccess={(email) => {
                setShow2FAModal(false);
                alert(`Email 2FA настроен для ${email}`);
              }}
              onCancel={() => setShow2FAModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}