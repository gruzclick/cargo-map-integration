import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import Icon from './ui/icon';
import { useToast } from './ui/use-toast';

interface DeliveryPhotoUploadProps {
  deliveryId: string;
  onUploadComplete: () => void;
}

export default function DeliveryPhotoUpload({ deliveryId, onUploadComplete }: DeliveryPhotoUploadProps) {
  const [photo, setPhoto] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPhoto(base64);
        setPhotoPreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async () => {
    if (!photo) {
      toast({
        title: 'Ошибка',
        description: 'Добавьте фото доставки',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/b388f085-faa7-4aab-88a5-b45708b116eb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upload_delivery_photo',
          delivery_id: deliveryId,
          photo: photo
        })
      });

      if (response.ok) {
        toast({
          title: 'Фото загружено!',
          description: 'Доставка подтверждена'
        });
        onUploadComplete();
      } else {
        throw new Error('Ошибка загрузки фото');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить фото',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
          <Icon name="Camera" size={24} className="text-green-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Подтвердите доставку</h3>
          <p className="text-sm text-muted-foreground">Сфотографируйте груз после разгрузки</p>
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="delivery_photo">Фото после доставки</Label>
        <Input
          id="delivery_photo"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoChange}
          className="cursor-pointer"
        />

        {photoPreview && (
          <div className="relative">
            <img
              src={photoPreview}
              alt="Доставка"
              className="w-full h-64 object-cover rounded-xl border-2 border-green-500/30"
            />
            <div className="absolute top-3 right-3 bg-green-500/90 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
              <Icon name="CheckCircle" size={16} />
              Готово к отправке
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          onClick={uploadPhoto}
          disabled={!photo || uploading}
          className="flex-1"
          size="lg"
        >
          {uploading ? (
            <>
              <Icon name="Loader" size={20} className="mr-2 animate-spin" />
              Загрузка...
            </>
          ) : (
            <>
              <Icon name="Upload" size={20} className="mr-2" />
              Подтвердить доставку
            </>
          )}
        </Button>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 flex gap-3">
        <Icon name="Info" size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-400">
          Фото подтверждает успешную разгрузку и будет доступно клиенту. 
          После загрузки статус доставки изменится на "Доставлено".
        </p>
      </div>
    </Card>
  );
}
