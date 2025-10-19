import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import QRCode from 'qrcode';

const QRCodeGenerator = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [url, setUrl] = useState('');

  useEffect(() => {
    const currentUrl = window.location.origin;
    setUrl(currentUrl);
    
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, currentUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    }
  }, []);

  const downloadQR = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = 'грузовая-биржа-qr.png';
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
  };

  const printQR = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && canvasRef.current) {
      const imgData = canvasRef.current.toDataURL();
      printWindow.document.write(`
        <html>
          <head>
            <title>QR-код для грузовой биржи</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
              }
              h1 { font-size: 24px; margin-bottom: 10px; }
              p { font-size: 14px; color: #666; margin-bottom: 20px; }
              img { max-width: 400px; border: 2px solid #000; padding: 20px; }
              .url { font-size: 12px; color: #999; margin-top: 10px; word-break: break-all; }
            </style>
          </head>
          <body>
            <h1>🚛 Грузовая биржа - Логистика</h1>
            <p>Отсканируйте QR-код для быстрого доступа к платформе</p>
            <img src="${imgData}" />
            <p class="url">${url}</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(url);
    alert('✅ Ссылка скопирована в буфер обмена!');
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="QrCode" size={24} />
          QR-код для доступа
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white p-6 rounded-lg border-2 border-border flex items-center justify-center">
          <canvas ref={canvasRef} />
        </div>

        <div className="bg-muted/50 rounded-lg p-4 text-sm">
          <p className="font-semibold mb-2">Как использовать:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Наведите камеру телефона на QR-код</li>
            <li>Нажмите на появившуюся ссылку</li>
            <li>Сайт откроется автоматически</li>
          </ul>
        </div>

        <div className="flex flex-col gap-2">
          <Button onClick={downloadQR} className="w-full">
            <Icon name="Download" size={18} className="mr-2" />
            Скачать QR-код (.png)
          </Button>
          
          <Button onClick={printQR} variant="outline" className="w-full">
            <Icon name="Printer" size={18} className="mr-2" />
            Распечатать QR-код
          </Button>

          <Button onClick={copyUrl} variant="outline" className="w-full">
            <Icon name="Copy" size={18} className="mr-2" />
            Скопировать ссылку
          </Button>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-md p-4 flex items-start gap-3">
          <Icon name="Info" size={20} className="text-blue-500 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-blue-600 dark:text-blue-400">Где использовать QR-код:</p>
            <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1">
              <li>На визитках и флаерах</li>
              <li>В офисе на стойке</li>
              <li>На презентациях для клиентов</li>
              <li>В рекламных материалах</li>
            </ul>
          </div>
        </div>

        <div className="text-xs text-muted-foreground text-center break-all">
          {url}
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;
