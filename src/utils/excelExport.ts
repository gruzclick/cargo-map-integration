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
    { wch: 8 },
    { wch: 22 },
    { wch: 35 },
    { wch: 35 },
    { wch: 22 },
    { wch: 18 }
  ];
  ws['!cols'] = colWidths;

  const headerStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
    fill: { fgColor: { rgb: "4472C4" } },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } }
    }
  };

  const cellStyle = {
    alignment: { horizontal: "left", vertical: "center", wrapText: true },
    border: {
      top: { style: "thin", color: { rgb: "D9D9D9" } },
      bottom: { style: "thin", color: { rgb: "D9D9D9" } },
      left: { style: "thin", color: { rgb: "D9D9D9" } },
      right: { style: "thin", color: { rgb: "D9D9D9" } }
    }
  };

  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const headerAddress = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!ws[headerAddress]) continue;
    ws[headerAddress].s = headerStyle;
  }

  for (let R = range.s.r + 1; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellAddress]) continue;
      ws[cellAddress].s = cellStyle;
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'История маршрутов');

  const fileName = `История_маршрутов_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}.xlsx`;
  
  XLSX.writeFile(wb, fileName);
}