import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';

export default function TermsOfService() {
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
              Пользовательское соглашение
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Характер платформы</h2>
              <p className="text-muted-foreground">
                Информационная платформа "Груз Клик" предназначена для предоставления информации клиентов и перевозчиков 
                о доступных услугах. Платформа не является перевозчиком, не организует перевозки 
                и не несет ответственности за действия пользователей.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Ответственность сторон</h2>
              <p className="text-muted-foreground mb-2">
                <strong>Клиент обязуется:</strong> предоставить груз в готовом виде к указанному 
                в заявке времени, обеспечить правильность указанных данных о грузе (вес, габариты, адрес).
                Клиент несет полную ответственность за груз до момента передачи перевозчику и после получения.
              </p>
              <p className="text-muted-foreground">
                <strong>Перевозчик обязуется:</strong> доставить груз в указанное место в согласованное время, 
                обеспечить сохранность груза в процессе транспортировки. Перевозчик несет полную ответственность 
                за груз с момента получения до момента передачи получателю.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Разрешение споров</h2>
              <p className="text-muted-foreground">
                В случае возникновения спорных вопросов, конфликтов или претензий, решение принимается 
                непосредственно между клиентом и перевозчиком. Платформа не выступает арбитром 
                и не несет ответственности за результаты разрешения споров.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Уведомления и коммуникация</h2>
              <p className="text-muted-foreground mb-2">
                Регистрируясь на платформе, пользователь <strong>соглашается получать уведомления</strong> 
                от сайта и мобильного приложения "Груз Клик" <strong>всеми доступными способами</strong>, включая:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Push-уведомления в браузере и мобильном приложении</li>
                <li>Email-уведомления на указанную электронную почту</li>
                <li>SMS-сообщения на указанный номер телефона</li>
                <li>Уведомления в Telegram (при подключении Telegram-аккаунта)</li>
                <li>Уведомления в чате внутри платформы</li>
                <li>Любые другие способы коммуникации, применяемые платформой</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                Уведомления могут включать информацию о: новых грузах на вашем маршруте (для перевозчиков), 
                доступных перевозчиках (для клиентов), изменениях статуса заказа, важных обновлениях платформы, 
                промо-акциях и специальных предложениях. Вы можете в любой момент отключить определённые типы 
                уведомлений в настройках аккаунта.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Конфиденциальность</h2>
              <p className="text-muted-foreground">
                Платформа обязуется защищать персональные данные пользователей. Контактная информация 
                предоставляется исключительно для осуществления перевозок и не может быть использована 
                в других целях. Чаты между клиентами и перевозчиками автоматически удаляются через 30 календарных дней 
                после завершения доставки. Неактивные аккаунты удаляются через 30 календарных дней без входа в систему.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Передача данных правоохранительным органам</h2>
              <p className="text-muted-foreground mb-2">
                <strong className="text-red-500">ВАЖНО:</strong> В случае спорных ситуаций, противозаконных действий, 
                мошенничества или по официальному запросу правоохранительных органов (полиции, прокуратуры, суда), 
                администрация платформы <strong>обязана передать всю имеющуюся информацию</strong> о пользователях, включая:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Персональные данные (ФИО, паспортные данные, ИНН)</li>
                <li>Контактную информацию (телефон, email, адрес)</li>
                <li>Историю заказов и переписки</li>
                <li>Данные геолокации и маршруты</li>
                <li>Фотографии грузов и документов</li>
                <li>IP-адреса и логи активности</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                Используя платформу, вы соглашаетесь с тем, что эта информация может быть передана 
                компетентным органам в соответствии с законодательством Российской Федерации.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Ограничение ответственности платформы</h2>
              <p className="text-muted-foreground mb-2">
                <strong className="text-red-500">Платформа НЕ несет ответственности за:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Качество, безопасность и своевременность перевозки грузов</li>
                <li>Повреждение, утрату или хищение грузов в процессе транспортировки</li>
                <li>Действия клиентов и перевозчиков, их добросовестность</li>
                <li>Соответствие действительности информации, предоставленной пользователями</li>
                <li>Финансовые потери в результате сделок между пользователями</li>
                <li>Нарушение договорённостей между клиентами и перевозчиками</li>
                <li>Несоблюдение сроков доставки</li>
                <li>Неявку перевозчика или отсутствие груза</li>
                <li>Любые споры и конфликты между пользователями</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Ограничения использования</h2>
              <p className="text-muted-foreground mb-2">
                Платформа <strong>НЕ может быть использована для:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Перевозки запрещённых законом грузов</li>
                <li>Мошеннических действий</li>
                <li>Нарушения прав третьих лиц</li>
                <li>Распространения незаконной информации</li>
                <li>Любой противоправной деятельности</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                За нарушения пользователи несут полную ответственность в соответствии с законодательством.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Оплата услуг</h2>
              <p className="text-muted-foreground">
                Все финансовые расчёты между пользователями происходят напрямую. Платформа не принимает платежи 
                и не несёт ответственности за финансовые споры между клиентами и перевозчиками.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Форс-мажор</h2>
              <p className="text-muted-foreground">
                Платформа не несёт ответственности за невозможность предоставления услуг вследствие 
                технических сбоев, форс-мажорных обстоятельств или действий третьих лиц.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. Применимое право</h2>
              <p className="text-muted-foreground">
                Настоящее соглашение регулируется законодательством Российской Федерации. 
                Все споры разрешаются в судебном порядке по месту нахождения администрации платформы.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">12. Изменения соглашения</h2>
              <p className="text-muted-foreground">
                Администрация оставляет за собой право изменять условия соглашения. 
                Продолжение использования платформы после внесения изменений означает согласие с новыми условиями.
              </p>
            </section>

            <section className="bg-muted/50 p-4 rounded-lg border">
              <p className="text-sm text-muted-foreground">
                Регистрируясь на платформе, вы подтверждаете, что ознакомились с настоящим соглашением 
                и согласны с его условиями. Если вы не согласны, пожалуйста, прекратите использование сервиса.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
