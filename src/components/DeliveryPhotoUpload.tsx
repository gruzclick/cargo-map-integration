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
  const [vehiclePhoto, setVehiclePhoto] = useState<string>('');
  const [vehiclePhotoPreview, setVehiclePhotoPreview] = useState<string>('');
  const [additionalPhotos, setAdditionalPhotos] = useState<string[]>([]);
  const [additionalPhotoPreviews, setAdditionalPhotoPreviews] = useState<string[]>([]);
  const [warehouseName, setWarehouseName] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [vehicleBrand, setVehicleBrand] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [gateNumber, setGateNumber] = useState('');
  const [driverFullName, setDriverFullName] = useState('');
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleVehiclePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setVehiclePhoto(base64);
        setVehiclePhotoPreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalPhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setAdditionalPhotos(prev => [...prev, base64]);
        setAdditionalPhotoPreviews(prev => [...prev, base64]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAdditionalPhoto = (index: number) => {
    setAdditionalPhotos(prev => prev.filter((_, i) => i !== index));
    setAdditionalPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadReport = async () => {
    if (!vehiclePhoto) {
      toast({
        title: 'Ошибка',
        description: 'Обязательно добавьте фото автомобиля у ворот',
        variant: 'destructive'
      });
      return;
    }

    if (!warehouseName || !deliveryDate || !deliveryTime || !vehicleBrand || !vehicleNumber || !driverFullName) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
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
          action: 'upload_delivery_report',
          delivery_id: deliveryId,
          vehicle_photo: vehiclePhoto,
          additional_photos: additionalPhotos,
          warehouse_name: warehouseName,
          delivery_date: deliveryDate,
          delivery_time: deliveryTime,
          vehicle_brand: vehicleBrand,
          vehicle_number: vehicleNumber,
          gate_number: gateNumber,
          driver_full_name: driverFullName
        })
      });

      if (response.ok) {
        toast({
          title: 'Отчёт отправлен!',
          description: 'Доставка подтверждена'
        });
        onUploadComplete();
      } else {
        throw new Error('Ошибка загрузки отчёта');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить отчёт',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
          <Icon name="FileText" size={24} className="text-green-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Отчёт о сдаче груза</h3>
          <p className="text-sm text-muted-foreground">Заполните данные после доставки</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="warehouse_name">Склад приёмки <span className="text-red-500">*</span></Label>
          <Input
            id="warehouse_name"
            value={warehouseName}
            onChange={(e) => setWarehouseName(e.target.value)}
            placeholder='ТД "Северный", склад 12А'
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gate_number">Номер ворот/склада</Label>
          <Input
            id="gate_number"
            value={gateNumber}
            onChange={(e) => setGateNumber(e.target.value)}
            placeholder="Ворота 5"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="delivery_date">Дата сдачи <span className="text-red-500">*</span></Label>
          <Input
            id="delivery_date"
            type="date"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="delivery_time">Время сдачи <span className="text-red-500">*</span></Label>
          <Input
            id="delivery_time"
            type="time"
            value={deliveryTime}
            onChange={(e) => setDeliveryTime(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vehicle_brand">Марка автомобиля <span className="text-red-500">*</span></Label>
          <Input
            id="vehicle_brand"
            value={vehicleBrand}
            onChange={(e) => setVehicleBrand(e.target.value)}
            placeholder="КАМАЗ 65117"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vehicle_number">Госномер <span className="text-red-500">*</span></Label>
          <Input
            id="vehicle_number"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value)}
            placeholder="А123БВ777"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="driver_full_name">ФИО водителя <span className="text-red-500">*</span></Label>
        <Input
          id="driver_full_name"
          value={driverFullName}
          onChange={(e) => setDriverFullName(e.target.value)}
          placeholder="Иванов Иван Иванович"
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="vehicle_photo">
          Фото автомобиля у ворот/склада с госномером <span className="text-red-500">*</span>
        </Label>
        <Input
          id="vehicle_photo"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleVehiclePhotoChange}
          className="cursor-pointer"
        />

        {vehiclePhotoPreview && (
          <div className="relative">
            <img
              src={vehiclePhotoPreview}
              alt="Автомобиль у склада"
              className="w-full h-48 object-cover rounded-xl border-2 border-green-500/30"
            />
            <div className="absolute top-3 right-3 bg-green-500/90 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Icon name="CheckCircle" size={14} />
              Загружено
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Label htmlFor="additional_photos">
          Другие фото (при наличии)
        </Label>
        <p className="text-xs text-muted-foreground">
          Фото документов, накладных, подписи приёмки
        </p>
        <Input
          id="additional_photos"
          type="file"
          accept="image/*"
          multiple
          onChange={handleAdditionalPhotosChange}
          className="cursor-pointer"
        />

        {additionalPhotoPreviews.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {additionalPhotoPreviews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Дополнительное фото ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 p-0"
                  onClick={() => removeAdditionalPhoto(index)}
                >
                  <Icon name="X" size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 flex gap-3">
        <Icon name="Info" size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-400 space-y-1">
          <p className="font-medium">Требуется:</p>
          <ul className="list-disc list-inside text-xs space-y-0.5">
            <li>Фото автомобиля у ворот/склада с видимым госномером</li>
            <li>При наличии: фото груза на складе, накладная, подпись приёмки</li>
          </ul>
        </div>
      </div>

      <Button
        onClick={uploadReport}
        disabled={!vehiclePhoto || uploading}
        className="w-full"
        size="lg"
      >
        {uploading ? (
          <>
            <Icon name="Loader" size={20} className="mr-2 animate-spin" />
            Отправка отчёта...
          </>
        ) : (
          <>
            <Icon name="Upload" size={20} className="mr-2" />
            Завершить доставку
          </>
        )}
      </Button>
    </Card>
  );
}