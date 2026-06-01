import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useTRPC } from '#/integrations/trpc/react.ts';
import type { Dayjs } from 'dayjs';

export const useGetDailyRdv = (day: Dayjs) => {
  const trpc = useTRPC();

  return useQuery(trpc.calendar.listByDay.queryOptions(day.format('YYYY-MM-DD')));
};

export const useSuspenseGetDailyRdv = (day: Dayjs) => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.calendar.listByDay.queryOptions(day.format('YYYY-MM-DD')));
};

export const useGetWeeklyRdv = (startDay: number, startMonth: number, startYear: number) => {
  const trpc = useTRPC();
  return useQuery(trpc.calendar.listByWeek.queryOptions({ startDay, startMonth, startYear }));
};

export const useGetMonthlyRdv = (month: number, year: number) => {
  const trpc = useTRPC();
  return useQuery(trpc.calendar.listByMonth.queryOptions({ month, year }));
};

export const useSuspenseGetMonthlyRdv = (month: number, year: number) => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.calendar.listByMonth.queryOptions({ month, year }));
};

export const useAddRdv = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.calendar.addRdv.mutationOptions(),
    onSuccess: (_, variables) => {
      const [year, month] = variables.date.split('-').map(Number);

      queryClient.invalidateQueries({
        queryKey: trpc.calendar.listByDay.queryKey(variables.date),
      });
      queryClient.invalidateQueries({
        queryKey: trpc.calendar.listByMonth.queryKey({ month, year }),
      });
    },
  });
};
