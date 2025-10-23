import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface CargoPhotoUploadProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  required?: boolean;
}

const CargoPhotoUpload = ({ photos, onPhotosChange, required = false }: CargoPhotoUploadProps) => {
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const filePromises = Array.from(files).map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });
      
      Promise.all(filePromises).then(base64Images => {
        onPhotosChange([...photos, ...base64Images]);
      });
    }
  };

  const removePhoto = (index: number) => {
    onPhotosChange(photos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="cargo_photo">Фото груза (можно выбрать несколько) *</Label>
      <div className="relative">
        <Input
          id="cargo_photo"
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          multiple
          required={required && photos.length === 0}
          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
        />
        <Button
          type="button"
          variant="outline"
          className="w-full pointer-events-none"
        >
          <Icon name="Upload" size={18} className="mr-2" />
          {photos.length === 0 ? 'Выбрать файлы' : `Выбрано файлов: ${photos.length}`}
        </Button>
      </div>
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
          {photos.map((photo, index) => (
            <div key={index} className="relative group">
              <img
                src={photo}
                alt={`Груз ${index + 1}`}
                className="w-full h-32 object-cover rounded-xl border border-border"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8"
                onClick={() => removePhoto(index)}
              >
                <Icon name="X" size={16} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CargoPhotoUpload;
