import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { searchWarehouses, type MarketplaceWarehouse } from '@/data/marketplaceWarehouses';

interface AddressInputWithSuggestionsProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onCopy: () => void;
  placeholder?: string;
  required?: boolean;
  id: string;
}

const AddressInputWithSuggestions = ({
  label,
  value,
  onChange,
  onCopy,
  placeholder = '',
  required = false,
  id
}: AddressInputWithSuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<MarketplaceWarehouse[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddressChange = (newValue: string) => {
    onChange(newValue);
    if (newValue.length > 2) {
      const results = searchWarehouses(newValue);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectWarehouse = (warehouse: MarketplaceWarehouse) => {
    onChange(warehouse.address);
    setShowSuggestions(false);
  };

  const handleFocus = () => {
    if (value.length > 2) {
      const results = searchWarehouses(value);
      if (results.length > 0) {
        setSuggestions(results);
        setShowSuggestions(true);
      }
    }
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      <Label htmlFor={id}>{label}</Label>
      <div className="text-xs text-gray-500 mb-1">
        Начните вводить название маркетплейса (Wildberries, Ozon, Яндекс Маркет...)
      </div>
      <div className="flex gap-2 relative">
        <div className="flex-1 relative">
          <Textarea
            id={id}
            placeholder={placeholder}
            value={value}
            onChange={(e) => handleAddressChange(e.target.value)}
            onFocus={handleFocus}
            required={required}
            className="min-h-[80px]"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
              {suggestions.map((warehouse, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectWarehouse(warehouse)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 border-b last:border-b-0"
                >
                  <div className="font-semibold text-sm">
                    {warehouse.marketplace} — {warehouse.city}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {warehouse.address}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onCopy}
          disabled={!value}
        >
          <Icon name="Copy" size={18} />
        </Button>
      </div>
    </div>
  );
};

export default AddressInputWithSuggestions;
