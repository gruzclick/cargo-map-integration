import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface AdBanner {
  id: string;
  title: string;
  description: string;
  linkUrl: string;
  backgroundColor: string;
  textColor: string;
  active: boolean;
}

export default function AdminAds() {
  const [ads, setAds] = useState<AdBanner[]>([]);
  const [editingAd, setEditingAd] = useState<AdBanner | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const savedAds = localStorage.getItem('ad_banners');
    if (savedAds) {
      setAds(JSON.parse(savedAds));
    } else {
      const defaultAds: AdBanner[] = [
        {
          id: '1',
          title: 'Страхование грузов',
          description: 'Защитите ваш груз от рисков. Оформление за 5 минут!',
          linkUrl: 'https://example.com/insurance',
          backgroundColor: '#3B82F6',
          textColor: '#FFFFFF',
          active: true
        },
        {
          id: '2',
          title: 'GPS-трекеры для транспорта',
          description: 'Отслеживайте груз в реальном времени. Скидка 20%!',
          linkUrl: 'https://example.com/gps',
          backgroundColor: '#10B981',
          textColor: '#FFFFFF',
          active: true
        },
        {
          id: '3',
          title: 'Топливные карты для водителей',
          description: 'Экономия до 15% на топливе по всей России',
          linkUrl: 'https://example.com/fuel',
          backgroundColor: '#F59E0B',
          textColor: '#FFFFFF',
          active: true
        }
      ];
      setAds(defaultAds);
      localStorage.setItem('ad_banners', JSON.stringify(defaultAds));
    }
  }, []);

  const saveAds = (newAds: AdBanner[]) => {
    setAds(newAds);
    localStorage.setItem('ad_banners', JSON.stringify(newAds));
  };

  const handleAddAd = () => {
    setEditingAd({
      id: Date.now().toString(),
      title: '',
      description: '',
      linkUrl: '',
      backgroundColor: '#3B82F6',
      textColor: '#FFFFFF',
      active: true
    });
    setShowForm(true);
  };

  const handleEditAd = (ad: AdBanner) => {
    setEditingAd(ad);
    setShowForm(true);
  };

  const handleSaveAd = () => {
    if (!editingAd) return;

    const existingIndex = ads.findIndex(ad => ad.id === editingAd.id);
    if (existingIndex >= 0) {
      const newAds = [...ads];
      newAds[existingIndex] = editingAd;
      saveAds(newAds);
    } else {
      saveAds([...ads, editingAd]);
    }

    setShowForm(false);
    setEditingAd(null);
  };

  const handleDeleteAd = (id: string) => {
    if (window.confirm('Удалить этот баннер?')) {
      saveAds(ads.filter(ad => ad.id !== id));
    }
  };

  const handleToggleActive = (id: string) => {
    saveAds(ads.map(ad => 
      ad.id === id ? { ...ad, active: !ad.active } : ad
    ));
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Управление рекламой</h1>
            <p className="text-muted-foreground mt-1">
              Добавляйте и редактируйте рекламные баннеры
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddAd}>
              <Icon name="Plus" size={18} className="mr-2" />
              Добавить баннер
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (window.confirm('Очистить все демо-данные? Это действие нельзя отменить.')) {
                  localStorage.removeItem('ad_banners');
                  window.location.reload();
                }
              }}
            >
              <Icon name="Trash2" size={18} className="mr-2" />
              Очистить демо-данные
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              <Icon name="ArrowLeft" size={18} className="mr-2" />
              На главную
            </Button>
          </div>
        </div>

        {showForm && editingAd && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {ads.find(ad => ad.id === editingAd.id) ? 'Редактировать' : 'Добавить'} баннер
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Заголовок</label>
                <input
                  type="text"
                  value={editingAd.title}
                  onChange={(e) => setEditingAd({ ...editingAd, title: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  placeholder="Страхование грузов"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Описание</label>
                <input
                  type="text"
                  value={editingAd.description}
                  onChange={(e) => setEditingAd({ ...editingAd, description: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  placeholder="Защитите ваш груз от рисков..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ссылка</label>
                <input
                  type="url"
                  value={editingAd.linkUrl}
                  onChange={(e) => setEditingAd({ ...editingAd, linkUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  placeholder="https://example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Цвет фона</label>
                  <input
                    type="color"
                    value={editingAd.backgroundColor}
                    onChange={(e) => setEditingAd({ ...editingAd, backgroundColor: e.target.value })}
                    className="w-full h-10 rounded-md cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Цвет текста</label>
                  <input
                    type="color"
                    value={editingAd.textColor}
                    onChange={(e) => setEditingAd({ ...editingAd, textColor: e.target.value })}
                    className="w-full h-10 rounded-md cursor-pointer"
                  />
                </div>
              </div>

              <div className="border border-border rounded-lg p-4">
                <p className="text-sm font-medium mb-3">Превью:</p>
                <div
                  className="h-12 px-4 rounded-lg flex items-center gap-2 justify-between"
                  style={{
                    backgroundColor: editingAd.backgroundColor,
                    color: editingAd.textColor
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Icon name="Megaphone" size={16} />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold truncate">
                        {editingAd.title || 'Заголовок'}
                      </div>
                      <div className="text-xs opacity-90 truncate">
                        {editingAd.description || 'Описание'}
                      </div>
                    </div>
                  </div>
                  <Icon name="ExternalLink" size={14} className="opacity-70" />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveAd} disabled={!editingAd.title || !editingAd.linkUrl}>
                  <Icon name="Save" size={18} className="mr-2" />
                  Сохранить
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingAd(null);
                  }}
                >
                  Отмена
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {ads.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Icon name="Megaphone" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Нет баннеров. Добавьте первый!
                </p>
              </CardContent>
            </Card>
          ) : (
            ads.map((ad) => (
              <Card key={ad.id}>
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="flex-1 h-16 px-4 rounded-lg flex items-center gap-2 justify-between"
                      style={{
                        backgroundColor: ad.backgroundColor,
                        color: ad.textColor,
                        opacity: ad.active ? 1 : 0.5
                      }}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Icon name="Megaphone" size={16} />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold truncate">{ad.title}</div>
                          <div className="text-xs opacity-90 truncate">{ad.description}</div>
                        </div>
                      </div>
                      <Icon name="ExternalLink" size={14} className="opacity-70" />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant={ad.active ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleToggleActive(ad.id)}
                      >
                        <Icon name={ad.active ? 'Eye' : 'EyeOff'} size={16} />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEditAd(ad)}>
                        <Icon name="Edit" size={16} />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteAd(ad.id)}
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Info" size={20} />
              Как это работает
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p><strong>Ротация баннеров:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>10 секунд — название сайта</li>
              <li>10 секунд — рекламный баннер №1</li>
              <li>10 секунд — название сайта</li>
              <li>10 секунд — рекламный баннер №2</li>
              <li>И так далее по кругу...</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Показываются только активные баннеры (с иконкой глаза).
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}