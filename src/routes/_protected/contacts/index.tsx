import { createFileRoute } from '@tanstack/react-router';
import { Contacts } from '#/components/Contacts/Contacts.tsx';

export const Route = createFileRoute('/_protected/contacts/')({
  component: Contacts,
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(
      context.trpc.contacts.listAll.queryOptions(),
    );
  },
});
