import { prisma } from '#/db.ts';
import type { CreateGeneralPractitioner } from '#/models/GeneralPractitionerModel.ts';

export function getAllGeneralPractitioners() {
  return prisma.general_practitioner.findMany({ orderBy: { lastname: 'asc' } });
}

export function createGeneralPractitioner(data: CreateGeneralPractitioner) {
  return prisma.general_practitioner.create({ data });
}
