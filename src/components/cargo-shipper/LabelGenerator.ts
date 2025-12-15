import jsPDF from 'jspdf';
import { CargoItem } from './types';

export const generateLabel = (item: CargoItem, format: '75x120' | '58x40') => {
  if (!item.warehouse || !item.pickupDate || !item.contactPhone || !item.senderName) {
    alert('⚠️ Заполните все обязательные поля: имя отправителя, склад назначения, дата и номер телефона');
    return;
  }

  const pdf = new jsPDF({
    orientation: format === '75x120' ? 'portrait' : 'portrait',
    unit: 'mm',
    format: format === '75x120' ? [120, 75] : [58, 40]
  });

  if (format === '75x120') {
    let y = 10;
    pdf.setFont('courier', 'bold');
    pdf.setFontSize(16);
    pdf.text('INFO VODITELYA', 60, y, { align: 'center' });
    
    y += 10;
    pdf.setFont('courier', 'normal');
    pdf.setFontSize(11);
    pdf.text('Otpravitel:', 10, y);
    y += 6;
    pdf.setFont('courier', 'bold');
    pdf.setFontSize(12);
    pdf.text(item.senderName, 10, y);
    
    y += 9;
    pdf.setFont('courier', 'normal');
    pdf.setFontSize(11);
    pdf.text('Sklad naznacheniya:', 10, y);
    y += 6;
    pdf.setFont('courier', 'bold');
    pdf.setFontSize(11);
    const warehouseLines = pdf.splitTextToSize(`${item.warehouse.marketplace}, ${item.warehouse.city}`, 100);
    pdf.text(warehouseLines, 10, y);
    y += warehouseLines.length * 5 + 1;
    pdf.setFont('courier', 'normal');
    pdf.setFontSize(9);
    const addressLines = pdf.splitTextToSize(item.warehouse.address, 100);
    pdf.text(addressLines, 10, y);
    y += addressLines.length * 4 + 4;
    
    pdf.setFont('courier', 'normal');
    pdf.setFontSize(11);
    pdf.text('Adres zabora:', 10, y);
    y += 6;
    pdf.setFont('courier', 'bold');
    pdf.setFontSize(10);
    const pickupLines = pdf.splitTextToSize(item.pickupAddress, 100);
    pdf.text(pickupLines, 10, y);
    y += pickupLines.length * 5 + 4;
    
    pdf.setFont('courier', 'normal');
    pdf.setFontSize(11);
    pdf.text(`Data: ${new Date(item.pickupDate).toLocaleDateString('ru-RU')}   Vremya: ${item.pickupTime}`, 10, y);
    
    y += 8;
    pdf.setFont('courier', 'bold');
    pdf.setFontSize(12);
    pdf.text(`Tel: ${item.contactPhone}`, 10, y);
    
    y += 7;
    pdf.setFont('courier', 'normal');
    pdf.setFontSize(11);
    const cargoInfo = [];
    if (item.boxQuantity > 0) cargoInfo.push(`Korobov: ${item.boxQuantity}`);
    if (item.palletQuantity > 0) cargoInfo.push(`Pallet: ${item.palletQuantity}`);
    pdf.text(cargoInfo.join(', '), 10, y);
  } else {
    let y = 6;
    pdf.setFont('courier', 'bold');
    pdf.setFontSize(10);
    pdf.text('INFO VODITELYA', 29, y, { align: 'center' });
    
    y += 6;
    pdf.setFont('courier', 'normal');
    pdf.setFontSize(8);
    pdf.text('Ot:', 29, y, { align: 'center' });
    y += 4;
    pdf.setFont('courier', 'bold');
    pdf.setFontSize(9);
    pdf.text(item.senderName, 29, y, { align: 'center' });
    
    y += 5;
    pdf.setFont('courier', 'bold');
    pdf.setFontSize(8);
    pdf.text(item.warehouse.marketplace, 29, y, { align: 'center' });
    
    y += 4;
    pdf.setFont('courier', 'normal');
    pdf.setFontSize(9);
    pdf.text(new Date(item.pickupDate).toLocaleDateString('ru-RU'), 29, y, { align: 'center' });
    
    y += 4;
    pdf.setFontSize(8);
    pdf.text(item.contactPhone, 29, y, { align: 'center' });
    
    y += 4;
    pdf.setFontSize(7);
    const cargoInfo = [];
    if (item.boxQuantity > 0) cargoInfo.push(`K: ${item.boxQuantity}`);
    if (item.palletQuantity > 0) cargoInfo.push(`P: ${item.palletQuantity}`);
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