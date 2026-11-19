import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import type { AuthState } from '#/domain/auth/models.ts'

export type TRPCContext = {
  auth: AuthState
}

const trpcRoot = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  isDev: false,
})

const authedMiddleware = trpcRoot.middleware(({ ctx, next }) => {
  if (!ctx.auth.isAuthenticated) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  if (!ctx.auth.hasCalendarAccess) {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }
  return next({ ctx })
})

export const createTRPCRouter = trpcRoot.router
export const protectedProcedure = trpcRoot.procedure.use(authedMiddleware)
export const middleware = trpcRoot.middleware
