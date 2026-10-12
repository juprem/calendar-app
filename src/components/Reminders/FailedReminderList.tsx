import { Button } from 'antd';
import { Send } from 'lucide-react';
import type { FailedReminder } from '#/domain/reminder/models.ts';
import { useResendReminder } from '#/services/reminderService.ts';

interface FailedReminderListProps {
  failedReminders: FailedReminder[];
}

export function FailedReminderList({ failedReminders }: FailedReminderListProps) {
  const resendReminder = useResendReminder();

  return (
    <ul className="flex flex-col divide-y divide-[#E7E5E4]">
      {failedReminders.map((failedReminder) => {
        const isResendingThisReminder = resendReminder.isPending && resendReminder.variables === failedReminder.logId;
        return (
          <li key={failedReminder.logId} className="flex items-center justify-between gap-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#1C1917]">
                {failedReminder.contactName}
                {failedReminder.startHour && <span className="text-[#78716C]"> · {failedReminder.startHour}</span>}
              </p>
              <p className="text-xs text-[#78716C] truncate">{failedReminder.recipient ?? 'Aucune adresse email'}</p>
              <p className="text-xs text-red-600">{failedReminder.error}</p>
            </div>
            <Button
              shape="round"
              size="small"
              icon={<Send size={13} />}
              loading={isResendingThisReminder}
              onClick={() => resendReminder.mutate(failedReminder.logId)}
            >
              Envoyer
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
