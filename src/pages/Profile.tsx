import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DataExport from '@/components/DataExport';
import RatingSystem from '@/components/RatingSystem';
import PriceCalculator from '@/components/PriceCalculator';
import Icon from '@/components/ui/icon';

export default function Profile() {
  const [userType] = useState<'client' | 'driver'>('driver');
  const mockUserId = 'user-123';
  const mockUserName = 'Сергей Иванов';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Мой профиль</h1>
          <p className="text-gray-600">Управление данными и настройками аккаунта</p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview">
              <Icon name="User" size={16} className="mr-2" />
              Обзор
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
    </div>
  );
}
