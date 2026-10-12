import z from 'zod';
import type { ISODate } from '#/utils/dateUtils.ts';

export const EMAIL_STATUS_VALUES = ['SENT', 'FAILED'] as const;
export type EmailStatus = (typeof EMAIL_STATUS_VALUES)[number];

export interface EmailLog {
  readonly id: number;
  readonly rdvId: number;
  readonly contactId: number;
  readonly targetDate: Date;
  readonly recipient: string | null;
  readonly status: EmailStatus;
  readonly error: string | null;
  readonly sentAt: Date;
}

export type EmailLogRecord = Omit<EmailLog, 'id'>;

export interface ReminderParams {
  readonly civility: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly date: string;
  readonly startHour: string;
  readonly endHour: string;
  readonly rdvType: string;
}

export interface ReminderEmail {
  readonly to: { readonly email: string; readonly name: string };
  readonly params: ReminderParams;
}

export interface FailedReminder {
  readonly logId: number;
  readonly contactName: string;
  readonly startHour: string;
  readonly recipient: string | null;
  readonly error: string | null;
}

export interface ReminderStatus {
  readonly targetDate: ISODate;
  readonly hasRun: boolean;
  readonly rdvWithContactCount: number;
  readonly sentCount: number;
  readonly failed: FailedReminder[];
}

export const ResendReminderSchema = z.number().int().positive();

export const MISSING_EMAIL_ERROR = "Le contact n'a pas d'adresse email";
