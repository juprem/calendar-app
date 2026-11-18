import type { ReactNode } from 'react';
import { matchesNameQuery } from '#/utils/contactUtils.ts';
import { useDebouncedSearch } from '#/hooks/useDebouncedSearch.ts';
import { VirtualizedList } from '#/components/VirtualizedList/VirtualizedList.tsx';
import { ListSearchInput } from '#/components/SearchableEntityList/ListSearchInput.tsx';

interface SearchableEntityListProps<Item> {
  items: Item[];
  getSearchableName: (item: Item) => { firstname: string | null; lastname: string };
  estimateSize: number;
  isLoading?: boolean;
  isError?: boolean;
  emptyText: string;
  searchPlaceholder: string;
  renderItem: (item: Item) => ReactNode;
  headerAction?: ReactNode;
}

export function SearchableEntityList<Item>({
  items,
  getSearchableName,
  estimateSize,
  isLoading = false,
  isError = false,
  emptyText,
  searchPlaceholder,
  renderItem,
  headerAction,
}: SearchableEntityListProps<Item>) {
  const { inputValue, debouncedSearch, setInputValue } = useDebouncedSearch();

  const filteredItems = items.filter((item) => {
    const { firstname, lastname } = getSearchableName(item);
    return matchesNameQuery(firstname, lastname, debouncedSearch);
  });

  return (
    <>
      <ListSearchInput
        value={inputValue}
        onChange={setInputValue}
        placeholder={searchPlaceholder}
        headerAction={headerAction}
      />

      <VirtualizedList
        items={filteredItems}
        estimateSize={estimateSize}
        isLoading={isLoading}
        isError={isError}
        emptyText={emptyText}
        renderItem={renderItem}
      />
    </>
  );
}
