import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface DocumentItem {
  id: string;
  name: string;
  type: string;
  date: string;
  signed: boolean;
  signedBy?: string[];
}

interface DigitalSignatureProps {
  userType: 'client' | 'carrier' | 'logist';
}

const DigitalSignature = ({ userType }: DigitalSignatureProps) => {
  const { toast } = useToast();
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [certificatePassword, setCertificatePassword] = useState('');
  const [showCertificatePassword, setShowCertificatePassword] = useState(false);
  const [documents] = useState<DocumentItem[]>([
    { id: '1', name: 'Транспортная накладная №1234', type: 'ТН', date: '2024-10-21', signed: false },
    { id: '2', name: 'Договор на перевозку №5678', type: 'Договор', date: '2024-10-20', signed: true, signedBy: ['Клиент', 'Перевозчик'] },
    { id: '3', name: 'Акт выполненных работ №91011', type: 'Акт', date: '2024-10-19', signed: false },
  ]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCertificateFile(file);
      toast({
        title: 'Сертификат загружен',
        description: file.name
      });
    }
  };

  const handleSign = async () => {
    if (!selectedDocument) {
      toast({
        title: 'Ошибка',
        description: 'Выберите документ для подписания',
        variant: 'destructive'
      });
      return;
    }

    if (!certificateFile) {
      toast({
        title: 'Ошибка',
        description: 'Загрузите сертификат электронной подписи',
        variant: 'destructive'
      });
      return;
    }

    if (!certificatePassword) {
      toast({
        title: 'Ошибка',
        description: 'Введите пароль от сертификата',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Документ подписывается',
      description: 'Пожалуйста, подождите...'
    });

    setTimeout(() => {
      toast({
        title: 'Документ подписан',
        description: `${selectedDocument.name} успешно подписан электронной подписью`
      });
      setSelectedDocument(null);
      setCertificatePassword('');
    }, 2000);
  };

  const handleSendForSignature = (doc: DocumentItem) => {
    const recipient = userType === 'client' ? 'перевозчику' : 
                      userType === 'carrier' ? 'клиенту' : 
                      'всем сторонам';
    
    toast({
      title: 'Документ отправлен',
      description: `${doc.name} отправлен ${recipient} на подпись`
    });
  };

  return (
    <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-white/30 dark:border-gray-700/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="FileSignature" size={20} />
          Электронная подпись документов
        </CardTitle>
        <CardDescription>
          Подписывайте и обменивайтесь документами с использованием ЭЦП
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <Icon name="Info" size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Юридически значимый электронный документооборот
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Поддержка ГОСТ Р 34.10-2012, УКЭП, простой и усиленной квалифицированной электронной подписи
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium">Документы к подписанию</h3>
          
          {documents.map((doc) => (
            <div
              key={doc.id}
              className={`p-3 rounded-lg border ${
                selectedDocument?.id === doc.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
              } cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
              onClick={() => setSelectedDocument(doc)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Icon name="FileText" size={16} className="text-gray-600 dark:text-gray-400" />
                    <p className="text-sm font-medium">{doc.name}</p>
                    {doc.signed && (
                      <Icon name="BadgeCheck" size={16} className="text-green-600 dark:text-green-400" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Дата: {new Date(doc.date).toLocaleDateString('ru-RU')}
                  </p>
                  {doc.signed && doc.signedBy && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Подписали: {doc.signedBy.join(', ')}
                    </p>
                  )}
                </div>
                {!doc.signed && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSendForSignature(doc);
                    }}
                  >
                    <Icon name="Send" size={14} className="mr-1" />
                    Отправить
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {selectedDocument && !selectedDocument.signed && (
          <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium">Подписать документ</h3>

            <div>
              <Label htmlFor="certificate-upload">Сертификат ЭЦП (.pfx, .p12)</Label>
              <div className="mt-1.5">
                <Input
                  id="certificate-upload"
                  type="file"
                  accept=".pfx,.p12"
                  onChange={handleFileUpload}
                  className="cursor-pointer"
                />
              </div>
              {certificateFile && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                  <Icon name="Check" size={12} />
                  {certificateFile.name}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="certificate-password">Пароль от сертификата</Label>
              <div className="relative mt-1.5">
                <Input
                  id="certificate-password"
                  type={showCertificatePassword ? 'text' : 'password'}
                  placeholder="Введите пароль"
                  value={certificatePassword}
                  onChange={(e) => setCertificatePassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowCertificatePassword(!showCertificatePassword)}
                >
                  <Icon name={showCertificatePassword ? 'EyeOff' : 'Eye'} size={18} className="text-muted-foreground" />
                </Button>
              </div>
            </div>

            <Button onClick={handleSign} className="w-full">
              <Icon name="FileSignature" size={18} className="mr-2" />
              Подписать документ
            </Button>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            <Icon name="Shield" size={12} className="inline mr-1" />
            Все документы хранятся в зашифрованном виде. Подписи проверяются через доверенные центры сертификации.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DigitalSignature;