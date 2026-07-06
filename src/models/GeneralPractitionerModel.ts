import type { GeneralPractitioner } from '#/domain/generalPractitioner/models.ts';

export function formatGeneralPractitionerName(gp: GeneralPractitioner): string {
  return gp.firstname ? `${gp.firstname} ${gp.lastname}` : gp.lastname;
}
