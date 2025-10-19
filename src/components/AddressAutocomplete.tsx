import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { getCategorizedSuggestions } from '@/utils/addressAutocomplete';

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const AddressAutocomplete = ({ value, onChange, placeholder, className }: AddressAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<{ cities: string[]; warehouses: string[]; addresses: string[] }>({ cities: [], warehouses: [], addresses: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.length >= 2) {
      const results = getCategorizedSuggestions(value);
      setSuggestions(results);
      setShowSuggestions(true);
    } else {
      setSuggestions({ cities: [], warehouses: [], addresses: [] });
      setShowSuggestions(false);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const allSuggestions = [...suggestions.cities, ...suggestions.warehouses, ...suggestions.addresses];
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < allSuggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(allSuggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const hasAnySuggestions = suggestions.cities.length > 0 || suggestions.warehouses.length > 0 || suggestions.addresses.length > 0;

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => value.length >= 2 && hasAnySuggestions && setShowSuggestions(true)}
        placeholder={placeholder}
        className={className}
      />

      {showSuggestions && hasAnySuggestions && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-80 overflow-y-auto">
          {suggestions.cities.length > 0 && (
            <div className="p-2">
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Icon name="MapPin" size={12} />
                Города
              </div>
              {suggestions.cities.map((city, index) => (
                <button
                  key={`city-${index}`}
                  onClick={() => handleSelect(city)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors ${
                    selectedIndex === index ? 'bg-accent' : ''
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          )}

          {suggestions.warehouses.length > 0 && (
            <div className="p-2 border-t border-border">
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Icon name="Warehouse" size={12} />
                Склады и логистические центры
              </div>
              {suggestions.warehouses.map((warehouse, index) => (
                <button
                  key={`warehouse-${index}`}
                  onClick={() => handleSelect(warehouse)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors ${
                    selectedIndex === suggestions.cities.length + index ? 'bg-accent' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <Icon name="Package" size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                    <span>{warehouse}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {suggestions.addresses.length > 0 && (
            <div className="p-2 border-t border-border">
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Icon name="Navigation" size={12} />
                Популярные объекты
              </div>
              {suggestions.addresses.map((address, index) => (
                <button
                  key={`address-${index}`}
                  onClick={() => handleSelect(address)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors ${
                    selectedIndex === suggestions.cities.length + suggestions.warehouses.length + index ? 'bg-accent' : ''
                  }`}
                >
                  {address}
                </button>
              ))}
            </div>
          )}

          <div className="px-4 py-2 text-xs text-muted-foreground bg-muted/50 border-t border-border">
            <Icon name="Info" size={12} className="inline mr-1" />
            Используйте ↑ ↓ для навигации, Enter для выбора
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;
