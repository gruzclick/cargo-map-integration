import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface BiometricSavedScansProps {
  faceTemplate?: string;
  irisTemplate?: string;
  onRescanFace: () => void;
  onRescanIris: () => void;
}

export const BiometricSavedScans = ({ 
  faceTemplate, 
  irisTemplate,
  onRescanFace,
  onRescanIris
}: BiometricSavedScansProps) => {
  if (!faceTemplate && !irisTemplate) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Image" size={24} className="text-purple-600" />
          Сохранённые биометрические снимки
        </CardTitle>
        <CardDescription>
          Просмотр зарегистрированных биометрических данных
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faceTemplate && (
            <div className="space-y-2">
              <Label>Снимок лица</Label>
              <div className="relative rounded-lg overflow-hidden border">
                <img 
                  src={faceTemplate} 
                  alt="Face scan" 
                  className="w-full h-auto"
                />
                <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                  Активен
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onRescanFace}
                className="w-full"
              >
                <Icon name="RefreshCw" size={16} className="mr-2" />
                Пересканировать лицо
              </Button>
            </div>
          )}
          {irisTemplate && (
            <div className="space-y-2">
              <Label>Снимок радужки</Label>
              <div className="relative rounded-lg overflow-hidden border">
                <img 
                  src={irisTemplate} 
                  alt="Iris scan" 
                  className="w-full h-auto"
                />
                <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                  Активен
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onRescanIris}
                className="w-full"
              >
                <Icon name="RefreshCw" size={16} className="mr-2" />
                Пересканировать радужку
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
