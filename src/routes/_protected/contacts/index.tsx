import { createFileRoute } from '@tanstack/react-router';
import { Contacts } from '#/components/Contacts/Contacts.tsx';
import { contactSearchOptions } from '#/services/contactService.ts';

export const Route = createFileRoute('/_protected/contacts/')({
  component: Contacts,
  loader: ({ context }) => {
    context.queryClient.prefetchInfiniteQuery(contactSearchOptions(context.trpc, ''));
  },
});
