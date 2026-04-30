import { createFileRoute } from '@tanstack/react-router';
import { Contacts } from '#/components/Contacts/Contacts.tsx';
import { requireCalendarAccess } from '#/server/auth.ts';

export const Route = createFileRoute('/contacts/')({
  component: Contacts,
  beforeLoad: async () => await requireCalendarAccess(),
});
