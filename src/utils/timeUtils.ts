import dayjs from 'dayjs';
import type { rdv } from '../../generated/prisma/client.ts';

/** Parse a "HH:mm" string into a [hour, minute] tuple. */
export const getHourAndMinute = (time: string) => {
  const [hour, minute] = time.split(':').map(Number);
  return [hour, minute] as const;
};

export interface NextRdv {
  time: string;
  patientName: string;
  consultationType: string | null | undefined;
}

/**
 * Return the next upcoming RDV relative to the current time, or null if none.
 * Current time is evaluated on each call — not at module load time.
 */
export function getNextRdv(rdvs: rdv[]): NextRdv | null {
  const now = dayjs();
  const hour = now.hour();
  const minute = now.minute();

  const futureRdvs = rdvs.filter((r) => {
    const [rdvH, rdvM] = getHourAndMinute(r.start_hour);
    return rdvH > hour || (rdvH === hour && rdvM > minute);
  });

  if (futureRdvs.length === 0) return null;

  const next = futureRdvs[0];
  return {
    time: next.start_hour,
    patientName: next.name,
    consultationType: next.rdv_type,
  };
}
