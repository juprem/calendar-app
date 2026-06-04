import { createFileRoute } from '@tanstack/react-router';
import { WeeklyViewWrapper } from '#/components/WeeklyView/WeeklyViewWrapper.tsx';
import { requireCalendarAccess } from '#/server/auth.ts';
import dayjs from 'dayjs';

export const Route = createFileRoute('/hebdomadaire/')({
  component: Hebdomadaire,
  beforeLoad: async () => await requireCalendarAccess(),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(
      context.trpc.calendar.listByWeek.queryOptions({
        startMonth: dayjs().month(),
        startYear: dayjs().year(),
        startDay: dayjs().date(),
      }),
    );
  },
});

function Hebdomadaire() {
  return (
    <div className="px-6 h-full overflow-hidden flex flex-col">
      <WeeklyViewWrapper />
    </div>
  );
}
