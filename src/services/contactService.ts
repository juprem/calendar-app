import {
  keepPreviousData,
  skipToken,
  type QueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { TRPCOptionsProxy } from '@trpc/tanstack-react-query';
import type { TRPCRouter } from '#/configurations/trpc/router/router.ts';
import { useTRPC } from '#/configurations/trpc/react.ts';
import { notifyErrorService, notifySuccess } from '#/domain/notifications/runtime.ts';

export const contactSearchOptions = (trpc: TRPCOptionsProxy<TRPCRouter>, search: string) =>
  trpc.contacts.search.infiniteQueryOptions(
    { search },
    { getNextPageParam: (page) => page.nextCursor, placeholderData: keepPreviousData },
  );

/** After a contact write: searches restart from their first page instead of refetching every loaded page, read contacts refetch, and cached homonym answers are dropped. */
const refreshContactQueries = (queryClient: QueryClient, trpc: TRPCOptionsProxy<TRPCRouter>) => {
  queryClient.resetQueries({ queryKey: trpc.contacts.search.pathKey() });
  queryClient.invalidateQueries({ queryKey: trpc.contacts.getById.pathKey() });
  queryClient.removeQueries({ queryKey: trpc.contacts.hasHomonym.pathKey() });
};

export const useSearchContacts = (search: string) => {
  const trpc = useTRPC();
  return useInfiniteQuery(contactSearchOptions(trpc, search));
};

export const useGetContact = (contactId: number | null) => {
  const trpc = useTRPC();
  return useQuery(trpc.contacts.getById.queryOptions(contactId ?? skipToken));
};

/** Homonym lookup for the contact form; answers are cached per normalised name until the next contact write, since the create/update mutation stays the authority on submit. */
export const useCheckContactHomonym = (excludingContactId: number | undefined) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return (firstname: string, lastname: string) =>
    queryClient.fetchQuery({
      ...trpc.contacts.hasHomonym.queryOptions({
        firstname: firstname.trim().toLowerCase(),
        lastname: lastname.trim().toLowerCase(),
        excludingContactId,
      }),
      staleTime: Infinity,
    });
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
      refreshContactQueries(queryClient, trpc);
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
      refreshContactQueries(queryClient, trpc);
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
      refreshContactQueries(queryClient, trpc);
      notifySuccess('Contact supprimé');
    },
    onError: (error) => notifyErrorService(error, 'Erreur lors de la suppression du contact'),
  });
};
