import { create } from 'zustand/react';
import dayjs, { type Dayjs } from 'dayjs';

type Action = {
  setDay: (newDay: Dayjs) => void;
};

type State = {
  day: Dayjs;
};

export const useCalendarStore = create<State & Action>((set) => ({
  day: dayjs(),
  setDay: (day: Dayjs) => set({ day }),
}));
