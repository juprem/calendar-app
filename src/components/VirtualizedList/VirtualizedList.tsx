import { useRef } from 'react';
import type { ReactNode } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { DataState } from '#/components/DataState/DataState.tsx';

interface VirtualizedListProps<Item> {
  items: Item[];
  renderItem: (item: Item) => ReactNode;
  estimateSize: number;
  isLoading?: boolean;
  isError?: boolean;
  emptyText?: string;
}

export function VirtualizedList<Item>({
  items,
  renderItem,
  estimateSize,
  isLoading = false,
  isError = false,
  emptyText,
}: VirtualizedListProps<Item>) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => estimateSize,
    overscan: 5,
  });

  return (
    <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
      <DataState isLoading={isLoading} isError={isError} isEmpty={items.length === 0} emptyText={emptyText}>
        <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
          {virtualizer.getVirtualItems().map((virtualRow) => (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {renderItem(items[virtualRow.index])}
            </div>
          ))}
        </div>
      </DataState>
    </div>
  );
}
