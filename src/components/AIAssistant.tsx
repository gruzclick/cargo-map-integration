import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ALLOWED_TOPICS = [
  'как найти груз',
  'как найти водителя',
  'что означают цвета',
  'как сохранить маршрут',
  'как работает геолокация',
  'как пользоваться картой',
  'как использовать фильтры',
  'как искать маршруты',
  'статусы',
  'помощь',
  'как работает приложение',
  'как работает сайт',
  'инструкция',
  'функции'
];

const predefinedAnswers: Record<string, string> = {
  'как найти груз': 'Чтобы найти груз: 1) Откройте боковую панель слева 2) Перейдите на вкладку "Поиск" 3) Укажите маршрут "Откуда" и "Куда" 4) Выберите типы грузов 5) Подходящие грузы появятся на карте',
  'как найти водителя': 'Чтобы найти водителя: 1) Откройте боковую панель 2) Вкладка "Поиск" 3) Введите маршрут доставки 4) Выберите типы транспорта 5) На карте появятся доступные водители',
  'что означают цвета': 'Цвета маркеров на карте: 🟢 Зелёный — свободен/готов, 🟡 Жёлтый — есть места/скоро готов, 🔴 Красный — занят/нет мест',
  'как сохранить маршрут': 'Введите маршрут в полях "Откуда" и "Куда" во вкладке "Поиск". Нажмите кнопку со звёздочкой для сохранения.',
  'как работает геолокация': 'Нажмите круглую кнопку с прицелом в правом верхнем углу карты. Система определит ваше местоположение автоматически.',
  'как пользоваться картой': 'На карте: кнопка слева вверху — открыть/закрыть панель, кнопка справа — геолокация, кнопка внизу справа — AI помощник. Боковая панель имеет 2 вкладки: Статистика и Поиск.',
  'как использовать фильтры': 'Откройте боковую панель слева, перейдите на вкладку "Поиск". Там вы найдёте все фильтры: выбор типа пользователя, маршруты, типы грузов и транспорта.',
  'как искать маршруты': 'Во вкладке "Поиск" заполните поля "Откуда" и "Куда". Система автоматически отфильтрует подходящие грузы/водителей на маршруте.',
  'статусы': 'Статусы: 🟢 Свободен/Готов 🟡 Есть места/Скоро готов 🔴 Занят/Нет мест. Меняйте статусы во вкладке "Статистика".',
  'помощь': 'Я помогу разобраться с функциями карты и приложения. Задавайте вопросы о том, как пользоваться интерфейсом!',
  'как работает приложение': 'Приложение показывает грузы и водителей на карте в реальном времени. Используйте боковую панель для поиска и фильтрации. Все функции доступны через кнопки на карте.',
  'как работает сайт': 'Сайт работает как интерактивная карта: открывайте панель слева для фильтров, используйте геолокацию справа, общайтесь со мной через кнопку AI внизу.',
  'инструкция': 'Основные шаги: 1) Откройте боковую панель 2) Выберите вкладку (Статистика/Поиск) 3) Настройте фильтры 4) Смотрите результаты на карте 5) Нажимайте на маркеры для деталей',
  'функции': 'Доступные функции: поиск по маршруту, фильтрация по типам, геолокация, статистика, смена статусов, просмотр деталей на карте.'
};

const sanitizeInput = (input: string): string => {
  return input
    .toLowerCase()
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
    .slice(0, 200);
};

const isAllowedQuestion = (question: string): boolean => {
  const sanitized = sanitizeInput(question);
  return ALLOWED_TOPICS.some(topic => sanitized.includes(topic));
};

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '👋 Привет! Я расскажу, как пользоваться картой и приложением. Спросите меня о функциях интерфейса!'
    }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'ru-RU';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickQuestions = [
    'Как найти груз?',
    'Как пользоваться картой?',
    'Что означают цвета?',
    'Как искать маршруты?'
  ];

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Голосовой ввод не поддерживается вашим браузером');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSend = (question?: string) => {
    const userMessage = question || input;
    if (!userMessage.trim()) return;

    const sanitized = sanitizeInput(userMessage);
    
    if (!isAllowedQuestion(sanitized)) {
      const warningMessages: Message[] = [
        ...messages,
        { role: 'user', content: userMessage },
        { 
          role: 'assistant', 
          content: '⚠️ Я отвечаю только на вопросы о том, как пользоваться картой и интерфейсом приложения. Попробуйте выбрать быстрый вопрос выше!' 
        }
      ];
      setMessages(warningMessages);
      setInput('');
      return;
    }

    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: userMessage }
    ];

    let answer = 'Извините, я не нашёл ответа на этот вопрос. Я отвечаю только на вопросы об использовании карты и функций приложения. Выберите быстрый вопрос выше!';

    for (const [key, value] of Object.entries(predefinedAnswers)) {
      if (sanitized.includes(key)) {
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
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 px-4 py-3 bg-white/15 dark:bg-gray-900/15 backdrop-blur-3xl border border-white/40 dark:border-gray-700/40 shadow-2xl rounded-full hover:bg-white/25 dark:hover:bg-gray-900/25 active:scale-95 transition-all flex items-center gap-2"
      >
        <Icon name="HelpCircle" size={18} className="text-gray-900 dark:text-white" />
        <span className="text-sm font-medium text-gray-900 dark:text-white">Справка</span>
      </button>
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
              <h3 className="font-semibold text-sm">Справка</h3>
              <p className="text-xs opacity-90">Вопросы о приложении</p>
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

        <div className="h-96 overflow-y-auto p-4 space-y-3 bg-white/5 dark:bg-gray-900/5">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-xl p-3 text-sm ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                    : 'bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border border-white/30 dark:border-gray-700/30 text-gray-900 dark:text-white'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />

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

        <div className="p-3 border-t border-white/20 dark:border-gray-700/20 bg-white/10 dark:bg-gray-900/10">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Задайте вопрос..."
              className="text-sm bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-white/40 dark:border-gray-700/40"
              maxLength={200}
            />
            <Button 
              onClick={handleVoiceInput} 
              size="sm" 
              variant={isListening ? "destructive" : "outline"}
              className="shrink-0"
            >
              <Icon name={isListening ? "MicOff" : "Mic"} size={16} />
            </Button>
            <Button onClick={() => handleSend()} size="sm" className="shrink-0">
              <Icon name="Send" size={16} />
            </Button>
          </div>
          <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-1 text-center">
            🔒 Безопасный режим: только об использовании приложения
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIAssistant;