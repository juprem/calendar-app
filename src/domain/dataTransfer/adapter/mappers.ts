import type { export_log } from '../../../../generated/prisma/client.ts';
import { truncateToUTCDate } from '#/utils/dateUtils.ts';
import type { ContactImportRow, ExportLog, PractitionerImportRow, RdvImportRow } from '../models.ts';

export const toExportLog = (row: export_log): ExportLog => ({
  id: row.id,
  exportedAt: row.exported_at,
});

export const toPractitionerUpsertArgs = (row: PractitionerImportRow) => {
  const data = { firstname: row.firstname, lastname: row.lastname, address: row.address };
  return { where: { id: row.id }, create: { id: row.id, ...data }, update: data };
};

export const toContactUpsertArgs = (row: ContactImportRow) => {
  const data = {
    firstname: row.firstname,
    lastname: row.lastname,
    email: row.email,
    phone_number: row.phoneNumber,
    notes: row.notes,
    birth_date: truncateToUTCDate(row.birthDate),
    birth_location: row.birthLocation,
    address: row.address,
    civility: row.civility,
    general_practitioner_id: row.generalPractitionerId,
  };
  return { where: { id: row.id }, create: { id: row.id, ...data }, update: data };
};

export const toRdvUpsertArgs = (row: RdvImportRow, dayId: number) => {
  const data = {
    day_id: dayId,
    start_hour: row.startHour,
    end_hour: row.endHour,
    name: row.name,
    rdv_type: row.rdvType,
    is_confirmed: row.isConfirmed,
    additional_infos: row.additionalInfos,
    confirmation_date: row.confirmationDate,
    confirmation_mode: row.confirmationMode,
    contact_id: row.contactId,
  };
  return { where: { id: row.id }, create: { id: row.id, ...data }, update: data };
};
