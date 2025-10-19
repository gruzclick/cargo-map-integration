import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import QRCodeGenerator from '@/components/QRCodeGenerator';

export default function QRPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">QR-код для доступа</h1>
              <p className="text-sm text-muted-foreground">
                Быстрый доступ к сайту через камеру телефона
              </p>
            </div>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              <Icon name="ArrowLeft" size={18} className="mr-2" />
              На главную
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <QRCodeGenerator />
      </div>
    </div>
  );
}
