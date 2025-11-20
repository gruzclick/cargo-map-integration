import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Ticket {
  id: string;
  number: number;
  userId: string;
  userName: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'closed';
  priority: 'low' | 'medium' | 'high';
  category: string;
  created: string;
  updated: string;
  assignedTo?: string;
  replies: TicketReply[];
}

interface TicketReply {
  id: string;
  author: string;
  isAdmin: boolean;
  message: string;
  timestamp: string;
}

const ticketsData: Ticket[] = [];

export default function AdminSupport() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>(ticketsData);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'closed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive', text: string }> = {
      open: { variant: 'destructive', text: 'Открыт' },
      in_progress: { variant: 'secondary', text: 'В работе' },
      closed: { variant: 'default', text: 'Закрыт' }
    };
    const config = variants[status];
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-blue-500',
      medium: 'bg-orange-500',
      high: 'bg-red-500'
    };
    const labels: Record<string, string> = {
      low: 'Низкий',
      medium: 'Средний',
      high: 'Высокий'
    };
    return (
      <div className={`${colors[priority]} text-white text-xs px-2 py-1 rounded-full w-fit`}>
        {labels[priority]}
      </div>
    );
  };

  const handleSendReply = () => {
    if (!selectedTicket || !replyText.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите текст ответа',
        variant: 'destructive'
      });
      return;
    }

    const newReply: TicketReply = {
      id: Date.now().toString(),
      author: 'Вы (Администратор)',
      isAdmin: true,
      message: replyText,
      timestamp: new Date().toLocaleString('ru-RU')
    };

    setTickets(tickets.map(t => 
      t.id === selectedTicket.id 
        ? { ...t, replies: [...t.replies, newReply], updated: new Date().toLocaleString('ru-RU') }
        : t
    ));

    setSelectedTicket({
      ...selectedTicket,
      replies: [...selectedTicket.replies, newReply]
    });

    setReplyText('');
    toast({
      title: 'Ответ отправлен',
      description: 'Пользователь получит уведомление'
    });
  };

  const handleChangeStatus = (ticketId: string, newStatus: 'open' | 'in_progress' | 'closed') => {
    setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status: newStatus });
    }
    toast({
      title: 'Статус изменен',
      description: `Тикет переведен в статус "${newStatus}"`
    });
  };

  const handleDeleteTicket = (ticketId: string) => {
    if (!confirm('Вы уверены что хотите удалить этот тикет?')) return;
    
    setTickets(tickets.filter(t => t.id !== ticketId));
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(null);
    }
    toast({
      title: 'Тикет удален',
      description: 'Запрос пользователя удален из системы'
    });
  };

  const filteredTickets = tickets.filter(t => {
    const matchesStatus = filter === 'all' || t.status === filter;
    const matchesSearch = t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.number.toString().includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    closed: tickets.filter(t => t.status === 'closed').length
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
              <Icon name="Headphones" size={32} />
              Служба поддержки
            </h1>
            <p className="text-muted-foreground">Система тикетов и обращения пользователей</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Всего тикетов</CardDescription>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Открытых</CardDescription>
              <CardTitle className="text-3xl text-red-600">{stats.open}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>В работе</CardDescription>
              <CardTitle className="text-3xl text-orange-600">{stats.inProgress}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Закрытых</CardDescription>
              <CardTitle className="text-3xl text-green-600">{stats.closed}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Список тикетов</CardTitle>
                <CardDescription>Все обращения пользователей</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Поиск по номеру, теме, имени..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                
                <Select value={filter} onValueChange={(val: any) => setFilter(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все тикеты</SelectItem>
                    <SelectItem value="open">Открытые</SelectItem>
                    <SelectItem value="in_progress">В работе</SelectItem>
                    <SelectItem value="closed">Закрытые</SelectItem>
                  </SelectContent>
                </Select>

                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {filteredTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedTicket?.id === ticket.id ? 'bg-accent' : 'hover:bg-accent/50'
                      }`}
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-muted-foreground">#{ticket.number}</span>
                          {getStatusBadge(ticket.status)}
                        </div>
                        {getPriorityBadge(ticket.priority)}
                      </div>
                      <p className="font-medium text-sm mb-1">{ticket.subject}</p>
                      <p className="text-xs text-muted-foreground">{ticket.userName}</p>
                      <p className="text-xs text-muted-foreground mt-1">{ticket.created}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            {selectedTicket ? (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        #{selectedTicket.number}: {selectedTicket.subject}
                      </CardTitle>
                      <CardDescription>
                        От: {selectedTicket.userName} • {selectedTicket.created}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {getStatusBadge(selectedTicket.status)}
                      {getPriorityBadge(selectedTicket.priority)}
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteTicket(selectedTicket.id)}
                      >
                        <Icon name="Trash2" size={16} className="mr-1" />
                        Удалить
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name="User" size={16} />
                      <span className="font-medium">{selectedTicket.userName}</span>
                      <span className="text-sm text-muted-foreground">{selectedTicket.created}</span>
                    </div>
                    <p>{selectedTicket.message}</p>
                  </div>

                  {selectedTicket.replies.length > 0 && (
                    <div className="space-y-3">
                      <Label>Переписка</Label>
                      {selectedTicket.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className={`p-4 rounded-lg ${
                            reply.isAdmin ? 'bg-blue-500/10 ml-8' : 'bg-muted mr-8'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Icon name={reply.isAdmin ? "ShieldCheck" : "User"} size={16} />
                            <span className="font-medium">{reply.author}</span>
                            <span className="text-sm text-muted-foreground">{reply.timestamp}</span>
                          </div>
                          <p>{reply.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedTicket.status !== 'closed' && (
                    <div className="space-y-3 pt-4 border-t">
                      <Label htmlFor="reply">Ваш ответ</Label>
                      <Textarea
                        id="reply"
                        placeholder="Введите ответ пользователю..."
                        rows={4}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button onClick={handleSendReply}>
                          <Icon name="Send" size={16} className="mr-2" />
                          Отправить ответ
                        </Button>
                        <Select
                          value={selectedTicket.status}
                          onValueChange={(val) => handleChangeStatus(selectedTicket.id, val as any)}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Открыт</SelectItem>
                            <SelectItem value="in_progress">В работе</SelectItem>
                            <SelectItem value="closed">Закрыть</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {selectedTicket.status === 'closed' && (
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Icon name="CheckCircle" size={20} className="text-green-600" />
                        <span className="font-medium text-green-600">Тикет закрыт</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Этот тикет был закрыт. Чтобы ответить, переведите его в статус "Открыт" или "В работе".
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-96">
                  <div className="text-center text-muted-foreground">
                    <Icon name="MessageSquare" size={64} className="mx-auto mb-4 opacity-20" />
                    <p>Выберите тикет для просмотра</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}