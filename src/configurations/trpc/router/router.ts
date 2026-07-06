import { createTRPCRouter } from '#/configurations/trpc/init.ts';
import { calendarRouter } from '#/domain/calendar/application/controllers/calendarRouter.ts';
import { contactsRouter } from '#/domain/contact/application/controllers/contactsRouter.ts';
import { generalPractitionerRouter } from '#/domain/generalPractitioner/application/controllers/generalPractitionerRouter.ts';

export const trpcRouter = createTRPCRouter({
  calendar: calendarRouter,
  contacts: contactsRouter,
  generalPractitioner: generalPractitionerRouter,
});

export type TRPCRouter = typeof trpcRouter;
