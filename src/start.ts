import { createStart, createCsrfMiddleware } from '@tanstack/react-start';
import { clerkMiddleware } from '@clerk/tanstack-react-start/server';
import { needsOriginCheck } from '#/utils/requestUtils.ts';

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => needsOriginCheck(ctx.handlerType, ctx.request),
})


export const startInstance = createStart(() => {
  return {
    requestMiddleware: [clerkMiddleware(), csrfMiddleware],
  };
});
