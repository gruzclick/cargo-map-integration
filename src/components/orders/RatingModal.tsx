import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface Review {
  id: string;
  orderId: string;
  reviewerUserId: string;
  reviewedUserId: string;
  reviewedUserName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface RatingModalProps {
  orderId: string;
  reviewerUserId: string;
  reviewedUserId: string;
  reviewedUserName: string;
  onSubmit: (review: Review) => void;
  onClose: () => void;
}

export const RatingModal = ({
  orderId,
  reviewerUserId,
  reviewedUserId,
  reviewedUserName,
  onSubmit,
  onClose
}: RatingModalProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (rating === 0) {
      alert('Пожалуйста, выберите оценку');
      return;
    }

    setIsSubmitting(true);

    const review: Review = {
      id: crypto.randomUUID(),
      orderId,
      reviewerUserId,
      reviewedUserId,
      reviewedUserName,
      rating,
      comment,
      createdAt: new Date().toISOString()
    };

    const existingReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    const updatedReviews = [...existingReviews, review];
    localStorage.setItem('reviews', JSON.stringify(updatedReviews));

    updateUserRating(reviewedUserId);

    onSubmit(review);
    setIsSubmitting(false);
  };

  const updateUserRating = (userId: string) => {
    const allReviews = JSON.parse(localStorage.getItem('reviews') || '[]') as Review[];
    const userReviews = allReviews.filter(r => r.reviewedUserId === userId);
    
    if (userReviews.length === 0) return;

    const totalRating = userReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / userReviews.length;

    const userProfile = localStorage.getItem(`user_profile_${userId}`);
    if (userProfile) {
      const profile = JSON.parse(userProfile);
      profile.rating = avgRating.toFixed(2);
      profile.reviewsCount = userReviews.length;
      localStorage.setItem(`user_profile_${userId}`, JSON.stringify(profile));
    }
  };

  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
              <Icon name="Star" size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Оцените пользователя</h2>
              <p className="text-sm text-gray-500">{reviewedUserName}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Звезды */}
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Как бы вы оценили работу пользователя?
            </p>
            <div className="flex gap-2">
              {stars.map((star) => (
                <button
                  key={star}
                  type="button"
                  className="transition-transform hover:scale-110"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Icon
                    name="Star"
                    size={40}
                    className={`${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-500 text-yellow-500'
                        : 'text-gray-300 dark:text-gray-600'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm font-medium">
                {rating === 1 && 'Очень плохо'}
                {rating === 2 && 'Плохо'}
                {rating === 3 && 'Нормально'}
                {rating === 4 && 'Хорошо'}
                {rating === 5 && 'Отлично'}
              </p>
            )}
          </div>

          {/* Комментарий */}
          <div>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Расскажите подробнее о вашем опыте (необязательно)"
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Информация */}
          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg flex items-start gap-2">
            <Icon name="Info" size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Ваш отзыв поможет другим пользователям принять правильное решение. 
              Оценка будет видна всем участникам платформы.
            </p>
          </div>

          {/* Кнопки */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting ? (
                <>
                  <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                  Отправка...
                </>
              ) : (
                <>
                  <Icon name="CheckCircle" size={18} className="mr-2" />
                  Отправить отзыв
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
