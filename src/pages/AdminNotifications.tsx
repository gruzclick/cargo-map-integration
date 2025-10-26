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

interface NotificationHistory {
  id: string;
  type: 'push' | 'email';
  title: string;
  recipients: number;
  sent: number;
  status: 'sent' | 'pending' | 'failed';
  date: string;
}

const historyData: NotificationHistory[] = [
  {
    id: '1',
    type: 'push',
    title: 'Новая акция: скидка 20%',
    recipients: 1250,
    sent: 1248,
    status: 'sent',
    date: '2025-01-15 14:30'
  },
  {
    id: '2',
    type: 'email',
    title: 'Приглашение на вебинар',
    recipients: 3400,
    sent: 3385,
    status: 'sent',
    date: '2025-01-14 10:00'
  },
  {
    id: '3',
    type: 'push',
    title: 'Обновление системы',
    recipients: 850,
    sent: 850,
    status: 'sent',
    date: '2025-01-13 18:45'
  },
];

const templates = [
  { id: '1', name: 'Приветствие новому клиенту', type: 'email' },
  { id: '2', name: 'Напоминание о заказе', type: 'push' },
  { id: '3', name: 'Акция выходного дня', type: 'email' },
  { id: '4', name: 'Отзыв после доставки', type: 'push' },
];

export default function AdminNotifications() {
  const { toast } = useToast();
  const [pushData, setPushData] = useState({
    title: '',
    body: '',
    audience: 'all',
    link: ''
  });
  const [emailData, setEmailData] = useState({
    subject: '',
    body: '',
    audience: 'all',
    template: ''
  });

  const handleSendPush = () => {
    if (!pushData.title || !pushData.body) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Push-уведомление отправлено',
      description: `Отправлено ${pushData.audience === 'all' ? 'всем пользователям' : 'выбранной группе'}`,
    });

    setPushData({ title: '', body: '', audience: 'all', link: '' });
  };

  const handleSendEmail = () => {
    if (!emailData.subject || !emailData.body) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Email-рассылка запущена',
      description: `Письма отправляются ${emailData.audience === 'all' ? 'всем пользователям' : 'выбранной группе'}`,
    });

    setEmailData({ subject: '', body: '', audience: 'all', template: '' });
  };

  const handleLoadTemplate = (templateId: string) => {
    const templates: Record<string, { subject: string; body: string }> = {
      '1': {
        subject: 'Добро пожаловать в нашу платформу!',
        body: 'Здравствуйте!\n\nМы рады приветствовать вас на нашей платформе доставки. Ваш аккаунт успешно создан.\n\nС уважением,\nКоманда поддержки'
      },
      '3': {
        subject: 'Специальное предложение выходного дня!',
        body: 'Только в эти выходные - скидка 20% на все доставки!\n\nУспейте воспользоваться предложением до понедельника.'
      }
    };

    const template = templates[templateId];
    if (template) {
      setEmailData({ ...emailData, subject: template.subject, body: template.body });
      toast({
        title: 'Шаблон загружен',
        description: 'Вы можете отредактировать текст перед отправкой',
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
              <Icon name="Bell" size={32} />
              Уведомления
            </h1>
            <p className="text-muted-foreground">Массовая рассылка push и email сообщений</p>
          </div>
        </div>

        <Tabs defaultValue="push" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="push">Push-уведомления</TabsTrigger>
            <TabsTrigger value="email">Email-рассылка</TabsTrigger>
            <TabsTrigger value="history">История</TabsTrigger>
          </TabsList>

          <TabsContent value="push" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Отправить push-уведомление</CardTitle>
                <CardDescription>Мгновенное уведомление на телефоны пользователей</CardDescription>
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
                      <SelectItem value="clients">Только клиентам (1,678)</SelectItem>
                      <SelectItem value="carriers">Только перевозчикам (775)</SelectItem>
                      <SelectItem value="active">Активным за последние 7 дней (1,234)</SelectItem>
                      <SelectItem value="inactive">Неактивным 30+ дней (456)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleSendPush} className="w-full" size="lg">
                  <Icon name="Send" size={20} className="mr-2" />
                  Отправить push-уведомление
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Готовые шаблоны</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {templates.filter(t => t.type === 'push').map(template => (
                    <Button
                      key={template.id}
                      variant="outline"
                      className="justify-start"
                      onClick={() => {
                        if (template.id === '2') {
                          setPushData({
                            title: 'Не забудьте про заказ!',
                            body: 'У вас есть активный заказ. Отследите его прямо сейчас.',
                            audience: 'all',
                            link: ''
                          });
                        } else if (template.id === '4') {
                          setPushData({
                            title: 'Как прошла доставка?',
                            body: 'Оцените качество обслуживания и получите бонус!',
                            audience: 'all',
                            link: ''
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

          <TabsContent value="email" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Отправить email-рассылку</CardTitle>
                <CardDescription>Письмо на электронную почту пользователей</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-subject">Тема письма</Label>
                  <Input
                    id="email-subject"
                    placeholder="Специальное предложение для вас!"
                    value={emailData.subject}
                    onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-body">Текст письма</Label>
                  <Textarea
                    id="email-body"
                    placeholder="Здравствуйте!&#10;&#10;Мы рады предложить вам..."
                    rows={8}
                    value={emailData.body}
                    onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-audience">Кому отправить</Label>
                  <Select value={emailData.audience} onValueChange={(val) => setEmailData({ ...emailData, audience: val })}>
                    <SelectTrigger id="email-audience">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Всем пользователям (2,453)</SelectItem>
                      <SelectItem value="clients">Только клиентам (1,678)</SelectItem>
                      <SelectItem value="carriers">Только перевозчикам (775)</SelectItem>
                      <SelectItem value="verified">С подтвержденной почтой (2,156)</SelectItem>
                      <SelectItem value="subscribers">Подписанным на новости (1,892)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleSendEmail} className="w-full" size="lg">
                  <Icon name="Mail" size={20} className="mr-2" />
                  Отправить email-рассылку
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Готовые шаблоны</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {templates.filter(t => t.type === 'email').map(template => (
                    <Button
                      key={template.id}
                      variant="outline"
                      className="justify-start"
                      onClick={() => handleLoadTemplate(template.id)}
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
                <CardTitle>История отправленных уведомлений</CardTitle>
                <CardDescription>Все отправленные push и email за последние 30 дней</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Тип</TableHead>
                      <TableHead>Название</TableHead>
                      <TableHead>Получатели</TableHead>
                      <TableHead>Отправлено</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Дата</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Badge variant={item.type === 'push' ? 'default' : 'secondary'}>
                            {item.type === 'push' ? (
                              <><Icon name="Smartphone" size={12} className="mr-1" /> Push</>
                            ) : (
                              <><Icon name="Mail" size={12} className="mr-1" /> Email</>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell>{item.recipients}</TableCell>
                        <TableCell>{item.sent}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell className="text-muted-foreground">{item.date}</TableCell>
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
