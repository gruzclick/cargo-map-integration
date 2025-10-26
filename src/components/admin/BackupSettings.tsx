import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface BackupSettingsProps {
  backupSettings: {
    autoBackup: boolean;
    backupInterval: number;
    lastBackup: string;
  };
  setBackupSettings: (settings: any) => void;
  backupHistory: Array<{
    id: string;
    date: string;
    size: string;
    status: string;
  }>;
  onBackupNow: () => void;
  onDownloadBackup: (id: string) => void;
  onDeleteBackup: (id: string) => void;
}

export const BackupSettings = ({ 
  backupSettings, 
  setBackupSettings,
  backupHistory,
  onBackupNow,
  onDownloadBackup,
  onDeleteBackup
}: BackupSettingsProps) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Резервное копирование</CardTitle>
          <CardDescription>Автоматическое создание и управление резервными копиями</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Автоматическое резервное копирование</Label>
              <p className="text-sm text-muted-foreground">
                Система будет автоматически создавать резервные копии данных
              </p>
            </div>
            <Switch
              checked={backupSettings.autoBackup}
              onCheckedChange={(checked) => 
                setBackupSettings({ ...backupSettings, autoBackup: checked })
              }
            />
          </div>

          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Интервал резервного копирования</span>
              <Badge variant="secondary">{backupSettings.backupInterval} часов</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Последняя резервная копия</span>
              <Badge variant="outline">{backupSettings.lastBackup}</Badge>
            </div>
          </div>

          <Button onClick={onBackupNow} className="w-full">
            <Icon name="Database" size={16} className="mr-2" />
            Создать резервную копию сейчас
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>История резервных копий</CardTitle>
          <CardDescription>Последние созданные резервные копии</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата создания</TableHead>
                <TableHead>Размер</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backupHistory.map((backup) => (
                <TableRow key={backup.id}>
                  <TableCell className="font-mono text-sm">{backup.date}</TableCell>
                  <TableCell>{backup.size}</TableCell>
                  <TableCell>
                    <Badge variant="default" className="bg-green-600">
                      {backup.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDownloadBackup(backup.id)}
                      >
                        <Icon name="Download" size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteBackup(backup.id)}
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
