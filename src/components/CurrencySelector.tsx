import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CURRENCIES } from '@/utils/currency';

interface CurrencySelectorProps {
  value?: string;
  onChange?: (currency: string) => void;
  className?: string;
}

const CurrencySelector = ({ value, onChange, className }: CurrencySelectorProps) => {
  const [selectedCurrency, setSelectedCurrency] = useState(value || 'RUB');

  useEffect(() => {
    const savedCurrency = localStorage.getItem('user_currency');
    if (savedCurrency) {
      setSelectedCurrency(savedCurrency);
    }
  }, []);

  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrency(currency);
    localStorage.setItem('user_currency', currency);
    onChange?.(currency);
  };

  return (
    <Select value={selectedCurrency} onValueChange={handleCurrencyChange}>
      <SelectTrigger className={`w-32 ${className}`}>
        <SelectValue>
          {CURRENCIES[selectedCurrency as keyof typeof CURRENCIES]?.symbol} {selectedCurrency}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(CURRENCIES).map(([code, info]) => (
          <SelectItem key={code} value={code}>
            {info.symbol} {code} - {info.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CurrencySelector;
