import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface DeliveryPhotoConfirmationProps {
  orderId: string;
  onPhotoUpload: (photo: File, note?: string) => Promise<void>;
  isCarrier: boolean;
}

export default function DeliveryPhotoConfirmation({ 
  orderId, 
  onPhotoUpload, 
  isCarrier 
}: DeliveryPhotoConfirmationProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [uploading, setUploading] = useState(false);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Пожалуйста, выберите изображение');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Размер файла не должен превышать 10 МБ');
      return;
    }

    setSelectedPhoto(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedPhoto) {
      toast.error('Выберите фото для загрузки');
      return;
    }

    setUploading(true);
    try {
      await onPhotoUpload(selectedPhoto, note);
      toast.success('Фото успешно загружено');
      setSelectedPhoto(null);
      setPreviewUrl(null);
      setNote('');
    } catch (error) {
      toast.error('Ошибка при загрузке фото');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedPhoto(null);
    setPreviewUrl(null);
    setNote('');
  };

  return (
    <Card className="border-accent/20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
            <Icon name="Camera" size={24} className="text-accent" />
          </div>
          <div>
            <CardTitle>Фотоподтверждение доставки</CardTitle>
            <CardDescription>
              {isCarrier 
                ? 'Загрузите фото автомобиля с госномером у места доставки' 
                : 'Подтвердите получение груза'
              }
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <Icon name="Info" size={20} className="text-amber-600 mt-0.5" />
          <div className="flex-1 text-sm text-amber-900">
            <p className="font-medium mb-1">Требования к фото:</p>
            <ul className="list-disc list-inside space-y-1 text-amber-800">
              {isCarrier ? (
                <>
                  <li>Автомобиль с видимыми госномерами</li>
                  <li>Место разгрузки или ворота склада</li>
                  <li>Хорошее освещение и четкость</li>
                  <li>Максимальный размер: 10 МБ</li>
                </>
              ) : (
                <>
                  <li>Полученный груз в упаковке</li>
                  <li>Подтверждение целостности</li>
                  <li>Хорошее освещение и четкость</li>
                  <li>Максимальный размер: 10 МБ</li>
                </>
              )}
            </ul>
          </div>
        </div>

        {!previewUrl ? (
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoSelect}
              className="hidden"
              id={`photo-upload-${orderId}`}
            />
            <label htmlFor={`photo-upload-${orderId}`}>
              <Button asChild className="w-full" size="lg">
                <span>
                  <Icon name="Camera" size={20} className="mr-2" />
                  Сделать фото
                </span>
              </Button>
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden border-2 border-accent/20">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-full h-64 object-cover" 
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={clearSelection}
              >
                <Icon name="X" size={20} />
              </Button>
            </div>

            {isCarrier && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Примечание (опционально)
                </label>
                <Textarea
                  placeholder="Например: груз не приняли из-за отсутствия ответственного лица"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            <Button 
              onClick={handleUpload} 
              className="w-full" 
              size="lg"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Icon name="Loader" size={20} className="mr-2 animate-spin" />
                  Загрузка...
                </>
              ) : (
                <>
                  <Icon name="Upload" size={20} className="mr-2" />
                  Загрузить фото
                </>
              )}
            </Button>
          </div>
        )}

        {isCarrier && (
          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
            <p className="font-medium mb-2">Что происходит после загрузки:</p>
            <ul className="space-y-1">
              <li>✓ Клиент получит уведомление</li>
              <li>✓ Заявка будет отмечена как выполненная</li>
              <li>✓ Клиент должен подтвердить получение груза</li>
              <li>✓ Если груз не принят - приложите фото с пояснением</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
