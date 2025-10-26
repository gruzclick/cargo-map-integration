import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { LegalDocsEditor } from '@/components/admin/LegalDocsEditor';

export default function AdminLegalDocs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin')}
            >
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Юридические документы
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Редактирование политики конфиденциальности и пользовательского соглашения
              </p>
            </div>
          </div>
        </div>

        <LegalDocsEditor />
      </div>
    </div>
  );
}
