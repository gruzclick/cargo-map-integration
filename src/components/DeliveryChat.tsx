import { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import Icon from './ui/icon';
import { useToast } from './ui/use-toast';

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_type: 'client' | 'carrier';
  message: string;
  timestamp: string;
  blocked?: boolean;
}

interface DeliveryChatProps {
  deliveryId: string;
  currentUserId: string;
  currentUserType: 'client' | 'carrier';
  onClose: () => void;
}

export default function DeliveryChat({ deliveryId, currentUserId, currentUserType, onClose }: DeliveryChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [deliveryId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`https://functions.poehali.dev/b388f085-faa7-4aab-88a5-b45708b116eb?delivery_id=${deliveryId}&action=get_messages`);
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const filterContactInfo = (text: string): { filtered: string; blocked: boolean } => {
    let filtered = text;
    let blocked = false;

    const phonePatterns = [
      /\+?\d[\d\s\-\(\)]{7,}/g,
      /\b\d{3}[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}\b/g,
      /\b\d{3}[\s\-]?\d{2}[\s\-]?\d{2}\b/g,
      /восемь[\s\-]?\d/gi,
      /семь[\s\-]?\d/gi,
    ];

    phonePatterns.forEach(pattern => {
      if (pattern.test(filtered)) {
        filtered = filtered.replace(pattern, '[ЗАБЛОКИРОВАНО]');
        blocked = true;
      }
    });

    const messengerPatterns = [
      /whatsapp/gi,
      /telegram/gi,
      /viber/gi,
      /вотсап/gi,
      /вацап/gi,
      /телеграм/gi,
      /вайбер/gi,
      /@[a-zA-Z0-9_]+/g,
      /t\.me/gi,
      /wa\.me/gi,
    ];

    messengerPatterns.forEach(pattern => {
      if (pattern.test(filtered)) {
        filtered = filtered.replace(pattern, '[ЗАБЛОКИРОВАНО]');
        blocked = true;
      }
    });

    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    if (emailPattern.test(filtered)) {
      filtered = filtered.replace(emailPattern, '[ЗАБЛОКИРОВАНО]');
      blocked = true;
    }

    const numberWords = /ноль|один|два|три|четыре|пять|шесть|семь|восемь|девять/gi;
    const consecutiveNumbers = (filtered.match(numberWords) || []).length;
    if (consecutiveNumbers >= 5) {
      blocked = true;
      filtered = '[ЗАБЛОКИРОВАНО - попытка передачи контактов]';
    }

    return { filtered, blocked };
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const { filtered, blocked } = filterContactInfo(newMessage);

    if (blocked) {
      toast({
        title: 'Сообщение заблокировано',
        description: 'Запрещена передача номеров телефонов, ссылок на мессенджеры и контактов',
        variant: 'destructive'
      });
      return;
    }

    setSending(true);
    try {
      const response = await fetch('https://functions.poehali.dev/b388f085-faa7-4aab-88a5-b45708b116eb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_message',
          delivery_id: deliveryId,
          sender_id: currentUserId,
          sender_type: currentUserType,
          message: filtered
        })
      });

      if (response.ok) {
        setNewMessage('');
        fetchMessages();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить сообщение',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="flex flex-col h-[600px] border-0 shadow-2xl">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Icon name="MessageSquare" size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Чат по заказу</h3>
            <p className="text-xs text-muted-foreground">Защищённая переписка</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <Icon name="X" size={20} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-3">
              <Icon name="MessageSquare" size={32} className="text-primary opacity-50" />
            </div>
            <p className="text-muted-foreground">Начните переписку</p>
            <p className="text-xs text-muted-foreground mt-1">Все сообщения защищены</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === currentUserId;
            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                  {!isOwn && (
                    <p className="text-xs text-muted-foreground mb-1 ml-3">
                      {msg.sender_name} • {msg.sender_type === 'client' ? 'Клиент' : 'Перевозчик'}
                    </p>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      isOwn
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    } ${msg.blocked ? 'border-2 border-red-500' : ''}`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                    <p className={`text-xs mt-1 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-border">
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-2 mb-3 flex gap-2">
          <Icon name="Shield" size={16} className="text-orange-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-orange-400">
            Запрещена передача номеров телефонов, ссылок на мессенджеры и email. 
            Используйте только встроенный чат.
          </p>
        </div>

        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Введите сообщение..."
            disabled={sending}
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={sending || !newMessage.trim()} size="icon">
            {sending ? (
              <Icon name="Loader" size={20} className="animate-spin" />
            ) : (
              <Icon name="Send" size={20} />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
