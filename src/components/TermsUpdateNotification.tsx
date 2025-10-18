import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';

const TERMS_VERSION = '2.0';

interface TermsUpdateNotificationProps {
  userId: string;
}

const TermsUpdateNotification = ({ userId }: TermsUpdateNotificationProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    const acceptedVersion = localStorage.getItem(`terms_accepted_${userId}`);
    
    if (acceptedVersion !== TERMS_VERSION) {
      setShowDialog(true);
    }
  }, [userId]);

  const handleAccept = () => {
    localStorage.setItem(`terms_accepted_${userId}`, TERMS_VERSION);
    setShowDialog(false);
    setAgreed(false);
  };

  const handleDecline = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    window.location.reload();
  };

  if (!showDialog) return null;

  return (
    <Dialog open={showDialog} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" hideClose>
        <DialogHeader>
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icon name="AlertCircle" size={32} className="text-accent" />
          </div>
          <DialogTitle className="text-2xl text-center">
            Обновление пользовательского соглашения
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Версия {TERMS_VERSION} от {new Date().toLocaleDateString('ru-RU')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Icon name="Info" size={18} className="text-accent" />
              Что изменилось?
            </h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2 ml-2">
              <li>Обновлен пункт 1: уточнен характер платформы</li>
              <li>Добавлен пункт 7: ограничение ответственности платформы</li>
              <li>Добавлен пункт 8: обязанности пользователя</li>
              <li>Добавлен пункт 9: порядок изменения соглашения</li>
              <li>Усилены положения о самостоятельной ответственности пользователей</li>
            </ul>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <h4 className="font-semibold mb-2 flex items-center gap-2 text-red-700">
              <Icon name="ShieldAlert" size={18} className="text-red-600" />
              Важно!
            </h4>
            <p className="text-sm text-red-700">
              Платформа "Груз Клик" носит <strong>исключительно информационный характер</strong>. 
              Вы самостоятельно несете все риски и ответственность за использование сервиса, 
              выбор контрагентов и заключение сделок. Платформа не является перевозчиком 
              и не гарантирует результатов.
            </p>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-muted/30 rounded-xl">
            <Checkbox 
              id="agree-update" 
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked === true)}
              className="mt-1"
            />
            <label
              htmlFor="agree-update"
              className="text-sm leading-relaxed cursor-pointer"
            >
              Я ознакомился с изменениями в пользовательском соглашении и принимаю новые условия. 
              Я понимаю, что несу полную ответственность за свои действия на платформе.
            </label>
          </div>
        </div>

        <DialogFooter className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleDecline}
            className="flex-1"
          >
            <Icon name="X" size={16} className="mr-2" />
            Не согласен (выйти)
          </Button>
          <Button 
            onClick={handleAccept}
            disabled={!agreed}
            className="flex-1"
          >
            <Icon name="Check" size={16} className="mr-2" />
            Принять условия
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TermsUpdateNotification;
