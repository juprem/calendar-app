/** @vitest-environment jsdom */
import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { VirtualizedList } from './VirtualizedList.tsx';

const ROW_HEIGHT = 40;

const renderList = (itemCount: number, onEndReached: () => void) =>
  render(
    <VirtualizedList
      items={Array.from({ length: itemCount }, (_, itemIndex) => `Contact ${itemIndex + 1}`)}
      estimateSize={ROW_HEIGHT}
      renderItem={(label) => <span>{label}</span>}
      onEndReached={onEndReached}
    />,
  );

const SCROLL_VIEWPORT_HEIGHT = 400;

describe('VirtualizedList onEndReached', () => {
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(SCROLL_VIEWPORT_HEIGHT);
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(ROW_HEIGHT);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('calls onEndReached once the last item is rendered', () => {
    const onEndReached = vi.fn();

    const { getByText } = renderList(3, onEndReached);

    expect(getByText('Contact 3')).toBeTruthy();
    expect(onEndReached).toHaveBeenCalled();
  });

  it('does not call onEndReached while the last item is outside the rendered rows', () => {
    const onEndReached = vi.fn();

    const { queryByText } = renderList(100, onEndReached);

    expect(queryByText('Contact 100')).toBeNull();
    expect(onEndReached).not.toHaveBeenCalled();
  });

  it('does not call onEndReached for an empty list', () => {
    const onEndReached = vi.fn();

    renderList(0, onEndReached);

    expect(onEndReached).not.toHaveBeenCalled();
  });
});
