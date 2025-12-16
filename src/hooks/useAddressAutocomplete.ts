import { useState, useEffect, useCallback } from 'react';

export interface AddressSuggestion {
  title: string;
  subtitle?: string;
  coordinates?: [number, number];
}

interface UseAddressAutocompleteProps {
  userLocation?: [number, number];
  debounceMs?: number;
}

export const useAddressAutocomplete = ({ 
  userLocation,
  debounceMs = 300 
}: UseAddressAutocompleteProps = {}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const apiKey = 'c4ed6cfa-90f3-4d27-8ded-bcac06cf8dbf';
      
      const bounds = userLocation 
        ? `&bbox=${userLocation[1] - 0.5}~${userLocation[0] - 0.5}~${userLocation[1] + 0.5}~${userLocation[0] + 0.5}`
        : '';
      
      const response = await fetch(
        `https://suggest-maps.yandex.ru/v1/suggest?apikey=${apiKey}&text=${encodeURIComponent(searchQuery)}${bounds}&types=house,street,locality&results=7`
      );

      if (response.ok) {
        const data = await response.json();
        const formatted: AddressSuggestion[] = (data.results || []).map((item: any) => ({
          title: item.title?.text || '',
          subtitle: item.subtitle?.text,
          coordinates: item.address?.coordinates 
            ? [item.address.coordinates[1], item.address.coordinates[0]] as [number, number]
            : undefined
        }));
        setSuggestions(formatted);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Address autocomplete error:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [userLocation]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs, fetchSuggestions]);

  return {
    query,
    setQuery,
    suggestions,
    loading,
    clearSuggestions: () => setSuggestions([])
  };
};
