import type { RdvWithContact } from '#/domain/calendar/models.ts';

/** A cell in the monthly calendar grid — a real day or a padding slot. */
export type MonthCell = { dayNum: number; rdvs: RdvWithContact[] } | null;

/** UI state for a selected RDV with its date context — shared by weekly and monthly views. */
export type SelectedRdv = { rdv: RdvWithContact; isoDate: string };
