import { createTRPCContext } from '@trpc/tanstack-react-query'
import type { TRPCRouter } from '#/configurations/trpc/router/router.ts';

export const { TRPCProvider, useTRPC } = createTRPCContext<TRPCRouter>()
