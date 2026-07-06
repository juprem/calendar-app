import type { general_practitioner } from '../../../../generated/prisma/client.ts';
import type { GeneralPractitioner } from '../models.ts';

export const toGeneralPractitioner = (row: general_practitioner): GeneralPractitioner => ({
  id: row.id,
  firstname: row.firstname,
  lastname: row.lastname,
  address: row.address,
});
