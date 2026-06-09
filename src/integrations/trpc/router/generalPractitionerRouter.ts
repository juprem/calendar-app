import { protectedProcedure } from '#/integrations/trpc/init.ts';
import { CreateGeneralPractitionerSchema } from '#/models/GeneralPractitionerModel.ts';
import { getAllGeneralPractitioners, createGeneralPractitioner } from '#/server/generalPractitionerDomain.ts';

export const generalPractitionerRouter = {
  listAll: protectedProcedure.query(() => getAllGeneralPractitioners()),
  add: protectedProcedure
    .input(CreateGeneralPractitionerSchema)
    .mutation(({ input }) => createGeneralPractitioner(input)),
};
