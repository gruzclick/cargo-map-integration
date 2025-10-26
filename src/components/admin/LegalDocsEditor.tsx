import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const PRIVACY_POLICY_DEFAULT = `# Политика конфиденциальности

Последнее обновление: ${new Date().toLocaleDateString('ru-RU')}

## 1. Общие положения
Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных пользователей сервиса.

## 2. Сбор данных
Мы собираем:
- Номер телефона для регистрации
- Email-адрес
- Геолокационные данные
- Информация о грузах и заказах
- Техническая информация

## 3. Использование данных
Данные используются для предоставления услуг сервиса.

## 4. Защита данных
Мы применяем современные методы защиты информации.

## 5. Контакты
Email: support@gruzclick.ru`;

const TERMS_OF_SERVICE_DEFAULT = `# Пользовательское соглашение

Последнее обновление: ${new Date().toLocaleDateString('ru-RU')}

## 1. Характер платформы
Информационная платформа "Груз Клик" предназначена для предоставления информации о доступных услугах.

## 2. Ответственность сторон

**Клиент обязуется:** предоставить груз в готовом виде, обеспечить правильность данных.

**Перевозчик обязуется:** доставить груз в указанное место, обеспечить сохранность груза.

## 3. Условия использования
Пользователи обязуются соблюдать правила платформы.

## 4. Контакты
Email: support@gruzclick.ru`;

export const LegalDocsEditor = () => {
  const { toast } = useToast();
  const [privacyPolicy, setPrivacyPolicy] = useState('');
  const [termsOfService, setTermsOfService] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = () => {
    setLoading(true);
    try {
      const savedPrivacy = localStorage.getItem('legal_privacy_policy');
      const savedTerms = localStorage.getItem('legal_terms_of_service');

      setPrivacyPolicy(savedPrivacy || PRIVACY_POLICY_DEFAULT);
      setTermsOfService(savedTerms || TERMS_OF_SERVICE_DEFAULT);
    } catch (error) {
      console.error('Ошибка загрузки документов:', error);
      setPrivacyPolicy(PRIVACY_POLICY_DEFAULT);
      setTermsOfService(TERMS_OF_SERVICE_DEFAULT);
    } finally {
      setLoading(false);
    }
  };

  const savePrivacyPolicy = () => {
    setSaving(true);
    try {
      localStorage.setItem('legal_privacy_policy', privacyPolicy);
      localStorage.setItem('legal_privacy_last_updated', new Date().toISOString());
      
      toast({
        title: 'Сохранено',
        description: 'Политика конфиденциальности обновлена'
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить изменения',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const saveTermsOfService = () => {
    setSaving(true);
    try {
      localStorage.setItem('legal_terms_of_service', termsOfService);
      localStorage.setItem('legal_terms_last_updated', new Date().toISOString());
      
      toast({
        title: 'Сохранено',
        description: 'Пользовательское соглашение обновлено'
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить изменения',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const resetPrivacyPolicy = () => {
    setPrivacyPolicy(PRIVACY_POLICY_DEFAULT);
    toast({
      title: 'Сброшено',
      description: 'Восстановлен текст по умолчанию'
    });
  };

  const resetTermsOfService = () => {
    setTermsOfService(TERMS_OF_SERVICE_DEFAULT);
    toast({
      title: 'Сброшено',
      description: 'Восстановлен текст по умолчанию'
    });
  };

  const downloadPrivacyPolicy = () => {
    const blob = new Blob([privacyPolicy], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'privacy-policy.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadTermsOfService = () => {
    const blob = new Blob([termsOfService], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'terms-of-service.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 flex items-center justify-center">
          <Icon name="Loader2" size={32} className="animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Icon name="FileText" size={24} />
              Редактор юридических документов
            </CardTitle>
            <CardDescription className="mt-2">
              Редактируйте файлы: src/pages/PrivacyPolicy.tsx и src/pages/TermsOfService.tsx
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            <Icon name="Clock" size={12} className="mr-1" />
            Авто-сохранение
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="privacy" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="privacy">Политика конфиденциальности</TabsTrigger>
            <TabsTrigger value="terms">Пользовательское соглашение</TabsTrigger>
          </TabsList>

          <TabsContent value="privacy" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="privacy-content" className="text-base font-medium">
                src/pages/PrivacyPolicy.tsx
              </Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadPrivacyPolicy}
                >
                  <Icon name="Download" size={16} className="mr-2" />
                  Скачать
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetPrivacyPolicy}
                >
                  <Icon name="RotateCcw" size={16} className="mr-2" />
                  Сброс
                </Button>
              </div>
            </div>

            <Textarea
              id="privacy-content"
              value={privacyPolicy}
              onChange={(e) => setPrivacyPolicy(e.target.value)}
              className="min-h-[500px] font-mono text-sm"
              placeholder="Введите текст политики конфиденциальности..."
            />

            <div className="flex items-center gap-2">
              <Button
                onClick={savePrivacyPolicy}
                disabled={saving}
                className="flex-1"
              >
                {saving ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Icon name="Save" size={16} className="mr-2" />
                    Сохранить изменения
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="terms" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="terms-content" className="text-base font-medium">
                src/pages/TermsOfService.tsx
              </Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadTermsOfService}
                >
                  <Icon name="Download" size={16} className="mr-2" />
                  Скачать
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetTermsOfService}
                >
                  <Icon name="RotateCcw" size={16} className="mr-2" />
                  Сброс
                </Button>
              </div>
            </div>

            <Textarea
              id="terms-content"
              value={termsOfService}
              onChange={(e) => setTermsOfService(e.target.value)}
              className="min-h-[500px] font-mono text-sm"
              placeholder="Введите текст пользовательского соглашения..."
            />

            <div className="flex items-center gap-2">
              <Button
                onClick={saveTermsOfService}
                disabled={saving}
                className="flex-1"
              >
                {saving ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Icon name="Save" size={16} className="mr-2" />
                    Сохранить изменения
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
