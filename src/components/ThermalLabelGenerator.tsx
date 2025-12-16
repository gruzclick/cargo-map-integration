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
    from: '',
    to: '',
    description: '',
    weight: '',
    date: new Date().toISOString().split('T')[0]
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}.${month}.${year}`;
  };

  const generateLabel = () => {
    if (!cargoData.from || !cargoData.to || !cargoData.description || !cargoData.weight) {
      toast({
        title: 'Заполните все поля',
        description: 'Для печати этикетки необходимо заполнить все данные о грузе',
        variant: 'destructive'
      });
      return;
    }

    const width = format === '58mm' ? '58mm' : '100mm';
    const height = format === '58mm' ? '40mm' : '100mm';
    const qrSize = format === '58mm' ? '30mm' : '40mm';

    const printWindow = window.open('', '', 'width=400,height=600');
    if (!printWindow) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось открыть окно печати. Разрешите всплывающие окна.',
        variant: 'destructive'
      });
      return;
    }

    const qrCodeURL = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('https://грузклик.рф')}`;

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
              font-size: ${format === '58mm' ? '14pt' : '20pt'};
              font-weight: bold;
            }
            .content {
              flex: 1;
              display: flex;
              flex-direction: column;
              gap: ${format === '58mm' ? '1.5mm' : '2.5mm'};
            }
            .section {
              display: flex;
              flex-direction: column;
            }
            .label {
              font-size: ${format === '58mm' ? '8pt' : '11pt'};
              font-weight: bold;
              color: #555;
              margin-bottom: ${format === '58mm' ? '0.5mm' : '1mm'};
            }
            .value {
              font-size: ${format === '58mm' ? '11pt' : '15pt'};
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
            .footer-info {
              flex: 1;
            }
            .footer-site {
              font-size: ${format === '58mm' ? '12pt' : '16pt'};
              font-weight: bold;
              margin-bottom: ${format === '58mm' ? '0.5mm' : '1mm'};
            }
            .footer-desc {
              font-size: ${format === '58mm' ? '7pt' : '10pt'};
              color: #666;
            }
            .footer-qr {
              width: ${qrSize};
              height: ${qrSize};
              flex-shrink: 0;
            }
            .footer-qr img {
              width: 100%;
              height: 100%;
              display: block;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ТЕРМОЭТИКЕТКА ГРУЗА</h1>
          </div>
          
          <div class="content">
            <div class="section">
              <div class="label">Номер груза:</div>
              <div class="value">${cargoData.id}</div>
            </div>
            
            <div class="section">
              <div class="label">Откуда:</div>
              <div class="value">${cargoData.from}</div>
            </div>
            
            <div class="section">
              <div class="label">Куда:</div>
              <div class="value">${cargoData.to}</div>
            </div>
            
            <div class="section">
              <div class="label">Описание:</div>
              <div class="value">${cargoData.description}</div>
            </div>
            
            <div class="section">
              <div class="label">Вес:</div>
              <div class="value">${cargoData.weight} кг</div>
            </div>
            
            <div class="section">
              <div class="label">Дата:</div>
              <div class="value">${formatDate(cargoData.date)}</div>
            </div>
          </div>
          
          <div class="footer">
            <div class="footer-info">
              <div class="footer-site">грузклик.рф</div>
              <div class="footer-desc">Грузовая биржа онлайн</div>
            </div>
            <div class="footer-qr">
              <img src="${qrCodeURL}" alt="QR код" />
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
        setTimeout(() => {
          printWindow.close();
          toast({
            title: 'Этикетка отправлена на печать',
            description: `Формат: ${format}`,
          });
        }, 500);
      }, 250);
    };
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Генератор термоэтикеток</CardTitle>
        <CardDescription>Создайте и распечатайте термоэтикетку для груза</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label>Формат этикетки</Label>
          <Select value={format} onValueChange={(val) => setFormat(val as '58mm' | '100mm')}>
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

        <div className="grid md:grid-cols-2 gap-4">
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
          <Label>Вес груза (кг)</Label>
          <Input
            type="number"
            value={cargoData.weight}
            onChange={(e) => setCargoData({ ...cargoData, weight: e.target.value })}
            placeholder="150"
            min="0"
            step="0.1"
          />
        </div>

        <div className="pt-4 border-t">
          <h3 className="font-semibold mb-3">Предпросмотр этикетки:</h3>
          <Card className="bg-gray-50 dark:bg-gray-900 p-4">
            <div className="border-b-2 border-black pb-2 mb-3 text-center">
              <p className="font-bold text-sm">ТЕРМОЭТИКЕТКА ГРУЗА</p>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <span className="font-bold text-gray-600">Номер груза:</span>
                <p className="font-semibold">{cargoData.id || '—'}</p>
              </div>
              <div>
                <span className="font-bold text-gray-600">Откуда:</span>
                <p className="font-semibold">{cargoData.from || '—'}</p>
              </div>
              <div>
                <span className="font-bold text-gray-600">Куда:</span>
                <p className="font-semibold">{cargoData.to || '—'}</p>
              </div>
              <div>
                <span className="font-bold text-gray-600">Описание:</span>
                <p className="font-semibold">{cargoData.description || '—'}</p>
              </div>
              <div>
                <span className="font-bold text-gray-600">Вес:</span>
                <p className="font-semibold">{cargoData.weight ? `${cargoData.weight} кг` : '—'}</p>
              </div>
              <div>
                <span className="font-bold text-gray-600">Дата:</span>
                <p className="font-semibold">{formatDate(cargoData.date)}</p>
              </div>
            </div>
            <div className="border-t-2 border-black mt-3 pt-2 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm">грузклик.рф</p>
                <p className="text-xs text-gray-600">Грузовая биржа онлайн</p>
              </div>
              <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-xs">
                QR
              </div>
            </div>
          </Card>
        </div>

        <Button onClick={generateLabel} className="w-full" size="lg">
          <Icon name="Printer" className="mr-2" size={18} />
          Напечатать этикетку
        </Button>
      </CardContent>
    </Card>
  );
}
