import { createTRPCRouter } from '#/configurations/trpc/init.ts';
import { calendarRouter } from '#/domain/calendar/application/controllers/calendarRouter.ts';
import { contactsRouter } from '#/domain/contact/application/controllers/contactsRouter.ts';
import { dataTransferRouter } from '#/domain/dataTransfer/application/controllers/dataTransferRouter.ts';
import { generalPractitionerRouter } from '#/domain/generalPractitioner/application/controllers/generalPractitionerRouter.ts';
import { reminderRouter } from '#/domain/reminder/application/controllers/reminderRouter.ts';

export const trpcRouter = createTRPCRouter({
  calendar: calendarRouter,
  contacts: contactsRouter,
  dataTransfer: dataTransferRouter,
  generalPractitioner: generalPractitionerRouter,
  reminder: reminderRouter,
});

export type TRPCRouter = typeof trpcRouter;
