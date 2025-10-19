import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_type: 'client' | 'carrier';
  text: string;
  timestamp: number;
  read: boolean;
  image?: string;
  imageType?: 'upload' | 'url';
}

interface OrderChatProps {
  orderId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserType: 'client' | 'carrier';
  recipientId: string;
  recipientName: string;
}

const OrderChat = ({ 
  orderId, 
  currentUserId, 
  currentUserName, 
  currentUserType,
  recipientId,
  recipientName 
}: OrderChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadMessages();
  }, [orderId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = () => {
    const storageKey = `chat_${orderId}`;
    const savedMessages = localStorage.getItem(storageKey);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  };

  const saveMessages = (msgs: Message[]) => {
    const storageKey = `chat_${orderId}`;
    localStorage.setItem(storageKey, JSON.stringify(msgs));
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Файл слишком большой',
        description: 'Максимальный размер изображения: 5 МБ',
        variant: 'destructive'
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setSelectedImage(base64String);
      setImagePreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() && !selectedImage) return;

    const message: Message = {
      id: `msg_${Date.now()}`,
      sender_id: currentUserId,
      sender_name: currentUserName,
      sender_type: currentUserType,
      text: newMessage.trim(),
      timestamp: Date.now(),
      read: false,
      image: selectedImage || undefined,
      imageType: selectedImage ? 'upload' : undefined
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    saveMessages(updatedMessages);
    setNewMessage('');
    setSelectedImage(null);
    setImagePreview(null);

    simulateRecipientTyping();
  };

  const simulateRecipientTyping = () => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const markAsRead = (messageId: string) => {
    const updatedMessages = messages.map(msg => 
      msg.id === messageId ? { ...msg, read: true } : msg
    );
    setMessages(updatedMessages);
    saveMessages(updatedMessages);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const unreadCount = messages.filter(
    msg => msg.sender_id !== currentUserId && !msg.read
  ).length;

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(recipientName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{recipientName}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {currentUserType === 'client' ? 'Водитель' : 'Клиент'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => window.location.href = `tel:${recipientId}`}>
              <Icon name="Phone" size={18} />
            </Button>
            {unreadCount > 0 && (
              <div className="bg-destructive text-destructive-foreground rounded-full px-2 py-1 text-xs font-semibold">
                {unreadCount}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Icon name="MessageSquare" size={48} className="mx-auto mb-2 opacity-20" />
                <p className="text-sm">Начните общение с {currentUserType === 'client' ? 'водителем' : 'клиентом'}</p>
              </div>
            )}

            {messages.map((msg) => {
              const isCurrentUser = msg.sender_id === currentUserId;
              
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className={isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-secondary'}>
                      {getInitials(msg.sender_name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={`flex flex-col max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`rounded-2xl overflow-hidden ${
                        isCurrentUser
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      {msg.image && (
                        <div className="relative">
                          <img 
                            src={msg.image} 
                            alt="Прикрепленное изображение" 
                            className="max-w-full max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(msg.image, '_blank')}
                          />
                        </div>
                      )}
                      {msg.text && (
                        <p className="text-sm whitespace-pre-wrap break-words px-4 py-2">{msg.text}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1 px-2">
                      <span className="text-xs text-muted-foreground">
                        {formatTime(msg.timestamp)}
                      </span>
                      {isCurrentUser && (
                        <Icon 
                          name={msg.read ? 'CheckCheck' : 'Check'} 
                          size={14} 
                          className={msg.read ? 'text-primary' : 'text-muted-foreground'}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-secondary">
                    {getInitials(recipientName)}
                  </AvatarFallback>
                </Avatar>
                <div className="bg-secondary rounded-2xl px-4 py-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          {imagePreview && (
            <div className="mb-3 relative inline-block">
              <img 
                src={imagePreview} 
                alt="Превью" 
                className="max-h-32 rounded-lg border-2 border-primary"
              />
              <Button
                size="icon"
                variant="destructive"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                onClick={() => {
                  setImagePreview(null);
                  setSelectedImage(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
                <Icon name="X" size={14} />
              </Button>
            </div>
          )}
          
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0"
            >
              <Icon name="Image" size={18} />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Введите сообщение..."
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim() && !selectedImage}
              size="icon"
              className="flex-shrink-0"
            >
              <Icon name="Send" size={18} />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 px-1">
            Enter — отправить, Shift+Enter — новая строка • Макс. размер фото: 5 МБ
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderChat;