import { calendarRouter } from '#/integrations/trpc/router/calendarRouter.ts';
import { createTRPCRouter } from '#/integrations/trpc/init.ts';
import { contactsRouter } from '#/integrations/trpc/router/contactsRouter.ts';

export const trpcRouter = createTRPCRouter({
  calendar: calendarRouter,
  contacts: contactsRouter,
});

export type TRPCRouter = typeof trpcRouter;
