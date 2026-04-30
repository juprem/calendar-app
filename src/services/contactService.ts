import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '#/integrations/trpc/react.ts';

export const useGetAllContacts = () => {
  const trpc = useTRPC();

  return useQuery(trpc.contacts.listAll.queryOptions());
};

export const useCreateContact = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.contacts.addContact.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.contacts.listAll.queryKey() });
    },
  });
};
