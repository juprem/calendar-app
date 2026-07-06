import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { createFileRoute } from '@tanstack/react-router'
import { trpcRouter } from '#/configurations/trpc/router/router.ts';
import { requireCalendarAccess } from '#/server/auth.ts';
import { auth } from '@clerk/tanstack-react-start/server';

async function handler({ request }: { request: Request }) {
  const authState = await auth()

  const response = await fetchRequestHandler({
    req: request,
    router: trpcRouter,
    endpoint: '/api/trpc',
    createContext: () => ({ auth: authState }),
  })

  const body = await response.text()

  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  })
}

export const Route = createFileRoute('/api/trpc/$')({
  beforeLoad: async () => await requireCalendarAccess(),
  server: {
    handlers: {
      GET: handler,
      POST: handler,
    },
  },
})
