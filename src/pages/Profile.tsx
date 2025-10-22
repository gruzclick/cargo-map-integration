import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DataExport from '@/components/DataExport';
import RatingSystem from '@/components/RatingSystem';
import PriceCalculator from '@/components/PriceCalculator';
import EmailAuth from '@/components/EmailAuth';
import NotificationSettings from '@/components/NotificationSettings';
import OneSIntegration from '@/components/OneSIntegration';
import DigitalSignature from '@/components/DigitalSignature';
import ProfileVerification from '@/components/ProfileVerification';
import Icon from '@/components/ui/icon';
import { detectUserCountry, type CountryInfo } from '@/utils/countryDetection';
import { useToast } from '@/hooks/use-toast';

export default function Profile() {
  const [userType] = useState<'client' | 'driver'>('driver');
  const mockUserId = 'user-123';
  const mockUserName = 'Сергей Иванов';
  const [countryInfo, setCountryInfo] = useState<CountryInfo | null>(null);
  const [entityType, setEntityType] = useState('individual');
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadCountryInfo = async () => {
      const info = await detectUserCountry();
      setCountryInfo(info);
    };
    loadCountryInfo();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-blue-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-gray-100">Мой профиль</h1>
          <p className="text-gray-600 dark:text-gray-400">Управление данными и настройками аккаунта</p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-7 gap-2 mb-8">
            <TabsTrigger value="overview" className="w-full justify-start md:justify-center">
              <Icon name="User" size={16} className="mr-2" />
              Обзор
            </TabsTrigger>
            <TabsTrigger value="settings" className="w-full justify-start md:justify-center">
              <Icon name="Settings" size={16} className="mr-2" />
              Настройки
            </TabsTrigger>
            <TabsTrigger value="ratings" className="w-full justify-start md:justify-center">
              <Icon name="Star" size={16} className="mr-2" />
              Рейтинг
            </TabsTrigger>
            <TabsTrigger value="verification" className="w-full justify-start md:justify-center">
              <Icon name="ShieldCheck" size={16} className="mr-2" />
              Верификация
            </TabsTrigger>
            <TabsTrigger value="documents" className="w-full justify-start md:justify-center">
              <Icon name="FileSignature" size={16} className="mr-2" />
              Документы
            </TabsTrigger>
            <TabsTrigger value="integration" className="w-full justify-start md:justify-center">
              <Icon name="Box" size={16} className="mr-2" />
              1С
            </TabsTrigger>
            <TabsTrigger value="export" className="w-full justify-start md:justify-center">
              <Icon name="Download" size={16} className="mr-2" />
              Экспорт
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
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">127</div>
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
                  <div className="text-4xl font-bold text-yellow-500 dark:text-yellow-400">4.8</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Средняя оценка</div>
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
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400">1.2M ₽</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">За всё время</div>
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
                    <div className="font-semibold text-lg text-gray-900 dark:text-gray-100">{mockUserName}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {userType === 'driver' ? 'Водитель-перевозчик' : 'Клиент'}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Телефон</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">+7 (999) 222-22-22</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Email</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">carrier@test.ru</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Транспорт</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">Грузовик средний (5 тонн)</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Статус</div>
                    <div className="font-medium text-green-600 dark:text-green-400">✓ Активен</div>
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
                    <Select value={entityType} onValueChange={setEntityType}>
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

                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Режим высокой контрастности</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Улучшает читаемость текста и элементов интерфейса
                    </p>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          const root = document.documentElement;
                          const isHighContrast = root.classList.contains('high-contrast');
                          
                          if (isHighContrast) {
                            root.classList.remove('high-contrast');
                            localStorage.setItem('highContrast', 'false');
                          } else {
                            root.classList.add('high-contrast');
                            localStorage.setItem('highContrast', 'true');
                          }
                          
                          toast({
                            title: isHighContrast ? 'Высокая контрастность выключена' : 'Высокая контрастность включена',
                          });
                        }}
                      >
                        <Icon name="Contrast" size={18} className="mr-2" />
                        {document.documentElement.classList.contains('high-contrast') 
                          ? 'Выключить' 
                          : 'Включить'}
                      </Button>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Обучение</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Пройдите обучение работе с платформой заново
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        localStorage.removeItem('onboarding_completed');
                        toast({
                          title: 'Обучение сброшено',
                          description: 'Перезагрузите страницу, чтобы пройти обучение снова'
                        });
                        setTimeout(() => {
                          window.location.reload();
                        }, 1500);
                      }}
                    >
                      <Icon name="GraduationCap" size={18} className="mr-2" />
                      Пройти обучение заново
                    </Button>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-md p-4 flex items-start gap-3">
                  <Icon name="Info" size={20} className="text-blue-500 mt-0.5" />
                  <p className="text-sm">
                    Все изменения применяются мгновенно и сохраняются автоматически
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
                {!emailVerified ? (
                  <>
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-md p-4 flex items-start gap-3">
                      <Icon name="AlertTriangle" size={20} className="text-yellow-500 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-yellow-600 dark:text-yellow-500">Email не подтверждён</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Подтвердите email для восстановления доступа к аккаунту в случае утери телефона
                        </p>
                      </div>
                    </div>

                    <Button 
                      className="w-full"
                      onClick={() => setShowEmailVerification(true)}
                    >
                      <Icon name="Send" size={18} className="mr-2" />
                      Подтвердить email
                    </Button>
                  </>
                ) : (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-md p-4 flex items-start gap-3">
                    <Icon name="CheckCircle2" size={20} className="text-green-500 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-green-600 dark:text-green-400">Email подтверждён</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Ваш email успешно подтверждён и защищен
                      </p>
                    </div>
                  </div>
                )}

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

          <TabsContent value="verification">
            <div className="max-w-2xl mx-auto">
              <ProfileVerification
                userId={mockUserId}
                onVerificationComplete={(method) => {
                  toast({
                    title: 'Верификация завершена',
                    description: `Профиль подтвержден через ${method}`
                  });
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="documents">
            <div className="max-w-2xl mx-auto">
              <DigitalSignature userType="carrier" />
            </div>
          </TabsContent>

          <TabsContent value="integration">
            <div className="max-w-2xl mx-auto">
              <OneSIntegration />
            </div>
          </TabsContent>

          <TabsContent value="export">
            <div className="max-w-2xl mx-auto">
              <DataExport
                userId={mockUserId}
                userName={mockUserName}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            <Icon name="ArrowLeft" size={16} className="mr-2" />
            Вернуться на главную
          </Button>
        </div>
      </div>

      {showEmailVerification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full">
            <EmailAuth
              onSuccess={(email) => {
                setShowEmailVerification(false);
                setEmailVerified(true);
                toast({
                  title: 'Email подтверждён',
                  description: `Ваш email ${email} успешно подтверждён`,
                });
              }}
              onCancel={() => setShowEmailVerification(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}