import * as XLSX from 'xlsx';
import { RouteHistoryItem } from './routeHistory';

export function exportRouteHistoryToExcel(history: RouteHistoryItem[]): void {
  if (history.length === 0) {
    alert('История маршрутов пуста');
    return;
  }

  const data = history.map((item, index) => ({
    '№': index + 1,
    'Дата и время': new Date(item.timestamp).toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }),
    'Откуда': item.from,
    'Куда': item.to,
    'Тип груза': item.cargoType || '-',
    'Вес (кг)': item.weight || '-'
  }));

  const ws = XLSX.utils.json_to_sheet(data);

  const colWidths = [
    { wch: 5 },
    { wch: 20 },
    { wch: 30 },
    { wch: 30 },
    { wch: 20 },
    { wch: 15 }
  ];
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'История маршрутов');

  const fileName = `История_маршрутов_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}.xlsx`;
  
  XLSX.writeFile(wb, fileName);
}
