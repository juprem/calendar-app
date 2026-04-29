import { create } from 'zustand/react';
import type { CalendarMode } from '#/models/CalendarModel.ts';

type Action = {
  setCalendarMode: (calendarMode: CalendarMode) => void;
}

type State = {
  mode: CalendarMode;
}

export const useCalendarStore = create<State & Action>((set) => ({
  mode: 'DAILY',
  setCalendarMode: (calendarMode: CalendarMode) => set({ mode: calendarMode }),
}));