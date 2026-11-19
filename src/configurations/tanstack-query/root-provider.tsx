import type { ReactNode } from 'react';
import { QueryClient } from '@tanstack/react-query';
import superjson from 'superjson';
import { createTRPCClient, httpBatchLink, localLink } from '@trpc/client';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import { createIsomorphicFn } from '@tanstack/react-start';

import { trpcRouter, type TRPCRouter } from '#/configurations/trpc/router/router.ts';
import { TRPCProvider } from '#/configurations/trpc/react';
import { createTRPCContext } from '#/configurations/trpc/init.ts';

const getTRPCLinks = createIsomorphicFn()
  .server(() => [
    localLink({
      router: trpcRouter,
      transformer: superjson,
      createContext: createTRPCContext,
    }),
  ])
  .client(() => [httpBatchLink({ transformer: superjson, url: '/api/trpc' })]);

const trpcClient = createTRPCClient<TRPCRouter>({ links: getTRPCLinks() });

export function getContext() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
      dehydrate: { serializeData: superjson.serialize },
      hydrate: { deserializeData: superjson.deserialize },
    },
  });

  const serverHelpers = createTRPCOptionsProxy({
    client: trpcClient,
    queryClient: queryClient,
  });
  const context = {
    queryClient,
    trpc: serverHelpers,
  };

  return context;
}

export default function TanstackQueryProvider({
  children,
  context,
}: {
  children: ReactNode;
  context: ReturnType<typeof getContext>;
}) {
  const { queryClient } = context;

  return (
    <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
      {children}
    </TRPCProvider>
  );
}
