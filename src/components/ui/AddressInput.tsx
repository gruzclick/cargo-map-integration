import { useAddressAutocomplete, AddressSuggestion } from '@/hooks/useAddressAutocomplete';
import Icon from './icon';

interface AddressInputProps {
  value: string;
  onChange: (value: string, coordinates?: [number, number]) => void;
  placeholder?: string;
  label?: string;
  userLocation?: [number, number];
  required?: boolean;
}

export const AddressInput = ({
  value,
  onChange,
  placeholder = 'Начните вводить адрес...',
  label,
  userLocation,
  required = false
}: AddressInputProps) => {
  const { query, setQuery, suggestions, loading, clearSuggestions } = useAddressAutocomplete({ userLocation });

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    setQuery(newValue);
  };

  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    onChange(suggestion.title, suggestion.coordinates);
    setQuery('');
    clearSuggestions();
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium mb-2">
          {label} {required && '*'}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon name="Loader2" size={16} className="animate-spin" />
          </div>
        )}
      </div>
      
      {suggestions.length > 0 && (
        <div className="absolute z-30 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b last:border-b-0"
            >
              <div className="font-medium text-sm">{suggestion.title}</div>
              {suggestion.subtitle && (
                <div className="text-xs text-gray-500">{suggestion.subtitle}</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
