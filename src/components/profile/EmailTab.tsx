import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import EmailAuth from '@/components/EmailAuth';

interface EmailTabProps {
  showEmailVerification: boolean;
  emailVerified: boolean;
  onShowEmailVerificationChange: (value: boolean) => void;
  onEmailVerifiedChange: (value: boolean) => void;
}

const EmailTab = ({ 
  showEmailVerification, 
  emailVerified, 
  onShowEmailVerificationChange,
  onEmailVerifiedChange 
}: EmailTabProps) => {
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleSendVerification = () => {
    if (!email) {
      toast({
        title: 'Укажите email',
        variant: 'destructive'
      });
      return;
    }
    onShowEmailVerificationChange(true);
    toast({
      title: 'Код отправлен',
      description: 'Проверьте почту'
    });
  };

  return (
    <div className="space-y-4">
      {showEmailVerification ? (
        <EmailAuth
          email={email}
          onVerified={() => {
            onEmailVerifiedChange(true);
            onShowEmailVerificationChange(false);
            toast({
              title: 'Email подтверждён!'
            });
          }}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Mail" size={20} />
              Подтверждение Email
              {emailVerified && (
                <Icon name="CheckCircle" size={20} className="text-green-600" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {emailVerified ? (
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <Icon name="CheckCircle" size={20} />
                  <span className="font-medium">Email подтверждён</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                  {email}
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Подтвердите email для получения уведомлений и повышения доверия
                </p>
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Button onClick={handleSendVerification} className="w-full">
                  <Icon name="Mail" size={16} className="mr-2" />
                  Отправить код подтверждения
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmailTab;
