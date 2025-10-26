import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportToPDF = async (elementId: string, filename: string = 'report.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found:', elementId);
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

    const width = imgWidth * ratio;
    const height = imgHeight * ratio;

    pdf.addImage(imgData, 'PNG', 0, 0, width, height);
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
    format: 'a4'
  });

  let yPos = 20;
  
  pdf.setFontSize(20);
  pdf.text(data.title, 20, yPos);
  yPos += 10;

  if (data.subtitle) {
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.text(data.subtitle, 20, yPos);
    yPos += 10;
  }

  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  data.stats.forEach((stat) => {
    pdf.text(`${stat.label}: ${stat.value}`, 20, yPos);
    yPos += 7;
  });

  yPos += 10;

  for (const chartId of data.chartIds) {
    const element = document.getElementById(chartId);
    if (!element) continue;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth() - 40;
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = pdfWidth / imgWidth;
      const height = imgHeight * ratio;

      if (yPos + height > pdf.internal.pageSize.getHeight() - 20) {
        pdf.addPage();
        yPos = 20;
      }

      pdf.addImage(imgData, 'PNG', 20, yPos, pdfWidth, height);
      yPos += height + 10;
    } catch (error) {
      console.error(`Error adding chart ${chartId}:`, error);
    }
  }

  const filename = data.filename || `analytics-${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(filename);
};
