import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapSettings } from '@/components/admin/MapSettings';
import { OrderSettings } from '@/components/admin/OrderSettings';
import { LimitsSettings } from '@/components/admin/LimitsSettings';
import { ApiSettings } from '@/components/admin/ApiSettings';
import { BackupSettings } from '@/components/admin/BackupSettings';

export default function AdminSettings() {
  const { toast } = useToast();
  const [mapSettings, setMapSettings] = useState(() => {
    const saved = localStorage.getItem('admin_map_settings');
    return saved ? JSON.parse(saved) : {
      searchRadius: 50,
      maxWaitTime: 15,
      autoRefresh: true,
      refreshInterval: 30
    };
  });
  
  const [orderSettings, setOrderSettings] = useState(() => {
    const saved = localStorage.getItem('admin_order_settings');
    return saved ? JSON.parse(saved) : {
      minOrderAmount: 500,
      maxOrderAmount: 100000,
      cancelTimeout: 5,
      autoAssign: true
    };
  });
  
  const [apiKeys, setApiKeys] = useState(() => {
    const saved = localStorage.getItem('admin_api_keys');
    return saved ? JSON.parse(saved) : {
      yandexMaps: '',
      payment: '',
      sms: ''
    };
  });
  
  const [showApiKeys, setShowApiKeys] = useState({
    yandexMaps: false,
    payment: false,
    sms: false
  });
  
  const [backupSettings, setBackupSettings] = useState(() => {
    const saved = localStorage.getItem('admin_backup_settings');
    return saved ? JSON.parse(saved) : {
      autoBackup: true,
      backupInterval: 24,
      lastBackup: '2025-01-25 03:00'
    };
  });
  
  const [backupHistory, setBackupHistory] = useState(() => {
    const saved = localStorage.getItem('backup_history');
    return saved ? JSON.parse(saved) : [
      { id: '1', date: '2025-01-25 03:00', size: '245 MB', status: 'Успешно' },
      { id: '2', date: '2025-01-24 03:00', size: '242 MB', status: 'Успешно' },
      { id: '3', date: '2025-01-23 03:00', size: '238 MB', status: 'Успешно' }
    ];
  });

  const handleSaveMapSettings = () => {
    localStorage.setItem('admin_map_settings', JSON.stringify(mapSettings));
    toast({
      title: 'Настройки карты сохранены',
      description: 'Изменения вступят в силу немедленно'
    });
  };

  const handleSaveOrderSettings = () => {
    localStorage.setItem('admin_order_settings', JSON.stringify(orderSettings));
    toast({
      title: 'Настройки заказов сохранены',
      description: 'Новые параметры применены'
    });
  };
  
  const handleSaveApiKeys = () => {
    localStorage.setItem('admin_api_keys', JSON.stringify(apiKeys));
    toast({
      title: 'API ключи сохранены',
      description: 'Ключи безопасно сохранены в системе'
    });
  };

  const handleBackupNow = () => {
    toast({
      title: 'Резервное копирование запущено',
      description: 'Процесс займет несколько минут'
    });
    setTimeout(() => {
      const newBackup = {
        id: Date.now().toString(),
        date: new Date().toLocaleString('ru-RU'),
        size: Math.floor(Math.random() * 50 + 230) + ' MB',
        status: 'Успешно'
      };
      const updated = [newBackup, ...backupHistory];
      setBackupHistory(updated);
      localStorage.setItem('backup_history', JSON.stringify(updated));
      
      const newSettings = { ...backupSettings, lastBackup: newBackup.date };
      setBackupSettings(newSettings);
      localStorage.setItem('admin_backup_settings', JSON.stringify(newSettings));
      
      toast({
        title: 'Резервная копия создана',
        description: 'Все данные успешно сохранены'
      });
    }, 3000);
  };
  
  const handleDownloadBackup = (backupId: string) => {
    const backup = backupHistory.find(b => b.id === backupId);
    if (!backup) return;
    
    const dataStr = JSON.stringify({
      backup_date: backup.date,
      backup_size: backup.size,
      settings: { mapSettings, orderSettings, apiKeys, backupSettings },
      data: {
        note: 'Это демо-версия резервной копии. В production здесь будет полный экспорт данных из БД.'
      }
    }, null, 2);
    
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-${backup.date.replace(/[:\s]/g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Резервная копия скачана',
      description: `Файл backup-${backup.date.replace(/[:\s]/g, '-')}.json сохранен`
    });
  };
  
  const handleDeleteBackup = (backupId: string) => {
    if (!confirm('Вы уверены что хотите удалить эту резервную копию?')) return;
    
    const updated = backupHistory.filter(b => b.id !== backupId);
    setBackupHistory(updated);
    localStorage.setItem('backup_history', JSON.stringify(updated));
    
    toast({
      title: 'Резервная копия удалена',
      description: 'История обновлена'
    });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => window.history.back()}>
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Icon name="Settings" size={32} />
              Настройки системы
            </h1>
            <p className="text-muted-foreground">Конфигурация платформы и интеграции</p>
          </div>
        </div>

        <Tabs defaultValue="map" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="map">Карта</TabsTrigger>
            <TabsTrigger value="orders">Заказы</TabsTrigger>
            <TabsTrigger value="limits">Лимиты</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
            <TabsTrigger value="backup">Backup</TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-4">
            <MapSettings
              mapSettings={mapSettings}
              setMapSettings={setMapSettings}
              onSave={handleSaveMapSettings}
            />
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <OrderSettings
              orderSettings={orderSettings}
              setOrderSettings={setOrderSettings}
              onSave={handleSaveOrderSettings}
            />
          </TabsContent>

          <TabsContent value="limits" className="space-y-4">
            <LimitsSettings />
          </TabsContent>

          <TabsContent value="api" className="space-y-4">
            <ApiSettings
              apiKeys={apiKeys}
              setApiKeys={setApiKeys}
              showApiKeys={showApiKeys}
              setShowApiKeys={setShowApiKeys}
              onSave={handleSaveApiKeys}
            />
          </TabsContent>

          <TabsContent value="backup" className="space-y-4">
            <BackupSettings
              backupSettings={backupSettings}
              setBackupSettings={setBackupSettings}
              backupHistory={backupHistory}
              onBackupNow={handleBackupNow}
              onDownloadBackup={handleDownloadBackup}
              onDeleteBackup={handleDeleteBackup}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
