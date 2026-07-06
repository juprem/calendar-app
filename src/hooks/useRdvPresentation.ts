import type { RdvWithContact } from '#/domain/calendar/models.ts';
import { getRdvTypeStyle } from '#/models/RdvModel.ts';
import { formatContactName } from '#/utils/contactUtils.ts';
import { useCalendarStore } from '#/store/calendarStore.ts';

interface UseRdvPresentationOptions {
  shortContactName?: boolean;
}

export function useRdvPresentation(rdv: RdvWithContact, opts?: UseRdvPresentationOptions) {
  const contactFilter = useCalendarStore((s) => s.contactFilter);
  const typeStyle = getRdvTypeStyle(rdv.rdvType);
  const isDimmed = contactFilter !== null && rdv.contactId !== contactFilter;
  const contactLabel = rdv.contact ? formatContactName(rdv.contact, { short: opts?.shortContactName }) : null;

  return { typeStyle, isDimmed, contactLabel };
}
