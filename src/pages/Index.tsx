import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import LiveMap from '@/components/LiveMap';

const Index = () => {
  const [trackingId, setTrackingId] = useState('');
  const [isTracking, setIsTracking] = useState(false);

  const handleTrack = () => {
    if (trackingId.trim()) {
      setIsTracking(true);
    }
  };

  const services = [
    {
      icon: 'Truck',
      title: 'Городские перевозки',
      description: 'Быстрая доставка по городу 24/7'
    },
    {
      icon: 'Package',
      title: 'Межгород',
      description: 'Доставка в любую точку страны'
    },
    {
      icon: 'Globe',
      title: 'Международные',
      description: 'Грузоперевозки за границу'
    }
  ];

  const reviews = [
    {
      name: 'Алексей Иванов',
      company: 'ООО "Стройматериалы"',
      text: 'Отличный сервис! Груз доставлен точно в срок, водитель профессионал.',
      rating: 5
    },
    {
      name: 'Мария Петрова',
      company: 'ИП Петрова М.С.',
      text: 'Пользуюсь услугами уже год. Всегда можно отследить где груз.',
      rating: 5
    },
    {
      name: 'Дмитрий Сидоров',
      company: 'ТД "Оптторг"',
      text: 'Выгодные цены и надёжность. Рекомендую!',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 sticky top-0 bg-white/80 backdrop-blur-xl z-50">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Icon name="Zap" size={22} className="text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Груз Клик</h1>
          </div>
          <nav className="hidden md:flex gap-8">
            <a href="#home" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">Карта</a>
            <a href="#services" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">Услуги</a>
            <a href="#tracking" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">Отслеживание</a>
            <a href="#reviews" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">Отзывы</a>
          </nav>
          <Button className="rounded-full" size="sm">
            Связаться
          </Button>
        </div>
      </header>

      <section id="home" className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-5xl md:text-6xl font-semibold mb-4 text-foreground tracking-tight">
                Карта грузов и водителей
              </h2>
              <p className="text-xl text-muted-foreground font-light">
                Все доступные грузы и свободные водители в реальном времени
              </p>
            </div>
            <LiveMap />
          </div>
        </div>
      </section>

      <section id="services" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-semibold text-center mb-14 tracking-tight">Наши услуги</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-xl transition-all duration-300 border-0 bg-card rounded-2xl overflow-hidden">
                <CardContent className="p-10 text-center">
                  <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <Icon name={service.icon as any} size={28} className="text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                  <p className="text-muted-foreground font-light leading-relaxed">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="tracking" className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-semibold text-center mb-14 tracking-tight">Отследить груз</h2>
          <div className="max-w-3xl mx-auto">
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardContent className="p-10">
                <div className="flex gap-3 mb-6">
                  <Input
                    placeholder="Введите ID груза (например: КГ-12345)"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    className="flex-1 h-14 text-base rounded-xl border-border/50"
                  />
                  <Button onClick={handleTrack} size="lg" className="px-10 rounded-xl h-14">
                    <Icon name="Search" size={20} className="mr-2" />
                    Найти
                  </Button>
                </div>

                {isTracking && trackingId && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon name="Package" size={20} className="text-primary" />
                        <span className="font-semibold">ID груза: {trackingId}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Icon name="MapPin" size={16} />
                        <span>Текущее местоположение: Москва, ул. Ленина 45</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Icon name="Clock" size={16} className="text-accent" />
                        <span className="text-accent font-medium">В пути • Доставка завтра до 18:00</span>
                      </div>
                    </div>

                    <div className="h-96 bg-muted rounded-lg overflow-hidden relative">
                      <iframe
                        src="https://yandex.ru/map-widget/v1/?ll=37.617635,55.755819&z=12&l=map"
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        className="rounded-lg"
                      />
                      <div className="absolute top-4 right-4 bg-white px-3 py-2 rounded-lg shadow-md flex items-center gap-2">
                        <div className="w-3 h-3 bg-accent rounded-full animate-pulse" />
                        <span className="text-sm font-medium">Груз в движении</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="reviews" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-semibold text-center mb-14 tracking-tight">Отзывы клиентов</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {reviews.map((review, index) => (
              <Card key={index} className="border-0 shadow-md rounded-2xl bg-card">
                <CardContent className="p-8">
                  <div className="flex items-center gap-1 mb-5">
                    {[...Array(review.rating)].map((_, i) => (
                      <Icon key={i} name="Star" size={16} className="text-accent fill-accent" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-5 font-light leading-relaxed">"{review.text}"</p>
                  <div>
                    <p className="font-semibold text-sm">{review.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{review.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-foreground text-background py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 max-w-6xl mx-auto">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-background/10 rounded-lg flex items-center justify-center">
                  <Icon name="Zap" size={18} className="text-background" />
                </div>
                <h3 className="text-lg font-semibold">Груз Клик</h3>
              </div>
              <p className="text-sm opacity-70 font-light">Надёжные грузоперевозки с 2010 года</p>
            </div>
            <div>
              <h4 className="font-medium mb-4 text-sm">Услуги</h4>
              <ul className="space-y-2 text-sm opacity-70 font-light">
                <li>Городские перевозки</li>
                <li>Межгород</li>
                <li>Международные</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4 text-sm">Контакты</h4>
              <ul className="space-y-2 text-sm opacity-70 font-light">
                <li className="flex items-center gap-2">
                  <Icon name="Phone" size={14} />
                  +7 (495) 123-45-67
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Mail" size={14} />
                  info@gruzclick.ru
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4 text-sm">Соцсети</h4>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="w-9 h-9 p-0 rounded-full border-background/20 hover:bg-background/10">
                  <Icon name="Facebook" size={16} />
                </Button>
                <Button size="sm" variant="outline" className="w-9 h-9 p-0 rounded-full border-background/20 hover:bg-background/10">
                  <Icon name="Instagram" size={16} />
                </Button>
                <Button size="sm" variant="outline" className="w-9 h-9 p-0 rounded-full border-background/20 hover:bg-background/10">
                  <Icon name="Twitter" size={16} />
                </Button>
              </div>
            </div>
          </div>
          <div className="border-t border-background/10 mt-12 pt-8 text-center text-xs opacity-60 font-light">
            © 2024 Груз Клик. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;