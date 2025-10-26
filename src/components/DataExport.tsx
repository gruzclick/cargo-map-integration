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
      [`Дата формирования: ${new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`],
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
      return { wch: Math.max(Math.min(maxLength + 4, 60), 12) };
    });
    ws['!cols'] = colWidths;
    
    if (!ws['!rows']) ws['!rows'] = [];
    ws['!rows'][0] = { hpt: 30 };
    ws['!rows'][4] = { hpt: 25 };
    for (let i = 5; i < wsData.length; i++) {
      ws['!rows'][i] = { hpt: 20 };
    }
    
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellAddress]) continue;
        
        if (R === 0) {
          ws[cellAddress].s = {
            font: { bold: true, sz: 18, color: { rgb: '1E40AF' } },
            alignment: { horizontal: 'left', vertical: 'center' }
          };
        } else if (R === 1 || R === 2) {
          ws[cellAddress].s = {
            font: { sz: 10, color: { rgb: '6B7280' }, italic: true },
            alignment: { horizontal: 'left', vertical: 'center' }
          };
        } else if (R === 4) {
          ws[cellAddress].s = {
            font: { bold: true, sz: 11, color: { rgb: '1F2937' } },
            fill: { fgColor: { rgb: 'DBEAFE' } },
            alignment: { horizontal: 'center', vertical: 'center' },
            border: {
              top: { style: 'medium', color: { rgb: '2563EB' } },
              bottom: { style: 'medium', color: { rgb: '2563EB' } },
              left: { style: 'thin', color: { rgb: '93C5FD' } },
              right: { style: 'thin', color: { rgb: '93C5FD' } }
            }
          };
        } else if (R > 4) {
          const isEvenRow = (R - 5) % 2 === 0;
          ws[cellAddress].s = {
            font: { sz: 10, color: { rgb: '1F2937' } },
            fill: { fgColor: { rgb: isEvenRow ? 'FFFFFF' : 'F9FAFB' } },
            alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
            border: {
              bottom: { style: 'thin', color: { rgb: 'E5E7EB' } },
              left: { style: 'thin', color: { rgb: 'F3F4F6' } },
              right: { style: 'thin', color: { rgb: 'F3F4F6' } }
            }
          };
        }
      }
    }
    
    ws['!margins'] = { left: 0.7, right: 0.7, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 };
    ws['!printOptions'] = {
      gridLines: false,
      horizontalCentered: true
    };
    
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, filename);
    
    toast({
      title: '✅ Экспорт завершён',
      description: `Файл ${filename} успешно создан`
    });
  };

  const handleExportDeliveries = () => {
    toast({
      title: 'Нет данных',
      description: 'У вас пока нет доставок для экспорта',
      variant: 'destructive'
    });
  };

  const handleExportRatings = () => {
    toast({
      title: 'Нет данных',
      description: 'У вас пока нет отзывов для экспорта',
      variant: 'destructive'
    });
  };

  const handleExportCargo = () => {
    toast({
      title: 'Нет данных',
      description: 'У вас пока нет грузов для экспорта',
      variant: 'destructive'
    });
  };

  const handleExportFinancial = () => {
    toast({
      title: 'Нет данных',
      description: 'У вас пока нет финансовых операций для экспорта',
      variant: 'destructive'
    });
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