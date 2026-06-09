import { useState } from 'react';
import type { Dayjs } from 'dayjs';
import { END_HOUR } from '../weeklyViewConstants.ts';
import { minutesToHHmm } from '#/utils/timeUtils.ts';

export interface DragState {
  columnIndex: number;
  startMinutes: number;
  currentMinutes: number;
}

interface UseDragToCreateOptions {
  monday: Dayjs;
  onCreateRdv: (isoDate: string, startTime: string, endTime: string) => void;
}

interface UseDragToCreateResult {
  drag: DragState | null;
  startDrag: (pos: { minutes: number; columnIndex: number }) => void;
  moveDrag: (pos: { minutes: number; columnIndex: number }) => void;
  endDrag: () => void;
}

function buildRdvTimes(d: DragState, monday: Dayjs) {
  const startMin = Math.min(d.startMinutes, d.currentMinutes);
  const rawEndMin = Math.max(d.startMinutes, d.currentMinutes);
  const endMin = rawEndMin === startMin ? startMin + 15 : rawEndMin;

  return {
    isoDate: monday.add(d.columnIndex, 'day').format('YYYY-MM-DD'),
    startTime: minutesToHHmm(startMin),
    endTime: minutesToHHmm(Math.min(endMin, END_HOUR * 60)),
  };
}

export function useDragToCreate({ monday, onCreateRdv }: UseDragToCreateOptions): UseDragToCreateResult {
  const [drag, setDragState] = useState<DragState | null>(null);

  function completeDrag(d: DragState) {
    const { isoDate, startTime, endTime } = buildRdvTimes(d, monday);

    onCreateRdv(isoDate, startTime, endTime);
  }

  return {
    drag,
    startDrag: (pos) => setDragState({ columnIndex: pos.columnIndex, startMinutes: pos.minutes, currentMinutes: pos.minutes }),
    moveDrag: (pos) => {
      if (!drag || pos.columnIndex !== drag.columnIndex) return;

      setDragState({ ...drag, currentMinutes: pos.minutes });
    },
    endDrag: () => {
      if (drag) completeDrag(drag);

      setDragState(null);
    },
  };
}
