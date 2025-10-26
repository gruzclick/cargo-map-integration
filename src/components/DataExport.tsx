import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';

interface DataExportProps {
  userId: string;
  userName: string;
}

export default function DataExport({ userId, userName }: DataExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportToExcel = (data: any[], filename: string, sheetName: string, title: string) => {
    if (data.length === 0) {
      toast({
        title: 'Ошибка',
        description: 'Нет данных для экспорта',
        variant: 'destructive'
      });
      return;
    }

    const wb = XLSX.utils.book_new();
    
    const headerData = [
      [title],
      [`Дата формирования: ${new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}`],
      [`Пользователь: ${userName}`],
      [],
      Object.keys(data[0])
    ];
    
    const dataRows = data.map(row => Object.values(row));
    
    const wsData = [...headerData, ...dataRows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    const colWidths = Object.keys(data[0]).map((key) => {
      const maxLength = Math.max(
        key.length,
        ...data.map(row => String(row[key] || '').length)
      );
      return { wch: Math.min(maxLength + 2, 50) };
    });
    ws['!cols'] = colWidths;
    
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellAddress]) continue;
        
        if (R === 0) {
          ws[cellAddress].s = {
            font: { bold: true, sz: 16, color: { rgb: '2563EB' } },
            alignment: { horizontal: 'left', vertical: 'center' }
          };
        } else if (R === 4) {
          ws[cellAddress].s = {
            font: { bold: true, sz: 12 },
            fill: { fgColor: { rgb: 'DBEAFE' } },
            alignment: { horizontal: 'center', vertical: 'center' },
            border: {
              top: { style: 'thin', color: { rgb: '2563EB' } },
              bottom: { style: 'thin', color: { rgb: '2563EB' } }
            }
          };
        } else if (R > 4) {
          ws[cellAddress].s = {
            alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
            border: {
              bottom: { style: 'thin', color: { rgb: 'E5E7EB' } }
            }
          };
        }
      }
    }
    
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, filename);
    
    toast({
      title: '✅ Экспорт завершён',
      description: `Файл ${filename} успешно создан`
    });
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
      exportToExcel(
        mockDeliveries, 
        `ГрузКлик_Доставки_${new Date().toISOString().split('T')[0]}.xlsx`,
        'Доставки',
        'ОТЧЁТ ПО ДОСТАВКАМ - ГРУЗКЛИК'
      );
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
      exportToExcel(
        mockRatings, 
        `ГрузКлик_Отзывы_${new Date().toISOString().split('T')[0]}.xlsx`,
        'Отзывы',
        'ОТЧЁТ ПО ОТЗЫВАМ И РЕЙТИНГАМ - ГРУЗКЛИК'
      );
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
      exportToExcel(
        mockCargo, 
        `ГрузКлик_Грузы_${new Date().toISOString().split('T')[0]}.xlsx`,
        'Грузы',
        'ОТЧЁТ ПО ГРУЗАМ - ГРУЗКЛИК'
      );
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
      exportToExcel(
        mockFinancial, 
        `ГрузКлик_Финансы_${new Date().toISOString().split('T')[0]}.xlsx`,
        'Финансы',
        'ФИНАНСОВЫЙ ОТЧЁТ - ГРУЗКЛИК'
      );
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
          Скачайте свои данные в формате Excel (XLSX). Профессионально оформленные отчёты с заголовками и стилями.
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
          <strong>Инфо:</strong> Файлы экспортируются в формате XLSX с профессиональным оформлением: заголовки, цвета, ширина колонок. Открывается в Excel, LibreOffice, Google Sheets.
        </div>
      </CardContent>
    </Card>
  );
}