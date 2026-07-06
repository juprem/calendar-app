import type { contact, day, rdv } from '../../../../generated/prisma/client.ts';
import type { Day, DayWithRdvs, Rdv, RdvInsertData, RdvWithContact } from '../models.ts';
// contact owns toContact; reused here rather than re-mapping contact rows — contact's mapper reuses
// toRdvWithContact below for the same reason. An intentional two-file cycle, safe: pure functions only,
// nothing invoked at module load time.
import { toContact } from '#/domain/contact/adapter/mappers.ts';

export const toDay = (dayRow: day): Day => ({
  id: dayRow.id,
  date: dayRow.date,
});

export const toRdv = (rdvRow: rdv): Rdv => ({
  id: rdvRow.id,
  dayId: rdvRow.day_id,
  startHour: rdvRow.start_hour,
  endHour: rdvRow.end_hour,
  name: rdvRow.name,
  rdvType: rdvRow.rdv_type,
  isConfirmed: rdvRow.is_confirmed,
  additionalInfos: rdvRow.additional_infos,
  confirmationDate: rdvRow.confirmation_date,
  confirmationMode: rdvRow.confirmation_mode,
  contactId: rdvRow.contact_id,
});

export const toRdvPrismaInput = (data: RdvInsertData & { dayId: number }) => ({
  day_id: data.dayId,
  start_hour: data.startHour,
  end_hour: data.endHour,
  name: data.name,
  rdv_type: data.rdvType,
  is_confirmed: data.isConfirmed,
  additional_infos: data.additionalInfos,
  confirmation_date: data.confirmationDate,
  confirmation_mode: data.confirmationMode,
  contact_id: data.contactId,
});

export const toRdvWithContact = (rdvRow: rdv & { contact: contact | null }): RdvWithContact => ({
  ...toRdv(rdvRow),
  contact: rdvRow.contact ? toContact(rdvRow.contact) : null,
});

export const toDayWithRdvs = (dayRow: day & { rdv: (rdv & { contact: contact | null })[] }): DayWithRdvs => ({
  ...toDay(dayRow),
  rdv: dayRow.rdv.map(toRdvWithContact),
});
