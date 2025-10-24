import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import Icon from './ui/icon';

interface TermsUpdateDialogProps {
  open: boolean;
  onAccept: () => void;
}

const TermsUpdateDialog = ({ open, onAccept }: TermsUpdateDialogProps) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const handleAccept = () => {
    if (termsAccepted && privacyAccepted) {
      onAccept();
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[600px]" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="FileText" size={24} />
            Обновление пользовательского соглашения
          </DialogTitle>
          <DialogDescription>
            Мы обновили Пользовательское соглашение и Политику конфиденциальности. 
            Для продолжения использования сервиса необходимо принять новые условия.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="terms" 
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
            />
            <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
              Я ознакомился(ась) и согласен(на) с{' '}
              <a 
                href="/terms" 
                target="_blank" 
                className="text-primary hover:underline font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                Пользовательским соглашением
              </a>
            </label>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox 
              id="privacy" 
              checked={privacyAccepted}
              onCheckedChange={(checked) => setPrivacyAccepted(checked as boolean)}
            />
            <label htmlFor="privacy" className="text-sm leading-relaxed cursor-pointer">
              Я ознакомился(ась) и согласен(на) с{' '}
              <a 
                href="/privacy" 
                target="_blank" 
                className="text-primary hover:underline font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                Политикой конфиденциальности
              </a>
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button 
            onClick={handleAccept} 
            disabled={!termsAccepted || !privacyAccepted}
            className="w-full"
          >
            <Icon name="Check" size={18} className="mr-2" />
            Принять и продолжить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TermsUpdateDialog;
