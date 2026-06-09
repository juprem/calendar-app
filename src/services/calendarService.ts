import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '#/integrations/trpc/react.ts';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { parseDateComponents, getMondayOf } from '#/utils/dateUtils.ts';
import { toast } from 'sonner';

export const useGetDailyRdv = (day: Dayjs) => {
  const trpc = useTRPC();
  return useQuery(trpc.calendar.listByDay.queryOptions(day.format('YYYY-MM-DD')));
};

export const useGetWeeklyRdv = (monday: Dayjs) => {
  const trpc = useTRPC();

  return useQuery(
    trpc.calendar.listByWeek.queryOptions({
      startDay: monday.date(),
      startMonth: monday.month(),
      startYear: monday.year(),
    }),
  );
};

export const useGetMonthlyRdv = (month: number, year: number) => {
  const trpc = useTRPC();
  return useQuery(trpc.calendar.listByMonth.queryOptions({ month, year }));
};

function useCalendarInvalidation() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return (isoDate: string) => {
    const { year, month, day } = parseDateComponents(isoDate);
    const monday = getMondayOf(dayjs().year(year).month(month - 1).date(day));
    queryClient.invalidateQueries({ queryKey: trpc.calendar.listByDay.queryKey(isoDate) });
    queryClient.invalidateQueries({ queryKey: trpc.calendar.listByMonth.queryKey({ month, year }) });
    queryClient.invalidateQueries({
      queryKey: trpc.calendar.listByWeek.queryKey({
        startDay: monday.date(),
        startMonth: monday.month(),
        startYear: monday.year(),
      }),
    });
  };
}

export const useAddRdv = () => {
  const trpc = useTRPC();
  const invalidate = useCalendarInvalidation();

  return useMutation({
    ...trpc.calendar.addRdv.mutationOptions(),
    onSuccess: (_, variables) => {
      invalidate(variables.date);
      toast.success('Rendez-vous créé');
    },
    onError: (error) => {
      if (error.data?.code === 'CONFLICT') {
        toast.error(error.message);
      } else {
        toast.error('Erreur lors de la création du rendez-vous');
      }
    },
  });
};

export const useUpdateRdv = () => {
  const trpc = useTRPC();
  const invalidate = useCalendarInvalidation();

  return useMutation({
    ...trpc.calendar.updateRdv.mutationOptions(),
    onSuccess: (_, variables) => {
      invalidate(variables.date);
      toast.success('Rendez-vous mis à jour');
    },
    onError: () => toast.error('Erreur lors de la mise à jour du rendez-vous'),
  });
};

export const useDeleteRdv = (isoDate: string) => {
  const trpc = useTRPC();
  const invalidate = useCalendarInvalidation();

  return useMutation({
    ...trpc.calendar.deleteRdv.mutationOptions(),
    onSuccess: () => {
      invalidate(isoDate);
      toast.success('Rendez-vous supprimé');
    },
    onError: () => toast.error('Erreur lors de la suppression du rendez-vous'),
  });
};
