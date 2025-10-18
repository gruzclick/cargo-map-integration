import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import Icon from '@/components/ui/icon';

interface DeliveryReportFormProps {
  orderId: string;
  driverId: string;
  onSubmit?: () => void;
}

export function DeliveryReportForm({ orderId, driverId, onSubmit }: DeliveryReportFormProps) {
  const { t } = useTranslation();
  const [warehouse, setWarehouse] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [gateNumber, setGateNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos([...photos, ...Array.from(e.target.files)]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const submitReport = async () => {
    if (!warehouse || !date || !time || !vehicleMake || !vehicleNumber || !driverName || photos.length === 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('order_id', orderId);
      formData.append('driver_id', driverId);
      formData.append('warehouse', warehouse);
      formData.append('delivery_date', date);
      formData.append('delivery_time', time);
      formData.append('vehicle_make', vehicleMake);
      formData.append('vehicle_number', vehicleNumber);
      formData.append('gate_number', gateNumber);
      formData.append('driver_name', driverName);
      
      photos.forEach((photo) => {
        formData.append('photos', photo);
      });

      const response = await fetch('/api/delivery-reports/submit', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        onSubmit?.();
      }
    } catch (error) {
      console.error('Failed to submit delivery report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = warehouse && date && time && vehicleMake && vehicleNumber && driverName && photos.length > 0;

  return (
    <Card className="p-6 bg-white dark:bg-gray-900 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Icon name="FileText" className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{t('deliveryReport.title')}</h3>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        {t('deliveryReport.subtitle')}
      </p>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">
            {t('deliveryReport.warehouse')} *
          </label>
          <Input
            value={warehouse}
            onChange={(e) => setWarehouse(e.target.value)}
            placeholder={t('deliveryReport.warehousePlaceholder')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">
              {t('deliveryReport.date')} *
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">
              {t('deliveryReport.time')} *
            </label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">
              {t('deliveryReport.vehicleMake')} *
            </label>
            <Input
              value={vehicleMake}
              onChange={(e) => setVehicleMake(e.target.value)}
              placeholder={t('deliveryReport.vehicleMakePlaceholder')}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">
              {t('deliveryReport.vehicleNumber')} *
            </label>
            <Input
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              placeholder={t('deliveryReport.vehicleNumberPlaceholder')}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">
            {t('deliveryReport.gateNumber')}
          </label>
          <Input
            value={gateNumber}
            onChange={(e) => setGateNumber(e.target.value)}
            placeholder={t('deliveryReport.gateNumberPlaceholder')}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">
            {t('deliveryReport.driverName')} *
          </label>
          <Input
            value={driverName}
            onChange={(e) => setDriverName(e.target.value)}
            placeholder={t('deliveryReport.driverNamePlaceholder')}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">
            {t('deliveryReport.uploadPhoto')} *
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            {t('deliveryReport.photoRequirement')}
          </p>
          <div className="space-y-2">
            {photos.map((photo, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <Icon name="Image" size={16} className="text-gray-500" />
                  <span className="text-sm truncate text-gray-700 dark:text-gray-300">{photo.name}</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removePhoto(index)}
                >
                  <Icon name="X" size={16} />
                </Button>
              </div>
            ))}
            <label className="flex items-center gap-2 p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <Icon name="Upload" size={18} className="text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {photos.length === 0 ? t('deliveryReport.uploadPhoto') : 'Добавить ещё фото'}
              </span>
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <Button
          onClick={submitReport}
          disabled={!isFormValid || isSubmitting}
          className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900"
        >
          {isSubmitting ? (
            <>
              <Icon name="Loader2" className="animate-spin mr-2" size={16} />
              Отправка...
            </>
          ) : (
            t('deliveryReport.submit')
          )}
        </Button>
      </div>
    </Card>
  );
}
