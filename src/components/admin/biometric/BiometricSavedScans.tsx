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
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-muted-foreground">
            <Icon name="Image" size={24} />
            Сохранённые биометрические снимки
          </CardTitle>
          <CardDescription>
            Биометрия пока не настроена
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="ScanFace" size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">Отсканируйте лицо или радужку для настройки биометрического доступа</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-500/30 bg-green-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Image" size={24} className="text-green-600 dark:text-green-400" />
          Сохранённые биометрические снимки
        </CardTitle>
        <CardDescription>
          Просмотр зарегистрированных биометрических данных
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faceTemplate && (
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Icon name="ScanFace" size={18} className="text-blue-600" />
                Снимок лица
              </Label>
              <div className="relative rounded-xl overflow-hidden border-2 border-green-500/50 shadow-lg">
                <img 
                  src={faceTemplate} 
                  alt="Face scan" 
                  className="w-full h-auto object-cover aspect-square"
                />
                <div className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg flex items-center gap-1">
                  <Icon name="CheckCircle2" size={14} />
                  Активен
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <p className="text-white text-xs font-medium">Зарегистрирован</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onRescanFace}
                className="w-full border-blue-500/50 hover:bg-blue-500/10"
              >
                <Icon name="RefreshCw" size={16} className="mr-2" />
                Пересканировать лицо
              </Button>
            </div>
          )}
          {irisTemplate && (
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Icon name="Eye" size={18} className="text-purple-600" />
                Снимок радужки
              </Label>
              <div className="relative rounded-xl overflow-hidden border-2 border-green-500/50 shadow-lg">
                <img 
                  src={irisTemplate} 
                  alt="Iris scan" 
                  className="w-full h-auto object-cover aspect-square"
                />
                <div className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg flex items-center gap-1">
                  <Icon name="CheckCircle2" size={14} />
                  Активен
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <p className="text-white text-xs font-medium">Зарегистрирован</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onRescanIris}
                className="w-full border-purple-500/50 hover:bg-purple-500/10"
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