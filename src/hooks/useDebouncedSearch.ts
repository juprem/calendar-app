import { useState } from 'react';
import { useDebounce } from '@uidotdev/usehooks';

const SEARCH_DEBOUNCE_MS = 300;

interface UseDebouncedSearchResult {
  inputValue: string;
  debouncedSearch: string;
  setInputValue: (value: string) => void;
}

export function useDebouncedSearch(): UseDebouncedSearchResult {
  const [inputValue, setInputValue] = useState('');
  const debouncedSearch = useDebounce(inputValue, SEARCH_DEBOUNCE_MS);

  return { inputValue, debouncedSearch, setInputValue };
}
