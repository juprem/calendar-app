import { createFileRoute } from '@tanstack/react-router';
import { Reminders } from '#/components/Reminders/Reminders.tsx';

export const Route = createFileRoute('/_protected/rappels/')({
  component: Reminders,
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(context.trpc.reminder.getStatus.queryOptions());
  },
});
