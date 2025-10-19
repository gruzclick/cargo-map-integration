import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

interface Favorite {
  id: string;
  name: string;
  phone: string;
  type: 'driver' | 'client';
  rating: number;
  completedOrders: number;
  addedAt: string;
}

interface FavoritesListProps {
  userRole: 'client' | 'carrier';
}

const FavoritesList = ({ userRole }: FavoritesListProps) => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  useEffect(() => {
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  const removeFavorite = (id: string) => {
    const updated = favorites.filter(f => f.id !== id);
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  const contactFavorite = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  if (favorites.length === 0) {
    return (
      <Card className="border-none shadow-lg bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon name="Star" size={20} className="text-yellow-500" />
            Избранное
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="Star" size={48} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">
              Здесь будут {userRole === 'client' ? 'водители' : 'клиенты'}, которых вы добавите в избранное
            </p>
            <p className="text-xs mt-2">
              Нажмите ⭐ рядом с пользователем на карте
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-lg bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Icon name="Star" size={20} className="text-yellow-500" />
            Избранное
          </div>
          <Badge variant="secondary">{favorites.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {favorites.map((favorite) => (
          <div
            key={favorite.id}
            className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-sm">{favorite.name}</h4>
                <Badge variant="outline" className="text-xs">
                  ⭐ {favorite.rating.toFixed(1)}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {favorite.completedOrders} завершённых заказов
              </p>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => contactFavorite(favorite.phone)}
                className="h-8 w-8 p-0"
              >
                <Icon name="Phone" size={16} className="text-green-500" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFavorite(favorite.id)}
                className="h-8 w-8 p-0"
              >
                <Icon name="Trash2" size={16} className="text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default FavoritesList;
