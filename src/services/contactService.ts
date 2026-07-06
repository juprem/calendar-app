import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '#/configurations/trpc/react.ts';
import { notifyErrorService, notifySuccess } from '#/domain/notifications/runtime.ts';

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
      notifySuccess('Contact créé');
    },
    onError: (error) => notifyErrorService(error, 'Erreur lors de la création du contact'),
  });
};

export const useUpdateContact = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.contacts.updateContact.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.contacts.listAll.queryKey() });
      notifySuccess('Contact mis à jour');
    },
    onError: (error) => notifyErrorService(error, 'Erreur lors de la mise à jour du contact'),
  });
};

export const useDeleteContact = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.contacts.deleteContact.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.contacts.listAll.queryKey() });
      notifySuccess('Contact supprimé');
    },
    onError: (error) => notifyErrorService(error, 'Erreur lors de la suppression du contact'),
  });
};

export const useBulkCreateContacts = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.contacts.bulkAddContacts.mutationOptions(),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: trpc.contacts.listAll.queryKey() });
      notifySuccess(`${result.count} contact(s) importé(s)`);
    },
    onError: (error) => notifyErrorService(error, "Erreur lors de l'importation des contacts"),
  });
};
