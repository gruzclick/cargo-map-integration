import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import Icon from './ui/icon';
import { useToast } from '@/hooks/use-toast';

interface CargoData {
  id: string;
  from: string;
  to: string;
  description: string;
  weight: string;
  date: string;
}

export default function ThermalLabelGenerator() {
  const { toast } = useToast();
  const [format, setFormat] = useState<'58mm' | '100mm'>('58mm');
  const [cargoData, setCargoData] = useState<CargoData>({
    id: 'ГРУЗ-' + Date.now(),
    from: 'Москва, Россия',
    to: 'Санкт-Петербург, Россия',
    description: 'Бытовая техника',
    weight: '150',
    date: new Date().toISOString().split('T')[0]
  });

  const generateLabel = () => {
    const width = format === '58mm' ? '58mm' : '100mm';
    const height = format === '58mm' ? '40mm' : '100mm';

    const printWindow = window.open('', '', `width=400,height=600`);
    if (!printWindow) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось открыть окно печати. Разрешите всплывающие окна.',
        variant: 'destructive'
      });
      return;
    }

    const qrCodeURL = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin)}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Термоэтикетка груза</title>
          <style>
            @page {
              size: ${width} ${height};
              margin: 0;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              width: ${width};
              height: ${height};
              font-family: Arial, sans-serif;
              padding: ${format === '58mm' ? '3mm' : '5mm'};
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid black;
              padding-bottom: ${format === '58mm' ? '2mm' : '3mm'};
              margin-bottom: ${format === '58mm' ? '2mm' : '3mm'};
            }
            .header h1 {
              font-size: ${format === '58mm' ? '16pt' : '22pt'};
              font-weight: bold;
            }
            .content {
              flex: 1;
            }
            .section {
              margin: ${format === '58mm' ? '1.5mm' : '2mm'} 0;
            }
            .label {
              font-size: ${format === '58mm' ? '9pt' : '12pt'};
              font-weight: bold;
              color: #555;
            }
            .value {
              font-size: ${format === '58mm' ? '12pt' : '16pt'};
              margin-top: ${format === '58mm' ? '0.5mm' : '1mm'};
              font-weight: 600;
              word-wrap: break-word;
            }
            .footer {
              border-top: 2px solid black;
              padding-top: ${format === '58mm' ? '2mm' : '3mm'};
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .qr-code {
              width: ${format === '58mm' ? '30mm' : '40mm'};
              height: ${format === '58mm' ? '30mm' : '40mm'};
            }
            .qr-code img {
              width: 100%;
              height: 100%;
            }
            .site-info {
              flex: 1;
              text-align: center;
              padding: 0 ${format === '58mm' ? '2mm' : '3mm'};
            }
            .site-url {
              font-size: ${format === '58mm' ? '11pt' : '14pt'};
              font-weight: bold;
            }
            .site-desc {
              font-size: ${format === '58mm' ? '7pt' : '9pt'};
              color: #666;
              margin-top: 1mm;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ТЕРМОЭТИКЕТКА ГРУЗА</h1>
          </div>
          
          <div class="content">
            <div class="section">
              <div class="label">ОТКУДА:</div>
              <div class="value">${cargoData.from}</div>
            </div>
            
            <div class="section">
              <div class="label">КУДА:</div>
              <div class="value">${cargoData.to}</div>
            </div>
            
            <div class="section">
              <div class="label">ГРУЗ:</div>
              <div class="value">${cargoData.description}</div>
            </div>
            
            <div class="section">
              <div class="label">ВЕС:</div>
              <div class="value">${cargoData.weight} кг</div>
            </div>
            
            <div class="section">
              <div class="label">ДАТА:</div>
              <div class="value">${new Date(cargoData.date).toLocaleDateString('ru-RU')}</div>
            </div>
            
            <div class="section">
              <div class="label">НОМЕР:</div>
              <div class="value" style="font-family: monospace;">${cargoData.id}</div>
            </div>
          </div>
          
          <div class="footer">
            <div class="qr-code">
              <img src="${qrCodeURL}" alt="QR код" />
            </div>
            <div class="site-info">
              <div class="site-url">грузклик.рф</div>
              <div class="site-desc">Грузовая биржа онлайн</div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        setTimeout(() => printWindow.close(), 500);
      }, 250);
    };

    toast({
      title: 'Печать этикетки',
      description: `Подготовка термоэтикетки ${format}...`
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Printer" size={24} />
            Генератор термоэтикеток
          </CardTitle>
          <CardDescription>
            Создавайте этикетки для груза с QR-кодом
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Формат этикетки</Label>
            <Select value={format} onValueChange={(val: '58mm' | '100mm') => setFormat(val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="58mm">58mm × 40mm (компактная)</SelectItem>
                <SelectItem value="100mm">100mm × 100mm (большая)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Номер груза</Label>
              <Input 
                value={cargoData.id} 
                onChange={(e) => setCargoData({ ...cargoData, id: e.target.value })} 
                placeholder="ГРУЗ-123456"
              />
            </div>
            <div>
              <Label>Дата</Label>
              <Input 
                type="date"
                value={cargoData.date} 
                onChange={(e) => setCargoData({ ...cargoData, date: e.target.value })} 
              />
            </div>
          </div>

          <div>
            <Label>Откуда</Label>
            <Input 
              value={cargoData.from} 
              onChange={(e) => setCargoData({ ...cargoData, from: e.target.value })} 
              placeholder="Москва, Россия"
            />
          </div>

          <div>
            <Label>Куда</Label>
            <Input 
              value={cargoData.to} 
              onChange={(e) => setCargoData({ ...cargoData, to: e.target.value })} 
              placeholder="Санкт-Петербург, Россия"
            />
          </div>

          <div>
            <Label>Описание груза</Label>
            <Input 
              value={cargoData.description} 
              onChange={(e) => setCargoData({ ...cargoData, description: e.target.value })} 
              placeholder="Бытовая техника"
            />
          </div>

          <div>
            <Label>Вес (кг)</Label>
            <Input 
              type="number"
              value={cargoData.weight} 
              onChange={(e) => setCargoData({ ...cargoData, weight: e.target.value })} 
              placeholder="150"
            />
          </div>

          <Button onClick={generateLabel} className="w-full gap-2" size="lg">
            <Icon name="Printer" size={18} />
            Напечатать этикетку {format}
          </Button>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex gap-2 text-sm">
              <Icon name="Info" size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1 text-blue-400">
                <p className="font-semibold">Инструкция по печати:</p>
                <ul className="list-disc list-inside space-y-0.5 text-xs">
                  <li>Выберите формат этикетки в зависимости от вашего принтера</li>
                  <li>Заполните все поля информации о грузе</li>
                  <li>Нажмите "Напечатать" и выберите термопринтер</li>
                  <li>QR-код ведёт на сайт ГрузКлик для отслеживания груза</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
