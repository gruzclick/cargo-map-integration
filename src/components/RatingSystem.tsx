import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import Icon from './ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Review {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

interface RatingSystemProps {
  carrierId: string;
  carrierName: string;
  canReview?: boolean;
}

export default function RatingSystem({ carrierId, carrierName, canReview = false }: RatingSystemProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  const [reviews, setReviews] = useState<Review[]>([]);

  const averageRating = reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length;

  const handleSubmitReview = () => {
    if (rating === 0) {
      toast({
        title: 'Укажите оценку',
        description: 'Выберите количество звёзд',
        variant: 'destructive'
      });
      return;
    }

    const newReview: Review = {
      id: Date.now().toString(),
      user_name: 'Вы',
      rating,
      comment,
      date: new Date().toISOString().split('T')[0],
      verified: true
    };

    setReviews([newReview, ...reviews]);
    setRating(0);
    setComment('');
    setShowReviewForm(false);

    toast({
      title: 'Отзыв отправлен',
      description: 'Спасибо за ваш отзыв!'
    });
  };

  const renderStars = (count: number, interactive: boolean = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            onClick={() => interactive && setRating(star)}
            className={`${interactive ? 'cursor-pointer' : 'cursor-default'} transition-all`}
          >
            <Icon
              name="Star"
              size={interactive ? 24 : 16}
              className={`${
                star <= (interactive ? (hoverRating || rating) : count)
                  ? 'fill-accent text-accent'
                  : 'text-muted-foreground/30'
              } transition-colors`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-accent/5 to-orange-500/5">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Star" size={24} className="text-accent" />
                Рейтинг перевозчика
              </CardTitle>
              <CardDescription className="mt-2">{carrierName}</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-foreground">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex items-center gap-1 mt-1">
                {renderStars(Math.round(averageRating))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {reviews.length} {reviews.length === 1 ? 'отзыв' : 'отзывов'}
              </p>
            </div>
          </div>
        </CardHeader>

        {canReview && (
          <CardContent className="pt-6">
            {!showReviewForm ? (
              <Button
                onClick={() => setShowReviewForm(true)}
                className="w-full h-12 gap-2 rounded-xl"
                variant="outline"
              >
                <Icon name="MessageSquarePlus" size={18} />
                Оставить отзыв
              </Button>
            ) : (
              <div className="space-y-4 p-4 bg-muted/20 rounded-xl">
                <div>
                  <label className="text-sm font-medium mb-2 block">Ваша оценка *</label>
                  {renderStars(rating, true)}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Комментарий</label>
                  <Textarea
                    placeholder="Расскажите о вашем опыте работы с этим перевозчиком..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-24 rounded-xl"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleSubmitReview}
                    className="flex-1 h-11 rounded-xl"
                  >
                    <Icon name="Send" size={16} className="mr-2" />
                    Отправить
                  </Button>
                  <Button
                    onClick={() => {
                      setShowReviewForm(false);
                      setRating(0);
                      setComment('');
                    }}
                    variant="outline"
                    className="flex-1 h-11 rounded-xl"
                  >
                    Отмена
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      <Card className="border-border/50 shadow-lg">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Icon name="MessageSquare" size={20} />
            Отзывы клиентов
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {reviews.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Icon name="MessageSquare" size={48} className="mx-auto mb-4 opacity-30" />
              <p>Пока нет отзывов</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="pb-6 border-b last:border-0 last:pb-0">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12 bg-accent/10">
                      <AvatarFallback className="text-accent font-semibold">
                        {review.user_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold">{review.user_name}</h4>
                          {review.verified && (
                            <Badge variant="outline" className="text-xs gap-1 bg-green-500/10 text-green-600 border-green-500/30">
                              <Icon name="CheckCircle2" size={12} />
                              Проверен
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.date).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        <span className="text-sm font-medium text-muted-foreground">
                          {review.rating}.0
                        </span>
                      </div>

                      {review.comment && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}