import { calendarRouter } from '#/integrations/trpc/router/calendarRouter.ts';
import { createTRPCRouter } from '#/integrations/trpc/init.ts';
import { contactsRouter } from '#/integrations/trpc/router/contactsRouter.ts';
import { generalPractitionerRouter } from '#/integrations/trpc/router/generalPractitionerRouter.ts';

export const trpcRouter = createTRPCRouter({
  calendar: calendarRouter,
  contacts: contactsRouter,
  generalPractitioner: generalPractitionerRouter,
});

export type TRPCRouter = typeof trpcRouter;
