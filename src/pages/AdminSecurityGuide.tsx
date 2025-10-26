import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

export default function AdminSecurityGuide() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => window.history.back()}>
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Icon name="ShieldCheck" size={32} />
              Руководство по безопасности
            </h1>
            <p className="text-muted-foreground text-sm">Защита админ-панели и данных пользователей</p>
          </div>
        </div>

        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900 dark:text-red-100">
              <Icon name="AlertTriangle" size={24} />
              Критически важно
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-red-800 dark:text-red-200">
            <div className="flex items-start gap-2">
              <Icon name="Check" size={16} className="mt-0.5 flex-shrink-0" />
              <p>Всегда используйте биометрию или 2FA для входа</p>
            </div>
            <div className="flex items-start gap-2">
              <Icon name="Check" size={16} className="mt-0.5 flex-shrink-0" />
              <p>Меняйте пароль каждые 90 дней</p>
            </div>
            <div className="flex items-start gap-2">
              <Icon name="Check" size={16} className="mt-0.5 flex-shrink-0" />
              <p>Никогда не делитесь учетными данными</p>
            </div>
            <div className="flex items-start gap-2">
              <Icon name="Check" size={16} className="mt-0.5 flex-shrink-0" />
              <p>Проверяйте логи на подозрительную активность еженедельно</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Key" size={20} />
              Аутентификация
            </CardTitle>
            <CardDescription>Методы входа и защита учетной записи</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="Fingerprint" size={20} className="text-green-600" />
                  <h3 className="font-semibold">Биометрия</h3>
                  <Badge variant="default">Рекомендуется</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Отпечаток пальца или Face ID — самый безопасный метод. Настройте в разделе "Безопасность".
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="Lock" size={20} className="text-blue-600" />
                  <h3 className="font-semibold">Сильный пароль</h3>
                  <Badge variant="secondary">Обязательно</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Минимум 12 символов: буквы (A-z), цифры (0-9), спецсимволы (!@#$%)
                </p>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-sm text-amber-900 dark:text-amber-100">
                <Icon name="Info" size={16} className="inline mr-2" />
                <strong>Совет:</strong> Используйте менеджер паролей (1Password, Bitwarden) для генерации и хранения паролей
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Shield" size={20} />
              Защита от атак
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <Icon name="AlertOctagon" size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Фишинг и социальная инженерия</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Никогда не переходите по ссылкам из подозрительных писем. 
                  Всегда проверяйте URL адрес админ-панели перед вводом данных.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <Icon name="Wifi" size={20} className="text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Публичный Wi-Fi</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Избегайте входа в админ-панель через публичные сети. 
                  Используйте VPN для дополнительной защиты.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <Icon name="Monitor" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Публичные компьютеры</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Никогда не входите в админ-панель с чужих устройств. 
                  Всегда выходите из системы после завершения работы.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Eye" size={20} />
              Признаки взлома
            </CardTitle>
            <CardDescription>Немедленно обратитесь к системному администратору если заметили:</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Icon name="AlertCircle" size={16} className="text-red-600" />
                <p>Вход в аккаунт в нестандартное время или с незнакомого устройства</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Icon name="AlertCircle" size={16} className="text-red-600" />
                <p>Изменения настроек которые вы не делали</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Icon name="AlertCircle" size={16} className="text-red-600" />
                <p>Множество неудачных попыток входа в логах</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Icon name="AlertCircle" size={16} className="text-red-600" />
                <p>Удаление или изменение данных без вашего ведома</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Icon name="AlertCircle" size={16} className="text-red-600" />
                <p>Необычная активность в разделах куда вы не заходили</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="CheckCircle" size={20} />
              Ежедневный чеклист безопасности
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="w-4 h-4" />
                <p>Проверил, что вышел из админ-панели на всех устройствах</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="w-4 h-4" />
                <p>Просмотрел последние действия в системе</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="w-4 h-4" />
                <p>Обновил программное обеспечение (браузер, ОС)</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="w-4 h-4" />
                <p>Проверил резервные копии данных</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
              <Icon name="BookOpen" size={20} />
              Дополнительные материалы
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Button variant="link" className="h-auto p-0 text-green-700 dark:text-green-300" asChild>
              <a href="/ADMIN_SECURITY.md" target="_blank">
                <Icon name="FileText" size={16} className="mr-2" />
                Полное руководство по безопасности (ADMIN_SECURITY.md)
              </a>
            </Button>
            <Button variant="link" className="h-auto p-0 text-green-700 dark:text-green-300" asChild>
              <a href="https://owasp.org/www-project-top-ten/" target="_blank">
                <Icon name="ExternalLink" size={16} className="mr-2" />
                OWASP Top 10 — главные уязвимости
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
