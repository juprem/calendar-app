import { Alert, Button, Popconfirm } from 'antd';
import dayjs from 'dayjs';
import { CheckCheck, MailCheck, MailQuestion } from 'lucide-react';
import { Card } from '#/components/Card/Card.tsx';
import { DataState } from '#/components/DataState/DataState.tsx';
import { MetricCard } from '#/components/MetricCard/MetricCard.tsx';
import { useClearReminderLog, useReminderStatus, useSendTestEmail } from '#/services/reminderService.ts';
import { FailedReminderList } from './FailedReminderList.tsx';

export function Reminders() {
  const { data: reminderStatus, isLoading, isError } = useReminderStatus();
  const clearReminderLog = useClearReminderLog();
  const sendTestEmail = useSendTestEmail();
  const targetDateLabel = dayjs(reminderStatus?.targetDate).format('D MMMM');

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-lg font-bold text-[#1C1917]">Rappels du lundi</h1>
          <div className="flex items-center gap-2">
            <Button shape="round" size="small" loading={sendTestEmail.isPending} onClick={() => sendTestEmail.mutate()}>
              Email de test
            </Button>
            {reminderStatus?.hasRun && (
              <Popconfirm
                title="Valider les envois ?"
                description="L'historique des envois sera effacé."
                okText="Valider"
                cancelText="Annuler"
                onConfirm={() => clearReminderLog.mutate()}
              >
                <Button type="primary" shape="round" size="small" icon={<CheckCheck size={13} />} loading={clearReminderLog.isPending}>
                  Valider
                </Button>
              </Popconfirm>
            )}
          </div>
        </div>

        <DataState
          isLoading={isLoading}
          isError={isError}
          isEmpty={!reminderStatus?.hasRun}
          emptyIcon={<MailQuestion size={40} className="text-[#D6D3D1]" />}
          emptyText={`Aucun envoi pour le moment. Prochain envoi dimanche à 12h pour le lundi ${targetDateLabel}.`}
        >
          {reminderStatus && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MetricCard
                  label={`RDV avec contact lundi ${targetDateLabel}`}
                  value={reminderStatus.rdvWithContactCount}
                />
                <MetricCard label="Emails envoyés" value={reminderStatus.sentCount} />
              </div>
              {reminderStatus.sentCount !== reminderStatus.rdvWithContactCount && (
                <Alert
                  type="warning"
                  showIcon
                  message={`${reminderStatus.rdvWithContactCount - reminderStatus.sentCount} RDV n'ont pas reçu de rappel`}
                />
              )}
              {reminderStatus.failed.length > 0 ? (
                <Card>
                  <p className="text-xs text-[#78716C] mb-1 font-medium uppercase tracking-wide">Envois en échec</p>
                  <FailedReminderList failedReminders={reminderStatus.failed} />
                </Card>
              ) : (
                <p className="flex items-center gap-2 text-sm text-[#78716C]">
                  <MailCheck size={16} className="text-green-600" /> Aucun envoi en échec
                </p>
              )}
            </>
          )}
        </DataState>
      </div>
    </div>
  );
}
