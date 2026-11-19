import { describe, expect, it } from 'vitest';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { createTRPCRouter, protectedProcedure } from '#/configurations/trpc/init.ts';

const router = createTRPCRouter({
  ping: protectedProcedure.query(() => 'pong'),
});

describe('tRPC error responses', () => {
  it('omits the stack trace from serialized errors', async () => {
    const response = await fetchRequestHandler({
      req: new Request('https://test/api/trpc/ping'),
      router,
      endpoint: '/api/trpc',
      createContext: () => ({ auth: { isAuthenticated: false, hasCalendarAccess: false } }),
    });
    const responseText = await response.text();

    expect(response.status).toBe(401);
    expect(responseText).toContain('"code":"UNAUTHORIZED"');
    expect(responseText).not.toContain('stack');
  });
});
