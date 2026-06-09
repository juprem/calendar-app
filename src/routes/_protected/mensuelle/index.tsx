import { createFileRoute } from '@tanstack/react-router';
import { MonthlyViewWrapper } from '#/components/MonthlyView/MonthlyViewWrapper.tsx';
import dayjs from 'dayjs';

export const Route = createFileRoute('/_protected/mensuelle/')({
  component: Mensuelle,
  loader: ({ context }) => {
    const now = dayjs();
    context.queryClient.ensureQueryData(
      context.trpc.calendar.listByMonth.queryOptions({
        month: now.month(),
        year: now.year(),
      }),
    );
  },
});

function Mensuelle() {
  return <MonthlyViewWrapper />;
}
