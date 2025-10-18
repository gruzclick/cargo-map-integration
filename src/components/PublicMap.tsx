import { Card } from './ui/card';
import { Button } from './ui/button';
import Icon from './ui/icon';

interface PublicMapProps {
  onRegister: () => void;
}

const PublicMap = ({ onRegister }: PublicMapProps) => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 sticky top-0 bg-white/90 backdrop-blur-xl z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Icon name="Truck" size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Груз Клик</h1>
              <p className="text-xs text-muted-foreground font-medium">информационная площадка</p>
            </div>
          </div>
          <Button onClick={onRegister} className="rounded-full">
            <Icon name="LogIn" size={16} className="mr-2" />
            Войти / Регистрация
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="relative w-full h-[calc(100vh-200px)] rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-accent/10 flex items-center justify-center">
            <div className="absolute inset-0 opacity-20">
              <div className="w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            </div>
            
            <div className="relative z-10 max-w-2xl mx-auto px-6 animate-pulse-slow">
              <div className="flex justify-around mb-8">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <Icon name="MapPin" size={32} className="text-primary" />
                </div>
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <Icon name="Truck" size={32} className="text-primary" />
                </div>
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <Icon name="Package" size={32} className="text-primary" />
                </div>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20">
            <Card className="max-w-lg mx-auto p-8 text-center border-0 shadow-2xl">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="Lock" size={40} className="text-primary" />
              </div>
              
              <h2 className="text-2xl font-bold mb-3">
                Доступ ограничен
              </h2>
              
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Карта с доступными заявками и водителями видна только зарегистрированным пользователям. 
                Зарегистрируйтесь, чтобы увидеть полную информацию о грузоперевозках в вашем регионе.
              </p>

              <div className="space-y-3 mb-6 text-left bg-muted/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Icon name="Check" size={20} className="text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Клиенты</p>
                    <p className="text-xs text-muted-foreground">Найдите доступных перевозчиков на карте</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="Check" size={20} className="text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Перевозчики</p>
                    <p className="text-xs text-muted-foreground">Смотрите заявки на доставку в режиме реального времени</p>
                  </div>
                </div>
              </div>

              <Button onClick={onRegister} size="lg" className="w-full rounded-full">
                <Icon name="UserPlus" size={20} className="mr-2" />
                Зарегистрироваться сейчас
              </Button>

              <p className="text-xs text-muted-foreground mt-4">
                Уже есть аккаунт?{' '}
                <button onClick={onRegister} className="text-primary hover:underline font-medium">
                  Войти
                </button>
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicMap;
