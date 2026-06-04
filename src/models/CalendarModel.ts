import type { day, rdv, contact } from '../../generated/prisma/client.ts';

/** An RDV with its optionally-linked contact eager-loaded. */
export type RdvWithContact = rdv & { contact: contact | null };

/** A calendar day record with its nested appointments (contact included). */
export type DayWithRdv = day & { rdv: RdvWithContact[] };

/** A cell in the monthly calendar grid — a real day or a padding slot. */
export type MonthCell = { dayNum: number; rdvs: RdvWithContact[] } | null;

/** An RDV with its day date and linked contact — used in the contact's RDV list. */
export type RdvWithDay = rdv & { day: { date: Date }; contact: contact | null };
