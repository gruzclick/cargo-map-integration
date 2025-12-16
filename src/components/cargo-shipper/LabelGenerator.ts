import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { CargoItem } from './types';

// Добавляем поддержку кириллицы в jsPDF
import 'jspdf';

export const generateLabel = async (item: CargoItem, format: '75x120' | '58x40') => {
  if (!item.warehouse && !item.pickupDate && !item.contactPhone && !item.senderName) {
    alert('⚠️ Заполните все обязательные поля');
    return;
  }

  // Генерируем QR-код
  const qrDataURL = await QRCode.toDataURL('https://gruzclick.online', {
    width: format === '75x120' ? 200 : 120,
    margin: 1
  });

  const pdf = new jsPDF({
    orientation: 'landscape', // Горизонтальная ориентация
    unit: 'mm',
    format: format === '75x120' ? [75, 120] : [40, 58]
  });

  if (format === '75x120') {
    // Формат 120x75 мм (горизонтально)
    const qrSize = 22;
    const qrX = 120 - qrSize - 3;
    const qrY = 75 - qrSize - 3;
    
    // QR-код в правом нижнем углу
    pdf.addImage(qrDataURL, 'PNG', qrX, qrY, qrSize, qrSize);
    
    let y = 8;
    
    // Заголовок
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ИНФОРМАЦИЯ ДЛЯ ВОДИТЕЛЯ', 60, y, { align: 'center' });
    
    y += 8;
    
    // Отправитель
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Отправитель:', 5, y);
    y += 5;
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text(item.senderName || 'Не указан', 5, y);
    
    y += 7;
    
    // Склад назначения
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Склад назначения:', 5, y);
    y += 5;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    
    const warehouseName = item.warehouse 
      ? `${item.warehouse.marketplace}, ${item.warehouse.city}`
      : typeof item.warehouse === 'string' 
        ? item.warehouse 
        : 'Не указан';
    
    const warehouseLines = pdf.splitTextToSize(warehouseName, 90);
    pdf.text(warehouseLines, 5, y);
    y += warehouseLines.length * 4 + 2;
    
    if (item.warehouse && typeof item.warehouse !== 'string' && item.warehouse.address) {
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      const addressLines = pdf.splitTextToSize(item.warehouse.address, 90);
      pdf.text(addressLines, 5, y);
      y += addressLines.length * 3.5 + 3;
    } else {
      y += 3;
    }
    
    // Адрес погрузки
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Адрес погрузки:', 5, y);
    y += 5;
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    const pickupLines = pdf.splitTextToSize(item.pickupAddress || 'Не указан', 90);
    pdf.text(pickupLines, 5, y);
    y += pickupLines.length * 4 + 4;
    
    // Дата и время
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const dateStr = item.pickupDate 
      ? new Date(item.pickupDate).toLocaleDateString('ru-RU')
      : '-';
    pdf.text(`Дата: ${dateStr}`, 5, y);
    pdf.text(`Время: ${item.pickupTime || '-'}`, 50, y);
    
    y += 6;
    
    // Телефон
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Телефон: ${item.contactPhone || '-'}`, 5, y);
    
    y += 6;
    
    // Груз
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const cargoInfo = [];
    if (item.boxQuantity > 0) cargoInfo.push(`Коробов: ${item.boxQuantity}`);
    if (item.palletQuantity > 0) cargoInfo.push(`Паллет: ${item.palletQuantity}`);
    if (cargoInfo.length > 0) {
      pdf.text(cargoInfo.join(', '), 5, y);
    }
    
    // Сайт внизу
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text('gruzclick.online', 5, 73);
    
  } else {
    // Формат 58x40 мм (горизонтально)
    const qrSize = 15;
    const qrX = 58 - qrSize - 2;
    const qrY = 40 - qrSize - 2;
    
    // QR-код в правом нижнем углу
    pdf.addImage(qrDataURL, 'PNG', qrX, qrY, qrSize, qrSize);
    
    let y = 5;
    
    // Заголовок
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ИНФО ДЛЯ ВОДИТЕЛЯ', 29, y, { align: 'center' });
    
    y += 5;
    
    // Отправитель
    pdf.setFontSize(6);
    pdf.setFont('helvetica', 'normal');
    pdf.text('От:', 2, y);
    y += 3;
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.text(item.senderName || '-', 2, y);
    
    y += 4;
    
    // Склад
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    const warehouseName2 = item.warehouse 
      ? (typeof item.warehouse === 'string' ? item.warehouse : item.warehouse.marketplace)
      : '-';
    pdf.text(warehouseName2, 29, y, { align: 'center' });
    
    y += 4;
    
    // Дата
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    const dateStr2 = item.pickupDate 
      ? new Date(item.pickupDate).toLocaleDateString('ru-RU')
      : '-';
    pdf.text(dateStr2, 29, y, { align: 'center' });
    
    y += 4;
    
    // Телефон
    pdf.setFontSize(6);
    pdf.text(item.contactPhone || '-', 29, y, { align: 'center' });
    
    y += 4;
    
    // Груз
    pdf.setFontSize(6);
    const cargoInfo2 = [];
    if (item.boxQuantity > 0) cargoInfo2.push(`К:${item.boxQuantity}`);
    if (item.palletQuantity > 0) cargoInfo2.push(`П:${item.palletQuantity}`);
    if (cargoInfo2.length > 0) {
      pdf.text(cargoInfo2.join(' '), 29, y, { align: 'center' });
    }
    
    // Сайт внизу
    pdf.setFontSize(5);
    pdf.text('gruzclick.online', 2, 38);
  }

  pdf.save(`label_${format}_${item.senderName}_${Date.now()}.pdf`);
};

export const isItemValid = (item: CargoItem): boolean => {
  return !!(
    (item.warehouse || typeof item.warehouse === 'string') && 
    item.pickupAddress && 
    item.pickupDate && 
    item.pickupTime && 
    item.contactPhone && 
    item.senderName && 
    (item.boxQuantity > 0 || item.palletQuantity > 0)
  );
};

export const getCargoItemName = (item: CargoItem): string => {
  if (!item.warehouse) return `Груз`;
  
  const city = typeof item.warehouse === 'string' 
    ? item.warehouse 
    : (item.warehouse.city || item.warehouse.marketplace);
  
  const types = [];
  if (item.boxQuantity > 0) types.push(`${item.boxQuantity} К`);
  if (item.palletQuantity > 0) types.push(`${item.palletQuantity} П`);
  
  return `${city} ${types.join(' ')}`.trim() || 'Груз';
};
