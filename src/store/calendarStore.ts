import { create } from 'zustand/react';
import dayjs, { type Dayjs } from 'dayjs';

type State = {
  day: Dayjs;
  contactFilter: number | null;
};

type Action = {
  setDay: (newDay: Dayjs) => void;
  setContactFilter: (id: number | null) => void;
};

export const useCalendarStore = create<State & Action>((set) => ({
  day: dayjs(),
  contactFilter: null,
  setDay: (day: Dayjs) => set({ day }),
  setContactFilter: (id: number | null) => set({ contactFilter: id }),
}));
