import { createFileRoute } from '@tanstack/react-router';
import { requireCalendarAccess } from '#/server/auth.ts';
import { MonthlyView } from '#/components/MonthlyView/MonthlyView.tsx';
import { createServerFn } from '@tanstack/react-start';
import { prisma } from '#/db.ts';
import dayjs from 'dayjs';

const month = dayjs().month() + 1;
const year = dayjs().year();

export const Route = createFileRoute('/mensuelle/')({
  component: Mensuelle,
  beforeLoad: async () => await requireCalendarAccess(),
  loader: ({ context }) => {
    return context.queryClient.ensureQueryData(context.trpc.calendar.listByMonth.queryOptions({ month, year }));
  },
});

function Mensuelle() {
  const res = Route.useLoaderData();

  console.log(res);
  return <MonthlyView />;
}
