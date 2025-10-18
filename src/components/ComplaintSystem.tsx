import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Upload, X } from 'lucide-react';

interface ComplaintSystemProps {
  orderId: string;
  userId: string;
  userType: 'client' | 'carrier';
  accusedId: string;
  onSubmit?: () => void;
}

export function ComplaintSystem({ orderId, userId, userType, accusedId, onSubmit }: ComplaintSystemProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const complaintReasons = [
    'damage',
    'delay',
    'no_show',
    'unprofessional',
    'fraud',
    'other',
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setEvidenceFiles([...evidenceFiles, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setEvidenceFiles(evidenceFiles.filter((_, i) => i !== index));
  };

  const submitComplaint = async () => {
    if (!reason || !description.trim()) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('order_id', orderId);
      formData.append('complainant_id', userId);
      formData.append('accused_id', accusedId);
      formData.append('complainant_type', userType);
      formData.append('reason', reason);
      formData.append('description', description.trim());
      
      evidenceFiles.forEach((file) => {
        formData.append('evidence', file);
      });

      const response = await fetch('/api/complaints/submit', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        onSubmit?.();
      }
    } catch (error) {
      console.error('Failed to submit complaint:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-red-500" />
        <h3 className="font-semibold text-lg">{t('complaint.title')}</h3>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        {t('complaint.subtitle')}
      </p>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            {t('complaint.reason')}
          </label>
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger>
              <SelectValue placeholder={t('complaint.selectReason')} />
            </SelectTrigger>
            <SelectContent>
              {complaintReasons.map((r) => (
                <SelectItem key={r} value={r}>
                  {t(`complaint.reasons.${r}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            {t('complaint.description')}
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('complaint.descriptionPlaceholder')}
            rows={5}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            {t('complaint.evidence')}
          </label>
          <div className="space-y-2">
            {evidenceFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-sm truncate">{file.name}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <label className="flex items-center gap-2 p-3 border-2 border-dashed rounded cursor-pointer hover:bg-muted/50">
              <Upload className="h-4 w-4" />
              <span className="text-sm">{t('complaint.uploadEvidence')}</span>
              <Input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <Button
          onClick={submitComplaint}
          disabled={!reason || !description.trim() || isSubmitting}
          className="w-full"
          variant="destructive"
        >
          {t('complaint.submit')}
        </Button>
      </div>
    </Card>
  );
}
