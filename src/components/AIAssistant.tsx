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
  'регистрация',
  'пользовательское соглашение',
  'условия использования',
  'тарифы',
  'оплата',
  'отслеживание',
  'уведомления',
  'рейтинг',
  'отзывы',
  'документы',
  'профиль',
  'настройки',
  'помощь',
  'поддержка',
  'статус',
  'маршрут',
  'фото',
  'доказательство',
  'история',
  'парк',
  'автомобиль',
  'отдых',
  'оптимизация'
];

const predefinedAnswers: Record<string, string> = {
  'как найти груз': 'Чтобы найти груз: 1) Выберите статус "Свободен" 2) Укажите маршрут в поле "Поиск по маршруту" 3) Выберите типы грузов, которые готовы везти 4) На карте появятся подходящие грузы',
  'как найти водителя': 'Чтобы найти водителя: 1) Выберите статус груза (готов/будет готов) 2) Введите маршрут доставки 3) Выберите тип транспорта 4) Укажите параметры груза 5) На карте отобразятся подходящие водители',
  'что означают цвета': 'Цвета маркеров: 🟢 Зелёный — свободен/готов к отгрузке, 🟡 Жёлтый — есть места/будет готов ко времени, 🔴 Красный — нет мест/занят',
  'как сохранить маршрут': 'Введите маршрут в полях "Откуда" и "Куда", затем укажите название и нажмите кнопку "Сохранить" со звёздочкой. Сохранённые маршруты появятся в выпадающем списке.',
  'как работает геолокация': 'Нажмите кнопку "Моя геопозиция" — система автоматически определит ваше местоположение и покажет ближайшие грузы или водителей.',
  'регистрация': 'Для доступа ко всем функциям нажмите кнопку "Вход / Регистрация" в правом верхнем углу. После регистрации вы сможете размещать заказы и получать уведомления.',
  'пользовательское соглашение': 'Пользовательское соглашение регулирует использование платформы Груз Клик. Основные пункты: 1) Честность данных о грузах и транспорте 2) Ответственность за соблюдение сроков 3) Запрет мошенничества 4) Конфиденциальность данных 5) Правила возврата средств',
  'условия использования': 'Основные условия: платформа бесплатна для поиска, комиссия берётся только при успешной сделке (5% для водителей, 3% для клиентов). Запрещено: размещение фейковых объявлений, спам, мошенничество.',
  'тарифы': 'Тарифы Груз Клик: базовый поиск — бесплатно, комиссия 5% для водителей и 3% для клиентов при успешной сделке. Премиум тариф (скоро): приоритет в поиске, расширенная аналитика.',
  'оплата': 'Оплата производится после подтверждения доставки. Поддерживаются: банковские карты, электронные кошельки, банковский перевод. Деньги удерживаются на платформе до подтверждения выполнения заказа.',
  'отслеживание': 'Отслеживание доступно в разделе "История". Вы видите: текущее местоположение водителя, статус доставки, расчётное время прибытия. Клиенты получают уведомления о каждом этапе.',
  'уведомления': 'Уведомления приходят при: новом подходящем заказе/водителе, изменении статуса доставки, приближении водителя к точке, завершении доставки. Настройки уведомлений в разделе "Профиль".',
  'рейтинг': 'Рейтинг формируется из оценок после завершения доставки. Влияют: качество услуг, соблюдение сроков, состояние груза. Высокий рейтинг повышает приоритет в поиске.',
  'отзывы': 'Отзывы можно оставить после завершения доставки в разделе "История". Они видны всем пользователям и влияют на рейтинг. Запрещены: оскорбления, ложная информация.',
  'документы': 'В разделе "Документы" можно: сформировать накладную, счёт-фактуру, акт выполненных работ. Документы автоматически заполняются данными заказа.',
  'профиль': 'В профиле настройте: контактные данные, способы оплаты, уведомления, язык интерфейса. Для водителей: данные автомобиля, документы, график работы.',
  'настройки': 'Доступные настройки: язык (RU/EN/KZ), валюта (₽/$/₸), уведомления (push/email/sms), тема (светлая/тёмная), единицы измерения (км/мили).',
  'помощь': 'Если возникли проблемы: 1) Проверьте этот чат — здесь ответы на частые вопросы 2) Напишите в поддержку через профиль 3) Позвоните по телефону горячей линии: +7 (XXX) XXX-XX-XX',
  'статус': 'Статусы водителя: 🟢 Свободен (готов взять заказ), 🟡 Есть места (может взять попутный груз), 🔴 Нет мест (занят). Статусы груза: Готов к отгрузке, Будет готов ко времени.',
  'маршрут': 'Маршруты можно: сохранять для быстрого доступа, строить с несколькими точками, оптимизировать по времени/расстоянию. Используйте раздел "Маршруты" для управления.',
  'фото доказательство': 'Фото доказательства загружаются при доставке: фото груза при погрузке, фото при разгрузке, подпись получателя. Это защищает обе стороны от споров.',
  'история': 'В разделе "История" доступны: все завершённые заказы, текущие активные доставки, отменённые заявки. Можно повторить заказ одним кликом.',
  'автопарк': 'В разделе "Автопарк" управляйте транспортом: добавляйте автомобили, указывайте характеристики, отмечайте водителей, отслеживайте техосмотры.',
  'оптимизация маршрута': 'Оптимизация маршрута учитывает: расстояние, время в пути, пробки, стоимость топлива. Доступна в разделе "Маршруты" — кнопка "Оптимизировать".'
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
      content: 'Привет! Я помощник Груз Клик 👋 Задайте вопрос о работе платформы или пользовательском соглашении. Можете говорить голосом!'
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
    'Как найти водителя?',
    'Что означают цвета?',
    'Пользовательское соглашение'
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
          content: '⚠️ Извините, я могу отвечать только на вопросы о работе платформы Груз Клик и пользовательском соглашении. Попробуйте переформулировать вопрос или выберите быстрый вопрос выше.' 
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

    let answer = 'Извините, я пока не знаю ответа на этот вопрос. Попробуйте переформулировать или выберите один из быстрых вопросов. Помните: я отвечаю только на вопросы о платформе Груз Клик и условиях использования.';

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
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-2xl hover:scale-110 transition-transform"
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
              <p className="text-xs opacity-90">Только вопросы о платформе</p>
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

        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Задайте вопрос..."
              className="text-sm"
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
          <p className="text-[10px] text-muted-foreground mt-1 text-center">
            🔒 Защищённый режим: только вопросы о платформе
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIAssistant;
