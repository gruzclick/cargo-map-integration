import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TermsAgreementProps {
  onAccept: () => void;
  onDecline: () => void;
}

const TermsAgreement = ({ onAccept, onDecline }: TermsAgreementProps) => {
  const [agreed, setAgreed] = useState(false);
  const [showFullTerms, setShowFullTerms] = useState(false);

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-accent/5">
        <Card className="w-full max-w-2xl border-0 shadow-2xl rounded-3xl">
          <CardHeader className="space-y-2 pb-4">
            <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Icon name="FileText" size={32} className="text-accent" />
            </div>
            <CardTitle className="text-3xl font-bold text-center">
              Пользовательское соглашение
            </CardTitle>
            <CardDescription className="text-center text-base">
              Информационная платформа Груз Клик
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-xl p-6 space-y-4 max-h-96 overflow-y-auto">
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Icon name="Info" size={16} className="text-accent" />
                    1. Характер платформы
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Информационная платформа "Груз Клик" предназначена для предоставления информации клиентов и перевозчиков 
                    о доступных услугах. Платформа не является перевозчиком, не организует перевозки 
                    и не несет ответственности за действия пользователей.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Icon name="Shield" size={16} className="text-accent" />
                    2. Ответственность сторон
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    <strong>Клиент обязуется:</strong> предоставить груз в готовом виде к указанному 
                    в заявке времени, обеспечить правильность указанных данных о грузе (вес, габариты, адрес).
                    Клиент несет полную ответственность за груз до момента передачи перевозчику и после получения.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-2">
                    <strong>Перевозчик обязуется:</strong> доставить груз в указанное место в согласованное время, 
                    обеспечить сохранность груза в процессе транспортировки. Перевозчик несет полную ответственность 
                    за груз с момента получения до момента передачи получателю.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Icon name="AlertTriangle" size={16} className="text-accent" />
                    3. Разрешение споров
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    В случае возникновения спорных вопросов, конфликтов или претензий, решение принимается 
                    непосредственно между клиентом и перевозчиком. Платформа не выступает арбитром 
                    и не несет ответственности за результаты разрешения споров.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Icon name="Bell" size={16} className="text-accent" />
                    4. Уведомления
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Пользователь соглашается получать уведомления о новых грузах, появившихся на его маршруте 
                    следования (для перевозчиков), или о доступных перевозчиках (для клиентов). 
                    Перевозчики получают уведомления о грузах, требующих доставки на склады, 
                    указанные в их маршруте следования.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Icon name="Lock" size={16} className="text-accent" />
                    5. Конфиденциальность
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Платформа обязуется защищать персональные данные пользователей. Контактная информация 
                    предоставляется исключительно для осуществления перевозок и не может быть использована 
                    в других целях. Чаты между клиентами и перевозчиками автоматически удаляются через 30 календарных дней 
                    после завершения доставки. Неактивные аккаунты удаляются через 30 календарных дней без входа в систему.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Icon name="Scale" size={16} className="text-red-500" />
                    6. Передача данных правоохранительным органам
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    <strong className="text-red-500">ВАЖНО:</strong> В случае спорных ситуаций, противозаконных действий, 
                    мошенничества или по официальному запросу правоохранительных органов (полиции, прокуратуры, суда), 
                    администрация платформы <strong>обязана передать всю имеющуюся информацию</strong> о пользователях, включая:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground ml-4 mt-2 space-y-1">
                    <li>Персональные данные (ФИО, паспортные данные, ИНН)</li>
                    <li>Контактную информацию (телефон, email, адрес)</li>
                    <li>Историю заказов и переписки</li>
                    <li>Данные геолокации и маршруты</li>
                    <li>Фотографии грузов и документов</li>
                    <li>IP-адреса и логи активности</li>
                  </ul>
                  <p className="text-muted-foreground leading-relaxed mt-2">
                    Используя платформу, вы соглашаетесь с тем, что эта информация может быть передана 
                    компетентным органам в соответствии с законодательством Российской Федерации.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Icon name="ShieldAlert" size={16} className="text-red-500" />
                    7. Ограничение ответственности платформы
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    <strong className="text-red-500">Платформа НЕ несет ответственности за:</strong>
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground ml-4 mt-2 space-y-1">
                    <li>Качество, безопасность и своевременность перевозки грузов</li>
                    <li>Повреждение, утрату или хищение грузов в процессе транспортировки</li>
                    <li>Достоверность информации, предоставленной пользователями</li>
                    <li>Финансовые споры между клиентами и перевозчиками</li>
                    <li>Нарушение сроков доставки или отмену заказов</li>
                    <li>Действия или бездействие пользователей платформы</li>
                    <li>Техническую исправность транспортных средств</li>
                    <li>Наличие необходимых лицензий и разрешений у перевозчиков</li>
                  </ul>
                  <p className="text-muted-foreground leading-relaxed mt-2">
                    <strong>Пользователь самостоятельно несет все риски</strong>, связанные с использованием платформы, 
                    выбором контрагентов и заключением сделок.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Icon name="UserX" size={16} className="text-red-500" />
                    8. Обязанности пользователя
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    <strong>Используя платформу, пользователь обязуется:</strong>
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground ml-4 mt-2 space-y-1">
                    <li>Предоставлять достоверную информацию о себе и грузах</li>
                    <li>Самостоятельно проверять надежность контрагентов</li>
                    <li>Заключать письменные договоры перевозки (при необходимости)</li>
                    <li>Оформлять страхование грузов (при необходимости)</li>
                    <li>Соблюдать законодательство РФ при перевозке грузов</li>
                    <li>Не использовать платформу для незаконных целей</li>
                    <li>Нести ответственность за все свои действия на платформе</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Icon name="RefreshCw" size={16} className="text-accent" />
                    9. Изменения соглашения
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Администрация платформы оставляет за собой право вносить изменения в настоящее соглашение 
                    в любое время. При внесении изменений пользователь получит уведомление при следующем входе в систему. 
                    <strong> Продолжение использования платформы после внесения изменений означает согласие с новыми условиями.</strong> 
                    Если пользователь не согласен с изменениями, он обязан прекратить использование платформы.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Icon name="FileCheck" size={16} className="text-accent" />
                    10. Принятие условий
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Регистрируясь на платформе, пользователь подтверждает, что ознакомился с настоящим 
                    соглашением, понимает и принимает все его условия, включая полную ответственность за свои 
                    действия и решения. Пользователь признает, что платформа носит исключительно информационный характер 
                    и не гарантирует результатов использования сервиса.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-accent/5 rounded-xl">
              <Checkbox 
                id="terms" 
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked === true)}
                className="mt-1"
              />
              <label
                htmlFor="terms"
                className="text-sm leading-relaxed cursor-pointer"
              >
                Я ознакомился и согласен с условиями пользовательского соглашения. 
                Я понимаю, что платформа носит информационный характер, и я несу 
                полную ответственность за свои действия как {' '}
                <button
                  onClick={() => setShowFullTerms(true)}
                  className="text-accent hover:underline font-medium"
                >
                  пользователь платформы
                </button>
              </label>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={onAccept}
                disabled={!agreed}
                className="flex-1 h-12 text-base rounded-xl"
              >
                <Icon name="Check" size={18} className="mr-2" />
                Принять и продолжить
              </Button>
              <Button
                onClick={onDecline}
                variant="outline"
                className="h-12 text-base rounded-xl"
              >
                Отклонить
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showFullTerms} onOpenChange={setShowFullTerms}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Полный текст пользовательского соглашения</DialogTitle>
            <DialogDescription>
              Информационная платформа Груз Клик
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <p className="text-muted-foreground">
              Настоящее Пользовательское соглашение регулирует отношения между 
              администрацией информационной платформы "Груз Клик" и пользователями платформы.
            </p>
            <p className="text-muted-foreground">
              Используя данную платформу, вы соглашаетесь со всеми условиями, изложенными выше, 
              и принимаете на себя полную ответственность за свои действия в рамках использования сервиса.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TermsAgreement;