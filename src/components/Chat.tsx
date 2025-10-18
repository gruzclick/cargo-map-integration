import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from 'react-i18next';

interface Message {
  id: string;
  sender_id: string;
  sender_type: 'client' | 'carrier';
  message: string;
  is_read: boolean;
  created_at: string;
}

interface ChatProps {
  orderId: string;
  currentUserId: string;
  currentUserType: 'client' | 'carrier';
}

export function Chat({ orderId, currentUserId, currentUserType }: ChatProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [orderId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/chat/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
        markAsRead();
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const markAsRead = async () => {
    try {
      await fetch(`/api/chat/${orderId}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId }),
      });
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/chat/${orderId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: currentUserId,
          sender_type: currentUserType,
          message: newMessage.trim(),
        }),
      });

      if (response.ok) {
        setNewMessage('');
        loadMessages();

        if ('Notification' in window && Notification.permission === 'granted') {
          const otherUserType = currentUserType === 'client' ? 'carrier' : 'client';
          new Notification(t('chat.newMessage'), {
            body: newMessage.trim().substring(0, 100),
            icon: '/icon-192.png',
          });
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col h-[500px] border rounded-lg">
      <div className="p-4 border-b bg-muted/50">
        <h3 className="font-semibold">{t('chat.title')}</h3>
        <p className="text-xs text-muted-foreground">{t('chat.subtitle')}</p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg) => {
            const isOwn = msg.sender_id === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    isOwn
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm break-words">{msg.message}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(msg.created_at).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={t('chat.placeholder')}
            disabled={isLoading}
          />
          <Button onClick={sendMessage} disabled={isLoading || !newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
