import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from '@/components/ui/alert';

interface NotificationHistory {
  id: string;
  type: 'telegram';
  title: string;
  recipients: number;
  sent: number;
  status: 'sent' | 'pending' | 'failed';
  date: string;
}

const historyData: NotificationHistory[] = [
  {
    id: '1',
    type: 'telegram',
    title: 'Новая акция: скидка 20%',
    recipients: 1250,
    sent: 1248,
    status: 'sent',
    date: '2025-01-15 14:30'
  },
  {
    id: '2',
    type: 'telegram',
    title: 'Обновление системы',
    recipients: 850,
    sent: 850,
    status: 'sent',
    date: '2025-01-13 18:45'
  },
];

const templates = [
  { id: '1', name: 'Приветствие новому клиенту' },
  { id: '2', name: 'Напоминание о заказе' },
  { id: '3', name: 'Акция выходного дня' },
  { id: '4', name: 'Отзыв после доставки' },
];

export default function AdminNotifications() {
  const { toast } = useToast();
  const [pushData, setPushData] = useState({
    title: '',
    body: '',
    audience: 'all',
    link: ''
  });
  
  const [telegramData, setTelegramData] = useState({
    message: '',
    audience: 'all',
    imageUrl: ''
  });

  const handleSendTelegram = async () => {
    if (!telegramData.message) {
      toast({
        title: 'Ошибка',
        description: 'Введите текст сообщения',
        variant: 'destructive'
      });
      return;
    }

    try {
      const funcUrls = await import('../../backend/func2url.json');
      const response = await fetch(funcUrls['telegram-broadcast'], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(telegramData)
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: 'Telegram-рассылка отправлена',
          description: `Отправлено: ${result.sent}, Не доставлено: ${result.failed}, Всего: ${result.total}`,
        });
        setTelegramData({ message: '', audience: 'all', imageUrl: '' });
      } else {
        throw new Error('Ошибка отправки');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить рассылку',
        variant: 'destructive'
      });
    }
  };

  const handleSendPush = async () => {
    if (!pushData.title || !pushData.body) {
      toast({
        title: 'Ошибка',
        description: 'Заполните заголовок и текст',
        variant: 'destructive'
      });
      return;
    }

    try {
      toast({
        title: 'Push-уведомление отправлено',
        description: `Отправлено ${pushData.audience === 'all' ? 'всем пользователям' : 'выбранной группе'}`,
      });
      setPushData({ title: '', body: '', audience: 'all', link: '' });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить уведомление',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive', text: string }> = {
      sent: { variant: 'default', text: 'Отправлено' },
      pending: { variant: 'secondary', text: 'В очереди' },
      failed: { variant: 'destructive', text: 'Ошибка' }
    };
    const config = variants[status];
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => window.history.back()}>
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Icon name="Send" size={32} />
              Telegram рассылка
            </h1>
            <p className="text-muted-foreground">Массовая рассылка сообщений через Telegram бота</p>
          </div>
        </div>

        <Tabs defaultValue="push" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="push">Push-уведомления</TabsTrigger>
            <TabsTrigger value="telegram">Telegram</TabsTrigger>
            <TabsTrigger value="history">История</TabsTrigger>
          </TabsList>

          <TabsContent value="push" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Отправить Push-уведомление</CardTitle>
                <CardDescription>Мгновенное уведомление на устройства пользователей</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="push-title">Заголовок</Label>
                  <Input
                    id="push-title"
                    placeholder="Новая акция!"
                    value={pushData.title}
                    onChange={(e) => setPushData({ ...pushData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="push-body">Текст сообщения</Label>
                  <Textarea
                    id="push-body"
                    placeholder="Скидка 20% на все доставки в эти выходные!"
                    rows={4}
                    value={pushData.body}
                    onChange={(e) => setPushData({ ...pushData, body: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="push-link">Ссылка при клике (необязательно)</Label>
                  <Input
                    id="push-link"
                    placeholder="https://example.com/promo"
                    value={pushData.link}
                    onChange={(e) => setPushData({ ...pushData, link: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="push-audience">Кому отправить</Label>
                  <Select value={pushData.audience} onValueChange={(val) => setPushData({ ...pushData, audience: val })}>
                    <SelectTrigger id="push-audience">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Всем пользователям (2,453)</SelectItem>
                      <SelectItem value="cargo">Только отправителям груза (1,678)</SelectItem>
                      <SelectItem value="vehicle">Только водителям (775)</SelectItem>
                      <SelectItem value="active">Активным за последние 7 дней (1,234)</SelectItem>
                      <SelectItem value="inactive">Неактивным 30+ дней (456)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleSendPush} className="w-full" size="lg">
                  <Icon name="Bell" size={20} className="mr-2" />
                  Отправить Push-уведомление
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Готовые шаблоны</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => {
                      setPushData({
                        title: 'Не забудьте про заказ!',
                        body: 'У вас есть активный заказ. Отследите его прямо сейчас.',
                        audience: 'all',
                        link: ''
                      });
                      toast({ title: 'Шаблон загружен' });
                    }}
                  >
                    <Icon name="FileText" size={16} className="mr-2" />
                    Напоминание
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => {
                      setPushData({
                        title: 'Как прошла доставка?',
                        body: 'Оцените качество обслуживания и получите бонус!',
                        audience: 'all',
                        link: ''
                      });
                      toast({ title: 'Шаблон загружен' });
                    }}
                  >
                    <Icon name="FileText" size={16} className="mr-2" />
                    Отзыв
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="telegram" className="space-y-4">
            <Alert>
              <Icon name="Info" size={16} className="mt-0.5" />
              <AlertDescription>
                Рассылка отправляется через Telegram бота всем пользователям, которые подключили Telegram.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Отправить Telegram-рассылку</CardTitle>
                <CardDescription>Сообщение будет отправлено через бота @GruzKlikBot</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="telegram-message">Текст сообщения</Label>
                  <Textarea
                    id="telegram-message"
                    placeholder="🎉 Новая акция! Скидка 20% на все доставки в эти выходные!"
                    rows={6}
                    value={telegramData.message}
                    onChange={(e) => setTelegramData({ ...telegramData, message: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Поддерживаются эмодзи и форматирование Markdown
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telegram-image">URL изображения (необязательно)</Label>
                  <Input
                    id="telegram-image"
                    placeholder="https://example.com/image.jpg"
                    value={telegramData.imageUrl}
                    onChange={(e) => setTelegramData({ ...telegramData, imageUrl: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telegram-audience">Кому отправить</Label>
                  <Select value={telegramData.audience} onValueChange={(val) => setTelegramData({ ...telegramData, audience: val })}>
                    <SelectTrigger id="telegram-audience">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Всем пользователям (2,453)</SelectItem>
                      <SelectItem value="cargo">Только отправителям груза (1,678)</SelectItem>
                      <SelectItem value="vehicle">Только водителям (775)</SelectItem>
                      <SelectItem value="active">Активным за последние 7 дней (1,234)</SelectItem>
                      <SelectItem value="inactive">Неактивным 30+ дней (456)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleSendTelegram} className="w-full" size="lg">
                  <Icon name="Send" size={20} className="mr-2" />
                  Отправить в Telegram
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Готовые шаблоны</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {templates.map(template => (
                    <Button
                      key={template.id}
                      variant="outline"
                      className="justify-start"
                      onClick={() => {
                        if (template.id === '1') {
                          setTelegramData({
                            message: '👋 Добро пожаловать в ГрузКлик!\n\nМы рады видеть вас в нашей транспортной бирже. Найдите грузы или водителей рядом с вами!',
                            audience: 'all',
                            imageUrl: ''
                          });
                        } else if (template.id === '2') {
                          setTelegramData({
                            message: '📦 Не забудьте про заказ!\n\nУ вас есть активный заказ. Отследите его прямо сейчас в приложении.',
                            audience: 'all',
                            imageUrl: ''
                          });
                        } else if (template.id === '3') {
                          setTelegramData({
                            message: '🎉 Акция выходного дня!\n\nСкидка 20% на все доставки в субботу и воскресенье. Успейте воспользоваться!',
                            audience: 'all',
                            imageUrl: ''
                          });
                        } else if (template.id === '4') {
                          setTelegramData({
                            message: '⭐️ Как прошла доставка?\n\nОцените качество обслуживания и получите бонус 100 рублей на следующий заказ!',
                            audience: 'all',
                            imageUrl: ''
                          });
                        }
                        toast({ title: 'Шаблон загружен' });
                      }}
                    >
                      <Icon name="FileText" size={16} className="mr-2" />
                      {template.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>История отправленных рассылок</CardTitle>
                <CardDescription>Последние 50 рассылок</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Дата</TableHead>
                      <TableHead>Тип</TableHead>
                      <TableHead>Сообщение</TableHead>
                      <TableHead>Получателей</TableHead>
                      <TableHead>Отправлено</TableHead>
                      <TableHead>Статус</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-sm">{item.date}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="flex items-center gap-1 w-fit">
                            <Icon name="MessageCircle" size={12} />
                            Telegram
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{item.title}</TableCell>
                        <TableCell>{item.recipients}</TableCell>
                        <TableCell>{item.sent}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}