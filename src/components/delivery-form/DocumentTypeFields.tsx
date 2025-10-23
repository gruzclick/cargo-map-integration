import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DocumentTypeFieldsProps {
  documentType: 'delivery' | 'receipt' | 'invoice';
  deliveryDate: string;
  deliveryPrice: string;
  onDeliveryDateChange: (value: string) => void;
  onDeliveryPriceChange: (value: string) => void;
}

const DocumentTypeFields = ({
  documentType,
  deliveryDate,
  deliveryPrice,
  onDeliveryDateChange,
  onDeliveryPriceChange
}: DocumentTypeFieldsProps) => {
  if (documentType === 'delivery') {
    return (
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="delivery_date">Дата поставки *</Label>
          <Input
            id="delivery_date"
            type="date"
            value={deliveryDate}
            onChange={(e) => onDeliveryDateChange(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="delivery_price">Цена за доставку (₽) *</Label>
          <Input
            id="delivery_price"
            type="number"
            step="0.01"
            placeholder="5000"
            value={deliveryPrice}
            onChange={(e) => onDeliveryPriceChange(e.target.value)}
            required
          />
        </div>
      </div>
    );
  }

  if (documentType === 'receipt') {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="receipt_number">Номер приемки *</Label>
          <Input
            id="receipt_number"
            type="text"
            placeholder="ПР-00001"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="receipt_date">Дата приемки *</Label>
          <Input
            id="receipt_date"
            type="date"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="quality_status">Статус качества *</Label>
          <Select defaultValue="good">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="good">Товар в отличном состоянии</SelectItem>
              <SelectItem value="acceptable">Незначительные повреждения</SelectItem>
              <SelectItem value="damaged">Существенные повреждения</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }

  if (documentType === 'invoice') {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="invoice_number">Номер счет-фактуры *</Label>
          <Input
            id="invoice_number"
            type="text"
            placeholder="СФ-00001"
            required
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="invoice_date">Дата выставления *</Label>
            <Input
              id="invoice_date"
              type="date"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payment_terms">Срок оплаты (дней) *</Label>
            <Input
              id="payment_terms"
              type="number"
              placeholder="30"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="total_amount">Общая сумма (₽) *</Label>
          <Input
            id="total_amount"
            type="number"
            step="0.01"
            placeholder="50000"
            required
          />
        </div>
      </div>
    );
  }

  return null;
};

export default DocumentTypeFields;
