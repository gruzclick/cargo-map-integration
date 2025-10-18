import { Button } from './ui/button';
import Icon from './ui/icon';
import { useToast } from './ui/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Delivery {
  id: string;
  from: string;
  to: string;
  cargo: string;
  weight: string;
  status: string;
  date: string;
  price?: string;
  carrier?: string;
  client?: string;
}

interface PDFExportProps {
  deliveries: Delivery[];
  userType: 'client' | 'carrier';
  userName: string;
}

const PDFExport = ({ deliveries, userType, userName }: PDFExportProps) => {
  const { toast } = useToast();

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      doc.addFont('https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2', 'Roboto', 'normal');
      
      const currentDate = new Date().toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      doc.setFontSize(20);
      doc.text('Груз Клик', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text('История заказов', 105, 30, { align: 'center' });
      
      doc.setFontSize(10);
      doc.text(`${userType === 'client' ? 'Клиент' : 'Перевозчик'}: ${userName}`, 20, 40);
      doc.text(`Дата формирования: ${currentDate}`, 20, 45);
      doc.text(`Всего заказов: ${deliveries.length}`, 20, 50);
      
      const tableData = deliveries.map(delivery => {
        const baseData = [
          delivery.date || '-',
          delivery.from || '-',
          delivery.to || '-',
          delivery.cargo || '-',
          delivery.weight || '-',
          getStatusText(delivery.status)
        ];
        
        if (delivery.price) {
          baseData.push(delivery.price);
        }
        
        return baseData;
      });
      
      const headers = ['Дата', 'Откуда', 'Куда', 'Груз', 'Вес', 'Статус'];
      if (deliveries.some(d => d.price)) {
        headers.push('Цена');
      }
      
      autoTable(doc, {
        head: [headers],
        body: tableData,
        startY: 60,
        styles: {
          font: 'helvetica',
          fontSize: 9,
          cellPadding: 3,
          lineColor: [200, 200, 200],
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: [0, 128, 255],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 'auto' },
          3: { cellWidth: 'auto' },
          4: { cellWidth: 20 },
          5: { cellWidth: 25 },
          6: { cellWidth: 20 }
        },
        margin: { top: 60, left: 10, right: 10 }
      });
      
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Страница ${i} из ${pageCount}`,
          105,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
        doc.text(
          'Информационная платформа',
          105,
          doc.internal.pageSize.height - 5,
          { align: 'center' }
        );
      }
      
      const fileName = `gruz-klik-${userType}-${currentDate.replace(/\./g, '-')}.pdf`;
      doc.save(fileName);
      
      toast({
        title: 'Экспорт завершён',
        description: `PDF файл "${fileName}" успешно сохранён`,
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: 'Ошибка экспорта',
        description: 'Не удалось создать PDF файл',
        variant: 'destructive'
      });
    }
  };

  const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      'pending': 'Ожидание',
      'in_progress': 'В пути',
      'completed': 'Завершён',
      'cancelled': 'Отменён',
      'assigned': 'Назначен'
    };
    return statusMap[status] || status;
  };

  return (
    <Button 
      onClick={exportToPDF} 
      variant="outline"
      disabled={deliveries.length === 0}
      className="rounded-full"
    >
      <Icon name="FileDown" size={16} className="mr-2" />
      Экспорт в PDF
    </Button>
  );
};

export default PDFExport;
