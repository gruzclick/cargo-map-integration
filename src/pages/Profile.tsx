import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import DataExport from '@/components/DataExport';
import RatingSystem from '@/components/RatingSystem';
import DealsHistory from '@/components/DealsHistory';
import Icon from '@/components/ui/icon';
import { detectUserCountry, type CountryInfo } from '@/utils/countryDetection';
import { secureLocalStorage } from '@/utils/security';
import OverviewTab from '@/components/profile/OverviewTab';
import SettingsTab from '@/components/profile/SettingsTab';
import CalculatorTab from '@/components/profile/CalculatorTab';

export default function Profile() {
  const navigate = useNavigate();
  const [userType] = useState<'client' | 'driver'>('driver');
  const userId = '';
  const userName = '';
  const [countryInfo, setCountryInfo] = useState<CountryInfo | null>(null);
  const [entityType, setEntityType] = useState('individual');

  useEffect(() => {
    const token = secureLocalStorage.get('auth_token');
    if (!token) {
      navigate('/');
      return;
    }

    const loadCountryInfo = async () => {
      const info = await detectUserCountry();
      setCountryInfo(info);
    };
    loadCountryInfo();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-blue-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Icon name="ArrowLeft" size={18} className="mr-2" />
            Вернуться на главную
          </Button>
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-gray-100">Мой профиль</h1>
          <p className="text-gray-600 dark:text-gray-400">Управление данными и настройками аккаунта</p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-2 mb-8">
            <TabsTrigger value="overview" className="w-full justify-start md:justify-center">
              <Icon name="User" size={16} className="mr-2" />
              Обзор
            </TabsTrigger>
            <TabsTrigger value="deals" className="w-full justify-start md:justify-center">
              <Icon name="History" size={16} className="mr-2" />
              Сделки
            </TabsTrigger>
            <TabsTrigger value="settings" className="w-full justify-start md:justify-center">
              <Icon name="Settings" size={16} className="mr-2" />
              Настройки
            </TabsTrigger>
            <TabsTrigger value="ratings" className="w-full justify-start md:justify-center">
              <Icon name="Star" size={16} className="mr-2" />
              Рейтинг
            </TabsTrigger>
            <TabsTrigger value="export" className="w-full justify-start md:justify-center">
              <Icon name="Download" size={16} className="mr-2" />
              Экспорт
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <OverviewTab mockUserName={userName} userType={userType} />
          </TabsContent>

          <TabsContent value="deals" className="space-y-4">
            <DealsHistory />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <SettingsTab entityType={entityType} onEntityTypeChange={setEntityType} />
          </TabsContent>

          <TabsContent value="ratings" className="space-y-4">
            <RatingSystem userId={userId} userType={userType} />
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <DataExport userId={userId} userName={userName} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}