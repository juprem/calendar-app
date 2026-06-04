import { createFileRoute } from '@tanstack/react-router';
import { requireCalendarAccess } from '#/server/auth.ts';
import { MonthlyViewWrapper } from '#/components/MonthlyView/MonthlyViewWrapper.tsx';
import dayjs from 'dayjs';

export const Route = createFileRoute('/mensuelle/')({
  component: Mensuelle,
  beforeLoad: async () => await requireCalendarAccess(),
  loader: ({ context }) => {
    const now = dayjs();
    context.queryClient.ensureQueryData(
      context.trpc.calendar.listByMonth.queryOptions({
        month: now.month() + 1,
        year: now.year(),
      }),
    );
  },
});

function Mensuelle() {
  return <MonthlyViewWrapper />;
}
