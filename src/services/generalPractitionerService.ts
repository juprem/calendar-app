import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '#/integrations/trpc/react.ts';
import { toast } from 'sonner';

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
      toast.success('Médecin traitant ajouté');
    },
    onError: () => toast.error('Erreur lors de l\'ajout du médecin traitant'),
  });
};
