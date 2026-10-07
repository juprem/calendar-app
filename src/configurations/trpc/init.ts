import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import type { AuthState } from '#/domain/auth/models.ts'

export type TRPCContext = {
  auth: AuthState
}

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
})

const authedMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx.auth.isAuthenticated) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  if (!ctx.auth.hasCalendarAccess) {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }
  return next({ ctx })
})

export const createTRPCRouter = t.router
export const protectedProcedure = t.procedure.use(authedMiddleware)
export const middleware = t.middleware
