import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}

export const exportToPDF = async (elementId: string, filename: string = 'report.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found:', elementId);
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

    const width = imgWidth * ratio;
    const height = imgHeight * ratio;
    
    const x = (pdfWidth - width) / 2;
    const y = (pdfHeight - height) / 2;

    pdf.addImage(imgData, 'PNG', x, y, width, height, undefined, 'FAST');
    pdf.save(filename);
  } catch (error) {
    console.error('PDF export error:', error);
    throw error;
  }
};

export const exportMultiPagePDF = async (elementIds: string[], filename: string = 'report.pdf') => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  for (let i = 0; i < elementIds.length; i++) {
    const element = document.getElementById(elementIds[i]);
    if (!element) {
      console.warn('Element not found:', elementIds[i]);
      continue;
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

      const width = imgWidth * ratio;
      const height = imgHeight * ratio;

      if (i > 0) {
        pdf.addPage();
      }

      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
    } catch (error) {
      console.error(`Error exporting element ${elementIds[i]}:`, error);
    }
  }

  pdf.save(filename);
};

export const exportAnalyticsToPDF = async (data: {
  title: string;
  subtitle?: string;
  stats: Array<{ label: string; value: string | number }>;
  chartIds: string[];
  filename?: string;
}) => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = margin;
  
  pdf.setFillColor(41, 128, 185);
  pdf.rect(0, 0, pageWidth, 35, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text(data.title, margin, 15);

  if (data.subtitle) {
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(240, 240, 240);
    pdf.text(data.subtitle, margin, 23);
  }

  pdf.setTextColor(100, 100, 100);
  pdf.setFontSize(9);
  pdf.text(`Дата: ${new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}`, margin, 30);

  yPos = 45;

  if (data.stats.length > 0) {
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Основные показатели', margin, yPos);
    yPos += 8;

    const statsPerRow = 2;
    const colWidth = (pageWidth - 2 * margin) / statsPerRow;
    
    for (let i = 0; i < data.stats.length; i++) {
      const stat = data.stats[i];
      const col = i % statsPerRow;
      const xPos = margin + col * colWidth;
      
      if (col === 0 && i > 0) {
        yPos += 15;
      }
      
      pdf.setFillColor(245, 247, 250);
      pdf.roundedRect(xPos, yPos - 4, colWidth - 5, 12, 2, 2, 'F');
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text(stat.label, xPos + 3, yPos);
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(String(stat.value), xPos + 3, yPos + 5);
    }
    
    yPos += 20;
  }

  for (let i = 0; i < data.chartIds.length; i++) {
    const chartId = data.chartIds[i];
    const element = document.getElementById(chartId);
    if (!element) continue;

    try {
      if (yPos > 50 && i > 0) {
        pdf.addPage();
        yPos = margin;
      }

      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 5;

      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const maxWidth = pageWidth - 2 * margin;
      const maxHeight = pageHeight - yPos - margin - 20;
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
      const width = imgWidth * ratio;
      const height = imgHeight * ratio;

      if (yPos + height > pageHeight - margin - 20) {
        pdf.addPage();
        yPos = margin;
      }

      const xCenter = (pageWidth - width) / 2;
      pdf.addImage(imgData, 'PNG', xCenter, yPos, width, height, undefined, 'FAST');
      yPos += height + 10;
    } catch (error) {
      console.error(`Error adding chart ${chartId}:`, error);
    }
  }

  const pageCount = (pdf as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.setFont('helvetica', 'normal');
    pdf.text(
      `Страница ${i} из ${pageCount}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  const filename = data.filename || `analytics-${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(filename);
};