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
      <header className="border-b border-border sticky top-0 bg-white/95 backdrop-blur-sm z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Truck" size={32} className="text-primary" />
            <h1 className="text-2xl font-bold text-primary">ГрузЭкспресс</h1>
          </div>
          <nav className="hidden md:flex gap-6">
            <a href="#home" className="text-foreground hover:text-primary transition-colors">Главная</a>
            <a href="#services" className="text-foreground hover:text-primary transition-colors">Услуги</a>
            <a href="#tracking" className="text-foreground hover:text-primary transition-colors">Отслеживание</a>
            <a href="#reviews" className="text-foreground hover:text-primary transition-colors">Отзывы</a>
          </nav>
          <Button>
            <Icon name="Phone" size={18} className="mr-2" />
            +7 (495) 123-45-67
          </Button>
        </div>
      </header>

      <section id="home" className="py-12 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                Карта грузов и водителей
              </h2>
              <p className="text-lg text-muted-foreground">
                Все доступные грузы и свободные водители в реальном времени
              </p>
            </div>
            <LiveMap />
          </div>
        </div>
      </section>

      <section id="services" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Наши услуги</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-2">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name={service.icon as any} size={32} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                  <p className="text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="tracking" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Отследить груз</h2>
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <div className="flex gap-4 mb-6">
                  <Input
                    placeholder="Введите ID груза (например: КГ-12345)"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    className="flex-1 h-12 text-lg"
                  />
                  <Button onClick={handleTrack} size="lg" className="px-8">
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

      <section id="reviews" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Отзывы клиентов</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <Icon key={i} name="Star" size={18} className="text-accent fill-accent" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{review.text}"</p>
                  <div>
                    <p className="font-semibold">{review.name}</p>
                    <p className="text-sm text-muted-foreground">{review.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-secondary text-secondary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Icon name="Truck" size={28} className="text-primary" />
                <h3 className="text-xl font-bold">ГрузЭкспресс</h3>
              </div>
              <p className="text-sm opacity-80">Надёжные грузоперевозки с 2010 года</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Услуги</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li>Городские перевозки</li>
                <li>Межгород</li>
                <li>Международные</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Контакты</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li className="flex items-center gap-2">
                  <Icon name="Phone" size={16} />
                  +7 (495) 123-45-67
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Mail" size={16} />
                  info@gruzexpress.ru
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Мы в соцсетях</h4>
              <div className="flex gap-3">
                <Button size="sm" variant="outline" className="w-10 h-10 p-0">
                  <Icon name="Facebook" size={18} />
                </Button>
                <Button size="sm" variant="outline" className="w-10 h-10 p-0">
                  <Icon name="Instagram" size={18} />
                </Button>
                <Button size="sm" variant="outline" className="w-10 h-10 p-0">
                  <Icon name="Twitter" size={18} />
                </Button>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm opacity-80">
            © 2024 ГрузЭкспресс. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;