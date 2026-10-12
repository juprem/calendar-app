import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '#/configurations/trpc/react.ts';
import { notifyErrorService, notifySuccess } from '#/domain/notifications/runtime.ts';

export const useReminderStatus = () => {
  const trpc = useTRPC();
  return useQuery(trpc.reminder.getStatus.queryOptions());
};

export const useResendReminder = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.reminder.resend.mutationOptions(),
    onSuccess: (emailLog) => {
      queryClient.invalidateQueries({ queryKey: trpc.reminder.getStatus.queryKey() });
      if (emailLog.status === 'SENT') notifySuccess(`Email envoyé à ${emailLog.recipient}`);
      else notifyErrorService({ message: emailLog.error ?? '' }, "L'envoi a de nouveau échoué");
    },
    onError: (error) => notifyErrorService(error, "Erreur lors du renvoi de l'email"),
  });
};

export const useClearReminderLog = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.reminder.clearLog.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.reminder.getStatus.queryKey() });
      notifySuccess('Historique des envois validé');
    },
    onError: (error) => notifyErrorService(error, "Erreur lors de la validation de l'historique"),
  });
};

export const useSendTestEmail = () => {
  const trpc = useTRPC();

  return useMutation({
    ...trpc.reminder.sendTest.mutationOptions(),
    onSuccess: (recipient) => notifySuccess(`Email de test envoyé à ${recipient}`),
    onError: (error) => notifyErrorService(error, "Erreur lors de l'envoi de l'email de test"),
  });
};
