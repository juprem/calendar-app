import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '#/integrations/trpc/react.ts';
import type { Day } from '#/models/CalendarModel.ts';

export const useGetDailyRdv = (day: Day) => {
  const trpc = useTRPC();

  console.log(day);

  return useQuery(trpc.calendar.listByDay.queryOptions(day));
};
