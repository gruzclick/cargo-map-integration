import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <Icon name="ArrowLeft" size={20} className="mr-2" />
          Назад
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl">
              Политика конфиденциальности
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Общие положения</h2>
              <p className="text-muted-foreground">
                Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных пользователей сервиса. Используя наш сервис, вы соглашаетесь с условиями данной политики.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Сбор данных</h2>
              <p className="text-muted-foreground mb-2">
                Мы можем собирать следующие типы информации:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Номер телефона для регистрации и авторизации</li>
                <li>Email-адрес (при указании пользователем)</li>
                <li>Геолокационные данные (при согласии пользователя)</li>
                <li>Информация о грузах и заказах</li>
                <li>Техническая информация (IP-адрес, тип устройства, браузер)</li>
                <li>Рейтинги и отзывы</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Использование данных</h2>
              <p className="text-muted-foreground mb-2">
                Собранные данные используются для:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Предоставления доступа к функционалу сервиса</li>
                <li>Связи между заказчиками и исполнителями</li>
                <li>Улучшения качества сервиса</li>
                <li>Отправки уведомлений о заказах и обновлениях</li>
                <li>Предотвращения мошенничества и нарушений</li>
                <li>Выполнения требований законодательства</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Защита данных</h2>
              <p className="text-muted-foreground">
                Мы применяем современные технические и организационные меры для защиты ваших данных от несанкционированного доступа, утраты или изменения. Однако ни один метод передачи данных через интернет не является абсолютно безопасным.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Передача данных третьим лицам</h2>
              <p className="text-muted-foreground mb-2">
                Мы не продаём и не передаём ваши персональные данные третьим лицам, за исключением следующих случаев:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>С вашего явного согласия</li>
                <li>Для исполнения заказов (передача контактов между заказчиком и перевозчиком)</li>
                <li>По требованию государственных органов в рамках законодательства</li>
                <li>При использовании сторонних сервисов (карты, платежи, аналитика) в соответствии с их политикой</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Файлы cookie</h2>
              <p className="text-muted-foreground">
                Мы используем cookie и аналогичные технологии для улучшения работы сервиса, запоминания предпочтений пользователя и анализа трафика. Вы можете отключить cookie в настройках браузера, но это может ограничить функциональность сервиса.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Ваши права</h2>
              <p className="text-muted-foreground mb-2">
                Вы имеете право:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Получить доступ к своим персональным данным</li>
                <li>Исправить неточные или неполные данные</li>
                <li>Удалить свои данные (право на забвение)</li>
                <li>Ограничить обработку данных</li>
                <li>Возразить против обработки данных</li>
                <li>Получить копию данных в структурированном формате</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                Для реализации своих прав свяжитесь с нами через форму обратной связи в приложении.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Хранение данных</h2>
              <p className="text-muted-foreground">
                Мы храним ваши персональные данные до тех пор, пока это необходимо для предоставления услуг, выполнения требований законодательства или до момента вашего запроса на удаление данных.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Дети</h2>
              <p className="text-muted-foreground">
                Наш сервис не предназначен для лиц младше 18 лет. Мы сознательно не собираем персональные данные детей. Если вам стало известно, что ребёнок предоставил нам свои данные, пожалуйста, сообщите нам об этом.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Изменения в политике</h2>
              <p className="text-muted-foreground">
                Мы оставляем за собой право изменять данную политику конфиденциальности. О существенных изменениях мы уведомим вас через сервис или по email. Продолжение использования сервиса после изменений означает ваше согласие с обновлённой политикой.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. Ограничение ответственности</h2>
              <p className="text-muted-foreground">
                Администрация сервиса не несёт ответственности за:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mb-2">
                <li>Достоверность информации, размещённой пользователями</li>
                <li>Действия пользователей и последствия сделок между ними</li>
                <li>Убытки, возникшие в результате использования или невозможности использования сервиса</li>
                <li>Несанкционированный доступ к данным в результате действий пользователя (передача пароля третьим лицам, вирусы и т.д.)</li>
                <li>Технические сбои, не зависящие от администрации</li>
                <li>Действия третьих лиц (мошенничество, недобросовестность контрагентов)</li>
              </ul>
              <p className="text-muted-foreground">
                Пользователь самостоятельно несёт ответственность за безопасность своих данных и проявление должной осмотрительности при использовании сервиса.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">12. Отказ от гарантий</h2>
              <p className="text-muted-foreground">
                Сервис предоставляется "как есть". Мы не гарантируем бесперебойную работу, отсутствие ошибок или соответствие ваших ожиданиям. Пользователь использует сервис на свой риск.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">13. Контакты</h2>
              <p className="text-muted-foreground">
                По вопросам, связанным с обработкой персональных данных и данной политикой конфиденциальности, вы можете связаться с нами через форму обратной связи в приложении или написать в наше сообщество: https://t.me/+QgiLIa1gFRY4Y2Iy
              </p>
            </section>

            <section className="bg-muted/50 p-4 rounded-lg border">
              <p className="text-sm text-muted-foreground">
                Используя данный сервис, вы подтверждаете, что ознакомились с настоящей Политикой конфиденциальности и согласны с её условиями. Если вы не согласны с условиями, пожалуйста, прекратите использование сервиса.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
