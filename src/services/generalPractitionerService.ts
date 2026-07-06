import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '#/configurations/trpc/react.ts';
import { notifyErrorService, notifySuccess } from '#/domain/notifications/runtime.ts';

export const useGetAllGeneralPractitioners = () => {
  const trpc = useTRPC();
  return useQuery(trpc.generalPractitioner.listAll.queryOptions());
};

export const useCreateGeneralPractitioner = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.generalPractitioner.add.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.generalPractitioner.listAll.queryKey() });
      notifySuccess('Médecin traitant ajouté');
    },
    onError: (error) => notifyErrorService(error, 'Erreur lors de l\'ajout du médecin traitant'),
  });
};

export const useUpdateGeneralPractitioner = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.generalPractitioner.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.generalPractitioner.listAll.queryKey() });
      notifySuccess('Médecin traitant mis à jour');
    },
    onError: (error) => notifyErrorService(error, 'Erreur lors de la mise à jour du médecin traitant'),
  });
};

export const useDeleteGeneralPractitioner = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.generalPractitioner.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.generalPractitioner.listAll.queryKey() });
      notifySuccess('Médecin traitant supprimé');
    },
    onError: (error) => notifyErrorService(error, 'Erreur lors de la suppression du médecin traitant'),
  });
};
