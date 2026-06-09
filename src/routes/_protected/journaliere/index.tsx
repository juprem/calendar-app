import { createFileRoute } from '@tanstack/react-router';
import { DailyViewWrapper } from '#/components/DailyView/DailyViewWrapper.tsx';
import dayjs from 'dayjs';

export const Route = createFileRoute('/_protected/journaliere/')({
  component: Journaliere,
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(
      context.trpc.calendar.listByDay.queryOptions(dayjs().format('YYYY-MM-DD')),
    );
  },
});

function Journaliere() {
  return (
    <div className="p-8">
      <DailyViewWrapper />
    </div>
  );
}
