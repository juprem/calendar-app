import type { email_log } from '../../../../generated/prisma/client.ts';
import { EMAIL_STATUS_VALUES, type EmailLog, type EmailLogRecord, type EmailStatus } from '../models.ts';

const isEmailStatus = (status: string): status is EmailStatus =>
  EMAIL_STATUS_VALUES.some((emailStatus) => emailStatus === status);

const toEmailStatus = (status: string): EmailStatus => {
  if (!isEmailStatus(status)) throw new Error(`Unexpected email_log status: ${status}`);
  return status;
};

export const toEmailLog = (row: email_log): EmailLog => ({
  id: row.id,
  rdvId: row.rdv_id,
  contactId: row.contact_id,
  targetDate: row.target_date,
  recipient: row.recipient,
  status: toEmailStatus(row.status),
  error: row.error,
  sentAt: row.sent_at,
});

export const toEmailLogPrismaInput = (emailLog: EmailLogRecord) => ({
  rdv_id: emailLog.rdvId,
  contact_id: emailLog.contactId,
  target_date: emailLog.targetDate,
  recipient: emailLog.recipient,
  status: emailLog.status,
  error: emailLog.error,
  sent_at: emailLog.sentAt,
});
