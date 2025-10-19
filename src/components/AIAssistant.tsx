import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const predefinedAnswers: Record<string, string> = {
  'как найти груз': 'Чтобы найти груз: 1) Выберите статус "Свободен" 2) Укажите маршрут в поле "Поиск по маршруту" 3) Выберите типы грузов, которые готовы везти 4) На карте появятся подходящие грузы',
  'как найти водителя': 'Чтобы найти водителя: 1) Выберите статус груза (готов/будет готов) 2) Введите маршрут доставки 3) Выберите тип транспорта 4) Укажите параметры груза 5) На карте отобразятся подходящие водители',
  'что означают цвета': 'Цвета маркеров: 🟢 Зелёный — свободен/готов к отгрузке, 🟡 Жёлтый — есть места/будет готов ко времени, 🔴 Красный — нет мест/занят',
  'как сохранить маршрут': 'Введите маршрут в полях "Откуда" и "Куда", затем укажите название и нажмите кнопку "Сохранить" со звёздочкой. Сохранённые маршруты появятся в выпадающем списке.',
  'как работает геолокация': 'Нажмите кнопку "Моя геопозиция" — система автоматически определит ваше местоположение и покажет ближайшие грузы или водителей.',
  'регистрация': 'Для доступа ко всем функциям нажмите кнопку "Вход / Регистрация" в правом верхнем углу. После регистрации вы сможете размещать заказы и получать уведомления.',
};

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Привет! Я помощник Груз Клик 👋 Задайте любой вопрос о работе платформы, и я помогу разобраться!'
    }
  ]);
  const [input, setInput] = useState('');

  const quickQuestions = [
    'Как найти груз?',
    'Как найти водителя?',
    'Что означают цвета?',
    'Как сохранить маршрут?'
  ];

  const handleSend = (question?: string) => {
    const userMessage = question || input;
    if (!userMessage.trim()) return;

    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: userMessage }
    ];

    const lowerQuestion = userMessage.toLowerCase();
    let answer = 'Извините, я пока не знаю ответа на этот вопрос. Попробуйте переформулировать или выберите один из быстрых вопросов выше.';

    for (const [key, value] of Object.entries(predefinedAnswers)) {
      if (lowerQuestion.includes(key)) {
        answer = value;
        break;
      }
    }

    newMessages.push({ role: 'assistant', content: answer });
    setMessages(newMessages);
    setInput('');
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-2xl animate-bounce"
        size="icon"
      >
        <Icon name="MessageCircle" size={24} />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] shadow-2xl animate-scale-in">
      <CardContent className="p-0">
        <div className="bg-primary text-primary-foreground p-4 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Icon name="Bot" size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-sm">AI Помощник</h3>
              <p className="text-xs opacity-90">Всегда на связи</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 p-0 hover:bg-white/20"
          >
            <Icon name="X" size={18} />
          </Button>
        </div>

        <div className="h-96 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-xl p-3 text-sm ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {messages.length === 1 && (
            <div className="space-y-2">
              <p className="text-xs text-center text-muted-foreground mb-2">Быстрые вопросы:</p>
              {quickQuestions.map((q, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSend(q)}
                  className="w-full justify-start text-xs h-auto py-2"
                >
                  {q}
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Задайте вопрос..."
              className="text-sm"
            />
            <Button onClick={() => handleSend()} size="sm" className="shrink-0">
              <Icon name="Send" size={16} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIAssistant;
