import { Input } from 'antd';
import type { ReactNode } from 'react';
import { Search } from 'lucide-react';
import { matchesNameQuery } from '#/utils/contactUtils.ts';
import { useDebouncedSearch } from '#/components/Contacts/hooks/useDebouncedSearch.ts';
import { VirtualizedList } from '#/components/VirtualizedList/VirtualizedList.tsx';

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
      <div className="p-3 border-b border-[#E7E5E4]">
        <div className="flex items-center gap-2">
          <Input
            prefix={<Search size={14} className="text-[#78716C]" />}
            placeholder={searchPlaceholder}
            value={inputValue}
            allowClear
            onChange={(changeEvent) => setInputValue(changeEvent.target.value)}
            variant="filled"
            size="small"
            className="flex-1"
          />
          {headerAction}
        </div>
      </div>

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
