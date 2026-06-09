import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import type { auth } from '@clerk/tanstack-react-start/server'

export type TRPCContext = {
  auth: Awaited<ReturnType<typeof auth>>
}

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
})

const authedMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx.auth.isAuthenticated) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  if (!ctx.auth.has({ role: 'calendar_access' })) {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }
  return next({ ctx })
})

export const createTRPCRouter = t.router
export const protectedProcedure = t.procedure.use(authedMiddleware)
