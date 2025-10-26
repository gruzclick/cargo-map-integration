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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

interface News {
  id: string;
  title: string;
  content: string;
  image?: string;
  published: boolean;
  date: string;
}

export default function AdminContent() {
  const { toast } = useToast();
  const [faqs, setFaqs] = useState<FAQ[]>([
    {
      id: '1',
      question: 'Как отменить заказ?',
      answer: 'Вы можете отменить заказ в разделе "Мои заказы" до момента подтверждения водителем. После подтверждения отмена возможна только через поддержку.',
      category: 'Заказы',
      order: 1
    },
    {
      id: '2',
      question: 'Сколько стоит доставка?',
      answer: 'Стоимость доставки рассчитывается автоматически на основе расстояния, веса груза и типа транспорта. Вы видите точную цену до подтверждения заказа.',
      category: 'Цены',
      order: 2
    },
  ]);
  const [news, setNews] = useState<News[]>([
    {
      id: '1',
      title: 'Запуск новой акции: скидка 20%',
      content: 'С 1 по 15 февраля действует специальная акция - скидка 20% на все доставки для новых клиентов!',
      published: true,
      date: '2025-01-20'
    },
  ]);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', category: 'Общие' });
  const [newNews, setNewNews] = useState({ title: '', content: '' });
  const [editingFaq, setEditingFaq] = useState<string | null>(null);
  const [editingNews, setEditingNews] = useState<string | null>(null);

  const handleAddFaq = () => {
    if (!newFaq.question || !newFaq.answer) {
      toast({
        title: 'Ошибка',
        description: 'Заполните вопрос и ответ',
        variant: 'destructive'
      });
      return;
    }

    const faq: FAQ = {
      id: Date.now().toString(),
      question: newFaq.question,
      answer: newFaq.answer,
      category: newFaq.category,
      order: faqs.length + 1
    };

    setFaqs([...faqs, faq]);
    setNewFaq({ question: '', answer: '', category: 'Общие' });
    toast({
      title: 'FAQ добавлен',
      description: 'Вопрос успешно добавлен в базу знаний'
    });
  };

  const handleDeleteFaq = (id: string) => {
    setFaqs(faqs.filter(f => f.id !== id));
    toast({
      title: 'FAQ удален',
      description: 'Вопрос удален из базы знаний'
    });
  };

  const handleAddNews = () => {
    if (!newNews.title || !newNews.content) {
      toast({
        title: 'Ошибка',
        description: 'Заполните заголовок и содержание',
        variant: 'destructive'
      });
      return;
    }

    const newsItem: News = {
      id: Date.now().toString(),
      title: newNews.title,
      content: newNews.content,
      published: false,
      date: new Date().toISOString().split('T')[0]
    };

    setNews([newsItem, ...news]);
    setNewNews({ title: '', content: '' });
    toast({
      title: 'Новость создана',
      description: 'Новость добавлена (не опубликована)'
    });
  };

  const handleTogglePublish = (id: string) => {
    setNews(news.map(n => n.id === id ? { ...n, published: !n.published } : n));
    const item = news.find(n => n.id === id);
    toast({
      title: item?.published ? 'Новость снята с публикации' : 'Новость опубликована',
      description: item?.published ? 'Новость больше не отображается пользователям' : 'Новость теперь видна всем пользователям'
    });
  };

  const handleDeleteNews = (id: string) => {
    setNews(news.filter(n => n.id !== id));
    toast({
      title: 'Новость удалена',
      description: 'Новость удалена из системы'
    });
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
              <Icon name="FileText" size={32} />
              Управление контентом
            </h1>
            <p className="text-muted-foreground">Новости, акции, FAQ и документы</p>
          </div>
        </div>

        <Tabs defaultValue="news" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="news">Новости и акции</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="docs">Документы</TabsTrigger>
          </TabsList>

          <TabsContent value="news" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Создать новость или акцию</CardTitle>
                <CardDescription>Новость появится на главной странице после публикации</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="news-title">Заголовок</Label>
                  <Input
                    id="news-title"
                    placeholder="Новая акция: скидка 20%"
                    value={newNews.title}
                    onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="news-content">Содержание</Label>
                  <Textarea
                    id="news-content"
                    placeholder="Подробное описание акции или новости..."
                    rows={6}
                    value={newNews.content}
                    onChange={(e) => setNewNews({ ...newNews, content: e.target.value })}
                  />
                </div>

                <Button onClick={handleAddNews} className="w-full">
                  <Icon name="Plus" size={20} className="mr-2" />
                  Создать новость
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Список новостей ({news.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {news.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{item.title}</h3>
                            {item.published ? (
                              <Badge>Опубликовано</Badge>
                            ) : (
                              <Badge variant="secondary">Черновик</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{item.content}</p>
                          <p className="text-xs text-muted-foreground">Дата: {item.date}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant={item.published ? "secondary" : "default"}
                            size="sm"
                            onClick={() => handleTogglePublish(item.id)}
                          >
                            <Icon name={item.published ? "EyeOff" : "Eye"} size={16} />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteNews(item.id)}
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faq" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Добавить вопрос в FAQ</CardTitle>
                <CardDescription>FAQ помогает клиентам быстро найти ответы на частые вопросы</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="faq-category">Категория</Label>
                  <select
                    id="faq-category"
                    className="w-full p-2 border rounded-md bg-background"
                    value={newFaq.category}
                    onChange={(e) => setNewFaq({ ...newFaq, category: e.target.value })}
                  >
                    <option value="Общие">Общие</option>
                    <option value="Заказы">Заказы</option>
                    <option value="Цены">Цены и оплата</option>
                    <option value="Доставка">Доставка</option>
                    <option value="Аккаунт">Аккаунт</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="faq-question">Вопрос</Label>
                  <Input
                    id="faq-question"
                    placeholder="Как отменить заказ?"
                    value={newFaq.question}
                    onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="faq-answer">Ответ</Label>
                  <Textarea
                    id="faq-answer"
                    placeholder="Подробный ответ на вопрос..."
                    rows={4}
                    value={newFaq.answer}
                    onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                  />
                </div>

                <Button onClick={handleAddFaq} className="w-full">
                  <Icon name="Plus" size={20} className="mr-2" />
                  Добавить в FAQ
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>База знаний ({faqs.length} вопросов)</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Категория</TableHead>
                      <TableHead>Вопрос</TableHead>
                      <TableHead>Ответ</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {faqs.map((faq) => (
                      <TableRow key={faq.id}>
                        <TableCell>
                          <Badge variant="secondary">{faq.category}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{faq.question}</TableCell>
                        <TableCell className="max-w-md truncate">{faq.answer}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button variant="ghost" size="sm">
                              <Icon name="Edit" size={16} />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteFaq(faq.id)}>
                              <Icon name="Trash2" size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="docs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Юридические документы</CardTitle>
                <CardDescription>Редактирование отображается на сайте в разделах /privacy и /terms</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2 mb-4">
                  <Button variant="outline" onClick={() => window.open('/privacy', '_blank')}>
                    <Icon name="ExternalLink" size={16} className="mr-2" />
                    Открыть политику на сайте
                  </Button>
                  <Button variant="outline" onClick={() => window.open('/terms', '_blank')}>
                    <Icon name="ExternalLink" size={16} className="mr-2" />
                    Открыть соглашение на сайте
                  </Button>
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-sm">
                    <Icon name="Info" size={16} className="inline mr-2 text-blue-500" />
                    Для редактирования юридических документов измените файлы:
                    <code className="block mt-2 p-2 bg-muted rounded">src/pages/PrivacyPolicy.tsx</code>
                    <code className="block mt-1 p-2 bg-muted rounded">src/pages/TermsOfService.tsx</code>
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}