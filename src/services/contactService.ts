import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '#/integrations/trpc/react.ts';
import { toast } from 'sonner';

export const useGetAllContacts = () => {
  const trpc = useTRPC();
  return useQuery(trpc.contacts.listAll.queryOptions());
};

export const useGetContactRdv = (contactId: number) => {
  const trpc = useTRPC();
  return useQuery(trpc.contacts.listRdvByContact.queryOptions(contactId));
};

export const useCreateContact = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.contacts.addContact.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.contacts.listAll.queryKey() });
      toast.success('Contact créé');
    },
    onError: () => toast.error('Erreur lors de la création du contact'),
  });
};

export const useUpdateContact = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.contacts.updateContact.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.contacts.listAll.queryKey() });
      toast.success('Contact mis à jour');
    },
    onError: () => toast.error('Erreur lors de la mise à jour du contact'),
  });
};

export const useDeleteContact = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.contacts.deleteContact.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.contacts.listAll.queryKey() });
      toast.success('Contact supprimé');
    },
    onError: () => toast.error('Erreur lors de la suppression du contact'),
  });
};
