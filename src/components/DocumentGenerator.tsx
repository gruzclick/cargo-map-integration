import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import Icon from './ui/icon';
import { useToast } from '@/hooks/use-toast';

interface DocumentData {
  doc_type: string;
  sender_name: string;
  sender_inn: string;
  sender_address: string;
  sender_phone: string;
  receiver_name: string;
  receiver_inn: string;
  receiver_address: string;
  receiver_phone: string;
  cargo_description: string;
  cargo_weight: string;
  cargo_volume: string;
  cargo_value: string;
  transport_type: string;
  route_from: string;
  route_to: string;
  delivery_date: string;
  price: string;
  payment_terms: string;
  additional_info: string;
}

export default function DocumentGenerator() {
  const { toast } = useToast();
  const [docType, setDocType] = useState('tn');
  const [formData, setFormData] = useState<DocumentData>({
    doc_type: 'tn',
    sender_name: '',
    sender_inn: '',
    sender_address: '',
    sender_phone: '',
    receiver_name: '',
    receiver_inn: '',
    receiver_address: '',
    receiver_phone: '',
    cargo_description: '',
    cargo_weight: '',
    cargo_volume: '',
    cargo_value: '',
    transport_type: '',
    route_from: '',
    route_to: '',
    delivery_date: '',
    price: '',
    payment_terms: 'prepayment',
    additional_info: ''
  });

  const updateField = (field: keyof DocumentData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handlePrint = () => {
    window.print();
    toast({
      title: 'Документ отправлен на печать',
      description: 'Проверьте настройки принтера'
    });
  };

  const handleSend = async () => {
    toast({
      title: 'Документ отправлен',
      description: 'Документ отправлен перевозчику'
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="FileText" size={24} />
            Генератор документов для перевозки
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Тип документа</Label>
            <Select value={docType} onValueChange={(val) => { setDocType(val); updateField('doc_type', val); }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tn">Товарно-транспортная накладная (ТТН)</SelectItem>
                <SelectItem value="contract">Договор перевозки</SelectItem>
                <SelectItem value="invoice">Счёт на оплату</SelectItem>
                <SelectItem value="act">Акт приёма-передачи</SelectItem>
                <SelectItem value="waybill">Путевой лист</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-4 bg-muted/30">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Icon name="User" size={18} />
                Отправитель
              </h3>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Наименование / ФИО</Label>
                  <Input value={formData.sender_name} onChange={(e) => updateField('sender_name', e.target.value)} placeholder="ООО Компания" />
                </div>
                <div>
                  <Label className="text-xs">ИНН</Label>
                  <Input value={formData.sender_inn} onChange={(e) => updateField('sender_inn', e.target.value)} placeholder="1234567890" />
                </div>
                <div>
                  <Label className="text-xs">Адрес</Label>
                  <Input value={formData.sender_address} onChange={(e) => updateField('sender_address', e.target.value)} placeholder="г. Москва, ул. Ленина, 1" />
                </div>
                <div>
                  <Label className="text-xs">Телефон</Label>
                  <Input value={formData.sender_phone} onChange={(e) => updateField('sender_phone', e.target.value)} placeholder="+7 900 000 00 00" />
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-muted/30">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Icon name="MapPin" size={18} />
                Получатель
              </h3>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Наименование / ФИО</Label>
                  <Input value={formData.receiver_name} onChange={(e) => updateField('receiver_name', e.target.value)} placeholder="ИП Петров" />
                </div>
                <div>
                  <Label className="text-xs">ИНН</Label>
                  <Input value={formData.receiver_inn} onChange={(e) => updateField('receiver_inn', e.target.value)} placeholder="0987654321" />
                </div>
                <div>
                  <Label className="text-xs">Адрес</Label>
                  <Input value={formData.receiver_address} onChange={(e) => updateField('receiver_address', e.target.value)} placeholder="г. Санкт-Петербург, пр. Невский, 10" />
                </div>
                <div>
                  <Label className="text-xs">Телефон</Label>
                  <Input value={formData.receiver_phone} onChange={(e) => updateField('receiver_phone', e.target.value)} placeholder="+7 900 111 11 11" />
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-4 bg-accent/5">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Icon name="Package" size={18} />
              Информация о грузе
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Описание груза</Label>
                <Textarea value={formData.cargo_description} onChange={(e) => updateField('cargo_description', e.target.value)} placeholder="Строительные материалы..." rows={3} />
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Вес (кг)</Label>
                  <Input type="number" value={formData.cargo_weight} onChange={(e) => updateField('cargo_weight', e.target.value)} placeholder="500" />
                </div>
                <div>
                  <Label className="text-xs">Объём (м³)</Label>
                  <Input type="number" step="0.1" value={formData.cargo_volume} onChange={(e) => updateField('cargo_volume', e.target.value)} placeholder="2.5" />
                </div>
                <div>
                  <Label className="text-xs">Объявленная стоимость (₽)</Label>
                  <Input type="number" value={formData.cargo_value} onChange={(e) => updateField('cargo_value', e.target.value)} placeholder="50000" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-primary/5">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Icon name="Truck" size={18} />
              Условия перевозки
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Тип транспорта</Label>
                <Select value={formData.transport_type} onValueChange={(val) => updateField('transport_type', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="van_small">Малый фургон (Газель)</SelectItem>
                    <SelectItem value="van_medium">Средний фургон</SelectItem>
                    <SelectItem value="truck_3t">Грузовик до 3т</SelectItem>
                    <SelectItem value="truck_5t">Грузовик до 5т</SelectItem>
                    <SelectItem value="truck_10t">Грузовик до 10т</SelectItem>
                    <SelectItem value="truck_20t">Грузовик до 20т</SelectItem>
                    <SelectItem value="truck_refrigerator">Рефрижератор</SelectItem>
                    <SelectItem value="truck_oversized">Негабарит</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Дата доставки</Label>
                <Input type="date" value={formData.delivery_date} onChange={(e) => updateField('delivery_date', e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Маршрут (откуда)</Label>
                <Input value={formData.route_from} onChange={(e) => updateField('route_from', e.target.value)} placeholder="г. Москва" />
              </div>
              <div>
                <Label className="text-xs">Маршрут (куда)</Label>
                <Input value={formData.route_to} onChange={(e) => updateField('route_to', e.target.value)} placeholder="г. Санкт-Петербург" />
              </div>
              <div>
                <Label className="text-xs">Стоимость перевозки (₽)</Label>
                <Input type="number" value={formData.price} onChange={(e) => updateField('price', e.target.value)} placeholder="15000" />
              </div>
              <div>
                <Label className="text-xs">Условия оплаты</Label>
                <Select value={formData.payment_terms} onValueChange={(val) => updateField('payment_terms', val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prepayment">Предоплата 100%</SelectItem>
                    <SelectItem value="prepayment_50">Предоплата 50%</SelectItem>
                    <SelectItem value="postpayment">Оплата после доставки</SelectItem>
                    <SelectItem value="cash">Наличными при получении</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <div>
            <Label>Дополнительная информация</Label>
            <Textarea value={formData.additional_info} onChange={(e) => updateField('additional_info', e.target.value)} placeholder="Особые условия, требования к упаковке..." rows={3} />
          </div>

          <div className="flex flex-col md:flex-row gap-3 pt-4">
            <Button onClick={handleSend} className="flex-1 gap-2">
              <Icon name="Send" size={18} />
              Отправить документ
            </Button>
            <Button onClick={handlePrint} variant="outline" className="flex-1 gap-2">
              <Icon name="Printer" size={18} />
              Распечатать документ
            </Button>
          </div>

          <Card className="p-3 bg-blue-500/10 border-blue-500/30">
            <div className="flex gap-2 text-sm text-blue-400">
              <Icon name="Info" size={16} className="flex-shrink-0 mt-0.5" />
              <p>
                Документы генерируются автоматически на основе введённых данных. 
                Перед отправкой проверьте правильность всех реквизитов.
              </p>
            </div>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}