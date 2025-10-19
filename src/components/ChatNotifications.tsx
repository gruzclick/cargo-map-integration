import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_type: 'client' | 'carrier';
  text: string;
  timestamp: number;
  read: boolean;
}

interface ChatNotification {
  orderId: string;
  orderRoute: string;
  recipientName: string;
  lastMessage: string;
  unreadCount: number;
  timestamp: number;
}

interface ChatNotificationsProps {
  currentUserId: string;
  onChatClick?: (orderId: string) => void;
}

const ChatNotifications = ({ currentUserId, onChatClick }: ChatNotificationsProps) => {
  const [notifications, setNotifications] = useState<ChatNotification[]>([]);
  const [totalUnread, setTotalUnread] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 5000);
    return () => clearInterval(interval);
  }, [currentUserId]);

  const loadNotifications = () => {
    const allNotifications: ChatNotification[] = [];
    let unreadTotal = 0;

    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('chat_')) {
        const orderId = key.replace('chat_', '');
        const messagesJson = localStorage.getItem(key);
        
        if (messagesJson) {
          const messages: Message[] = JSON.parse(messagesJson);
          const unreadMessages = messages.filter(
            (msg) => msg.sender_id !== currentUserId && !msg.read
          );

          if (unreadMessages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            const orderInfo = getOrderInfo(orderId);
            
            allNotifications.push({
              orderId,
              orderRoute: orderInfo.route,
              recipientName: lastMessage.sender_name,
              lastMessage: lastMessage.text,
              unreadCount: unreadMessages.length,
              timestamp: lastMessage.timestamp,
            });

            unreadTotal += unreadMessages.length;
          }
        }
      }
    });

    allNotifications.sort((a, b) => b.timestamp - a.timestamp);
    setNotifications(allNotifications);
    setTotalUnread(unreadTotal);

    if (unreadTotal > 0 && totalUnread !== unreadTotal) {
      playNotificationSound();
    }
  };

  const getOrderInfo = (orderId: string): { route: string } => {
    const deliveriesJson = localStorage.getItem('user_deliveries');
    if (deliveriesJson) {
      const deliveries = JSON.parse(deliveriesJson);
      const order = deliveries.find((d: any) => d.id === orderId);
      if (order) {
        return { route: `${order.from} → ${order.to}` };
      }
    }
    return { route: 'Заказ' };
  };

  const playNotificationSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const markAsRead = (orderId: string) => {
    const key = `chat_${orderId}`;
    const messagesJson = localStorage.getItem(key);
    
    if (messagesJson) {
      const messages: Message[] = JSON.parse(messagesJson);
      const updatedMessages = messages.map((msg) =>
        msg.sender_id !== currentUserId ? { ...msg, read: true } : msg
      );
      localStorage.setItem(key, JSON.stringify(updatedMessages));
      loadNotifications();
    }

    if (onChatClick) {
      onChatClick(orderId);
    }
    setIsOpen(false);
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Только что';
    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    return `${days} д назад`;
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Icon name="MessageSquare" size={20} />
          {totalUnread > 0 && (
            <>
              <Badge 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-destructive-foreground text-xs"
              >
                {totalUnread > 9 ? '9+' : totalUnread}
              </Badge>
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-destructive rounded-full animate-ping opacity-75" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="p-4 border-b">
          <h4 className="font-semibold">Сообщения</h4>
          {totalUnread > 0 && (
            <p className="text-sm text-muted-foreground">
              {totalUnread} {totalUnread === 1 ? 'новое сообщение' : 'новых сообщений'}
            </p>
          )}
        </div>
        
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Icon name="MessageSquare" size={40} className="mx-auto mb-2 text-muted-foreground opacity-20" />
            <p className="text-sm text-muted-foreground">Нет новых сообщений</p>
          </div>
        ) : (
          <ScrollArea className="max-h-96">
            {notifications.map((notif) => (
              <DropdownMenuItem
                key={notif.orderId}
                className="p-4 cursor-pointer focus:bg-accent"
                onClick={() => markAsRead(notif.orderId)}
              >
                <div className="flex gap-3 w-full">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0 text-primary-foreground font-semibold">
                    {notif.recipientName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-semibold text-sm truncate">{notif.recipientName}</p>
                      {notif.unreadCount > 0 && (
                        <Badge className="h-5 px-1.5 text-xs bg-destructive text-destructive-foreground">
                          {notif.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{notif.orderRoute}</p>
                    <p className="text-sm text-foreground/80 truncate">{truncateText(notif.lastMessage, 50)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatTime(notif.timestamp)}</p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ChatNotifications;
