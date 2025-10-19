import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface QuickActionsProps {
  userRole: 'client' | 'carrier';
  onAction: (action: string) => void;
}

const QuickActions = ({ userRole, onAction }: QuickActionsProps) => {
  const clientActions = [
    { icon: 'Plus', label: 'Новый заказ', action: 'new-order', color: 'bg-blue-500 hover:bg-blue-600' },
    { icon: 'Search', label: 'Найти водителя', action: 'find-driver', color: 'bg-green-500 hover:bg-green-600' },
    { icon: 'Calculator', label: 'Калькулятор', action: 'calculator', color: 'bg-purple-500 hover:bg-purple-600' },
    { icon: 'FileText', label: 'Документы', action: 'documents', color: 'bg-orange-500 hover:bg-orange-600' },
  ];

  const carrierActions = [
    { icon: 'Search', label: 'Найти груз', action: 'find-cargo', color: 'bg-blue-500 hover:bg-blue-600' },
    { icon: 'MapPin', label: 'Обновить позицию', action: 'update-location', color: 'bg-green-500 hover:bg-green-600' },
    { icon: 'TrendingUp', label: 'Моя статистика', action: 'statistics', color: 'bg-purple-500 hover:bg-purple-600' },
    { icon: 'Star', label: 'Мой рейтинг', action: 'rating', color: 'bg-yellow-500 hover:bg-yellow-600' },
  ];

  const actions = userRole === 'client' ? clientActions : carrierActions;

  return (
    <Card className="border-none shadow-lg bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base md:text-lg flex items-center gap-2">
          <Icon name="Zap" size={20} className="text-yellow-500" />
          Быстрые действия
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <Button
            key={action.action}
            onClick={() => onAction(action.action)}
            className={`${action.color} text-white h-auto py-3 flex-col gap-1 hover:scale-105 transition-transform`}
          >
            <Icon name={action.icon as any} size={20} />
            <span className="text-xs">{action.label}</span>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

export default QuickActions;
