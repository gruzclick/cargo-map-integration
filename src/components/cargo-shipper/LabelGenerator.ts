import jsPDF from 'jspdf';
import { CargoItem } from './types';

export const generateLabel = (item: CargoItem, format: '75x120' | '58x40') => {
  if (!item.warehouse || !item.pickupDate || !item.contactPhone || !item.senderName) {
    alert('⚠️ Заполните все обязательные поля: имя отправителя, склад назначения, дата и номер телефона');
    return;
  }

  const pdf = new jsPDF({
    orientation: format === '75x120' ? 'landscape' : 'portrait',
    unit: 'mm',
    format: format === '75x120' ? [75, 120] : [58, 40]
  });

  pdf.setFont('times', 'bold');
  
  if (format === '75x120') {
    // Горизонтальная 120×75мм
    let y = 12;
    
    pdf.setFontSize(14);
    pdf.text('ИНФОРМАЦИЯ ДЛЯ ВОДИТЕЛЯ', 60, y, { align: 'center' });
    
    y += 10;
    pdf.setFont('times', 'normal');
    pdf.setFontSize(9);
    pdf.text('Отправитель:', 60, y, { align: 'center' });
    
    y += 5;
    pdf.setFont('times', 'bold');
    pdf.setFontSize(11);
    pdf.text(item.senderName, 60, y, { align: 'center' });
    
    y += 8;
    pdf.setFont('times', 'normal');
    pdf.setFontSize(9);
    pdf.text('Склад назначения:', 60, y, { align: 'center' });
    
    y += 5;
    pdf.setFont('times', 'bold');
    pdf.setFontSize(10);
    pdf.text(item.warehouse.marketplace, 60, y, { align: 'center' });
    
    y += 5;
    pdf.setFont('times', 'normal');
    pdf.setFontSize(8);
    const addressLines = pdf.splitTextToSize(item.warehouse.address, 110);
    pdf.text(addressLines, 60, y, { align: 'center' });
    y += addressLines.length * 4;
    
    y += 5;
    pdf.setFontSize(9);
    pdf.text('Дата поставки:', 60, y, { align: 'center' });
    
    y += 5;
    pdf.setFont('times', 'bold');
    pdf.setFontSize(11);
    pdf.text(new Date(item.pickupDate).toLocaleDateString('ru-RU'), 60, y, { align: 'center' });
    
    y += 8;
    pdf.setFont('times', 'normal');
    pdf.setFontSize(9);
    pdf.text('Контакт:', 60, y, { align: 'center' });
    
    y += 5;
    pdf.setFont('times', 'bold');
    pdf.setFontSize(11);
    pdf.text(item.contactPhone, 60, y, { align: 'center' });
    
    y += 7;
    pdf.setFont('times', 'normal');
    pdf.setFontSize(9);
    const cargoInfo = [];
    if (item.boxQuantity > 0) cargoInfo.push(`Коробов: ${item.boxQuantity}`);
    if (item.palletQuantity > 0) cargoInfo.push(`Паллет: ${item.palletQuantity}`);
    pdf.text(cargoInfo.join(', '), 60, y, { align: 'center' });
  } else {
    // Вертикальная 58×40мм
    let y = 8;
    
    pdf.setFontSize(10);
    pdf.text('ИНФО ДЛЯ ВОДИТЕЛЯ', 29, y, { align: 'center' });
    
    y += 5;
    pdf.setFont('times', 'normal');
    pdf.setFontSize(7);
    pdf.text('От:', 29, y, { align: 'center' });
    
    y += 3;
    pdf.setFont('times', 'bold');
    pdf.setFontSize(8);
    pdf.text(item.senderName, 29, y, { align: 'center' });
    
    y += 5;
    pdf.setFont('times', 'bold');
    pdf.setFontSize(8);
    pdf.text(item.warehouse.marketplace, 29, y, { align: 'center' });
    
    y += 4;
    pdf.setFont('times', 'normal');
    pdf.setFontSize(11);
    pdf.text(new Date(item.pickupDate).toLocaleDateString('ru-RU'), 29, y, { align: 'center' });
    
    y += 4;
    pdf.setFontSize(8);
    pdf.text(item.contactPhone, 29, y, { align: 'center' });
    
    y += 4;
    pdf.setFontSize(7);
    const cargoInfo = [];
    if (item.boxQuantity > 0) cargoInfo.push(`К: ${item.boxQuantity}`);
    if (item.palletQuantity > 0) cargoInfo.push(`П: ${item.palletQuantity}`);
    pdf.text(cargoInfo.join(', '), 29, y, { align: 'center' });
  }

  pdf.save(`label_${format}_${item.senderName}_${Date.now()}.pdf`);
};

export const isItemValid = (item: CargoItem): boolean => {
  return !!(item.warehouse && item.pickupAddress && item.pickupDate && 
         item.pickupTime && item.contactPhone && item.senderName && 
         (item.boxQuantity > 0 || item.palletQuantity > 0));
};

export const getCargoItemName = (item: CargoItem): string => {
  if (!item.warehouse) return `Груз`;
  
  const city = item.warehouse.city || item.warehouse.marketplace;
  const types = [];
  if (item.boxQuantity > 0) types.push(`${item.boxQuantity} К`);
  if (item.palletQuantity > 0) types.push(`${item.palletQuantity} П`);
  
  return `${city} ${types.join(' ')}`.trim() || 'Груз';
};
