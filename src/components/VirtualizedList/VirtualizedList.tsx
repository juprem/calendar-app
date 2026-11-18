import { useEffect, useEffectEvent, useRef } from 'react';
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
  onEndReached?: () => void;
}

export function VirtualizedList<Item>({
  items,
  renderItem,
  estimateSize,
  isLoading = false,
  isError = false,
  emptyText,
  onEndReached,
}: VirtualizedListProps<Item>) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => estimateSize,
    overscan: 5,
  });

  const virtualRows = virtualizer.getVirtualItems();
  const lastRenderedIndex = virtualRows.at(-1)?.index;
  const isLastItemRendered = lastRenderedIndex !== undefined && lastRenderedIndex === items.length - 1;

  const notifyEndReached = useEffectEvent(() => onEndReached?.());

  useEffect(() => {
    if (isLastItemRendered) notifyEndReached();
  }, [isLastItemRendered, items.length]);

  return (
    <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
      <DataState isLoading={isLoading} isError={isError} isEmpty={items.length === 0} emptyText={emptyText}>
        <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
          {virtualRows.map((virtualRow) => (
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
