import { createTRPCContext } from '@trpc/tanstack-react-query'
import type { TRPCRouter } from '#/integrations/trpc/router/router.ts';

export const { TRPCProvider, useTRPC } = createTRPCContext<TRPCRouter>()
