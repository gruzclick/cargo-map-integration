import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface DataExportProps {
  userId: string;
  userName: string;
}

export default function DataExport({ userId, userName }: DataExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert('Нет данных для экспорта');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportDeliveries = () => {
    setIsExporting(true);
    
    const mockDeliveries = [
      {
        'ID': '12345',
        'Груз': 'Коробки с товаром',
        'Маршрут': 'Москва → Санкт-Петербург',
        'Статус': 'Доставлено',
        'Дата': '2025-10-15',
        'Цена': '15000 ₽'
      },
      {
        'ID': '12346',
        'Груз': 'Паллеты',
        'Маршрут': 'Казань → Нижний Новгород',
        'Статус': 'В пути',
        'Дата': '2025-10-18',
        'Цена': '8500 ₽'
      },
      {
        'ID': '12347',
        'Груз': 'Оборудование',
        'Маршрут': 'Москва → Екатеринбург',
        'Статус': 'Ожидает отправки',
        'Дата': '2025-10-19',
        'Цена': '25000 ₽'
      }
    ];

    setTimeout(() => {
      exportToCSV(mockDeliveries, `deliveries_${new Date().toISOString().split('T')[0]}.csv`);
      setIsExporting(false);
    }, 500);
  };

  const handleExportRatings = () => {
    setIsExporting(true);
    
    const mockRatings = [
      {
        'ID': '1',
        'Клиент': 'Иван Петров',
        'Оценка': '5',
        'Комментарий': 'Отличный водитель!',
        'Дата': '2025-10-15'
      },
      {
        'ID': '2',
        'Клиент': 'Мария Сидорова',
        'Оценка': '5',
        'Комментарий': 'Всё вовремя, рекомендую',
        'Дата': '2025-10-12'
      },
      {
        'ID': '3',
        'Клиент': 'Алексей Кузнецов',
        'Оценка': '4',
        'Комментарий': 'Хорошо',
        'Дата': '2025-10-10'
      }
    ];

    setTimeout(() => {
      exportToCSV(mockRatings, `ratings_${new Date().toISOString().split('T')[0]}.csv`);
      setIsExporting(false);
    }, 500);
  };

  const handleExportCargo = () => {
    setIsExporting(true);
    
    const mockCargo = [
      {
        'ID': 'CRG-001',
        'Название': 'Коробки с товаром',
        'Вес (кг)': '500',
        'Статус': 'Доставлено',
        'Дата создания': '2025-10-01'
      },
      {
        'ID': 'CRG-002',
        'Название': 'Паллеты с оборудованием',
        'Вес (кг)': '1200',
        'Статус': 'В пути',
        'Дата создания': '2025-10-10'
      },
      {
        'ID': 'CRG-003',
        'Название': 'Мебель',
        'Вес (кг)': '300',
        'Статус': 'Ожидает',
        'Дата создания': '2025-10-18'
      }
    ];

    setTimeout(() => {
      exportToCSV(mockCargo, `cargo_${new Date().toISOString().split('T')[0]}.csv`);
      setIsExporting(false);
    }, 500);
  };

  const handleExportFinancial = () => {
    setIsExporting(true);
    
    const mockFinancial = [
      {
        'Дата': '2025-10-15',
        'Тип': 'Доход',
        'Описание': 'Доставка Москва-СПб',
        'Сумма': '15000',
        'Статус': 'Получено'
      },
      {
        'Дата': '2025-10-18',
        'Тип': 'Доход',
        'Описание': 'Доставка Казань-Нижний Новгород',
        'Сумма': '8500',
        'Статус': 'Ожидает'
      },
      {
        'Дата': '2025-10-19',
        'Тип': 'Доход',
        'Описание': 'Доставка Москва-Екатеринбург',
        'Сумма': '25000',
        'Статус': 'Ожидает'
      }
    ];

    setTimeout(() => {
      exportToCSV(mockFinancial, `financial_${new Date().toISOString().split('T')[0]}.csv`);
      setIsExporting(false);
    }, 500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Download" size={24} />
          Экспорт данных
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-600 mb-4">
          Скачайте свои данные в формате CSV (Excel). Файл можно открыть в Microsoft Excel, Google Sheets или LibreOffice.
        </p>
        
        <Button
          onClick={handleExportDeliveries}
          disabled={isExporting}
          variant="outline"
          className="w-full justify-start"
        >
          <Icon name="Package" size={20} className="mr-2" />
          Экспорт истории доставок
        </Button>
        
        <Button
          onClick={handleExportRatings}
          disabled={isExporting}
          variant="outline"
          className="w-full justify-start"
        >
          <Icon name="Star" size={20} className="mr-2" />
          Экспорт отзывов и рейтингов
        </Button>
        
        <Button
          onClick={handleExportCargo}
          disabled={isExporting}
          variant="outline"
          className="w-full justify-start"
        >
          <Icon name="Box" size={20} className="mr-2" />
          Экспорт грузов
        </Button>
        
        <Button
          onClick={handleExportFinancial}
          disabled={isExporting}
          variant="outline"
          className="w-full justify-start"
        >
          <Icon name="DollarSign" size={20} className="mr-2" />
          Экспорт финансовых данных
        </Button>

        {isExporting && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mt-4">
            <Icon name="Loader2" size={16} className="animate-spin" />
            Подготовка файла...
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-gray-700">
          <Icon name="Info" size={14} className="inline mr-1" />
          <strong>Совет:</strong> CSV файлы можно открыть в Excel. При открытии выберите кодировку UTF-8 для корректного отображения русских символов.
        </div>
      </CardContent>
    </Card>
  );
}
