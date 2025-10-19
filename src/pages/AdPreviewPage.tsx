import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdPreview from '@/components/AdPreview';
import Icon from '@/components/ui/icon';

export default function AdPreviewPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Превью рекламы</h1>
              <p className="text-sm text-muted-foreground">
                Посмотрите как будет выглядеть реклама на сайте
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => window.location.href = '/admin/ads'}>
                <Icon name="Settings" size={18} className="mr-2" />
                Управление
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                <Icon name="ArrowLeft" size={18} className="mr-2" />
                На главную
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Monitor" size={20} />
              Десктоп версия (хедер сайта)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-6 border-2 border-dashed border-border">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-foreground rounded-xl flex items-center justify-center">
                      <Icon name="Truck" size={18} className="text-background" />
                    </div>
                    <div className="text-xs text-muted-foreground">Логотип</div>
                  </div>
                  
                  <div className="flex-1 max-w-md border-2 border-primary rounded-lg overflow-hidden">
                    <AdPreview variant="desktop" />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-xs text-muted-foreground">Кнопки →</div>
                  </div>
                </div>
                
                <div className="text-center text-sm text-muted-foreground">
                  ↑ Область между логотипом и кнопками
                </div>
              </div>

              <div className="flex items-start gap-2 text-sm">
                <Icon name="Info" size={16} className="text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium">Алгоритм показа:</p>
                  <ul className="list-disc list-inside text-muted-foreground mt-1 space-y-1">
                    <li>10 секунд — название сайта "Логистика Грузоперевозок"</li>
                    <li>10 секунд — рекламный баннер №1 (синий)</li>
                    <li>10 секунд — название сайта</li>
                    <li>10 секунд — рекламный баннер №2 (зелёный)</li>
                    <li>10 секунд — название сайта</li>
                    <li>10 секунд — рекламный баннер №3 (оранжевый)</li>
                    <li>И так по кругу...</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Smartphone" size={20} />
              Мобильная версия (между названием и грузами)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="max-w-sm mx-auto border-4 border-border rounded-3xl overflow-hidden shadow-2xl">
                <div className="bg-background">
                  <div className="bg-card border-b border-border px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
                          <Icon name="Truck" size={16} className="text-background" />
                        </div>
                        <span className="text-sm font-semibold">Логистика</span>
                      </div>
                      <div className="flex gap-1">
                        <div className="w-6 h-6 rounded-full bg-muted"></div>
                        <div className="w-6 h-6 rounded-full bg-muted"></div>
                      </div>
                    </div>
                  </div>

                  <div className="border-2 border-primary rounded-lg m-4">
                    <AdPreview variant="mobile" />
                  </div>

                  <div className="px-4 pb-4">
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <div className="text-xs font-semibold text-muted-foreground">
                        📦 Грузы ожидают (список ниже)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="max-w-sm mx-auto text-center text-sm text-muted-foreground">
                ↑ Реклама появляется между хедером и списком грузов
              </div>

              <div className="flex items-start gap-2 text-sm">
                <Icon name="Info" size={16} className="text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium">Тот же алгоритм:</p>
                  <p className="text-muted-foreground">
                    10 секунд название сайта → 10 секунд реклама → и так далее
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
              <Icon name="AlertTriangle" size={20} />
              Важно!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              <strong>Это только превью!</strong> Реклама НЕ внедрена на реальный сайт.
            </p>
            <p>
              Чтобы внедрить рекламу:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-4">
              <li>Перейдите в <strong>Управление рекламой</strong></li>
              <li>Добавьте/отредактируйте баннеры</li>
              <li>Включите реальное отображение на сайте (я добавлю эту функцию)</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
