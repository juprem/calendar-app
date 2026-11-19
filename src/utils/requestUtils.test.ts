import { describe, expect, it } from 'vitest';
import { needsOriginCheck } from '#/utils/requestUtils.ts';

const buildRequest = (method: string) => new Request('https://test/api/trpc/reminder.clearLog', { method });

describe('needsOriginCheck', () => {
  it.each(['POST', 'PUT', 'PATCH', 'DELETE'])('checks a %s to a route', (method) => {
    expect(needsOriginCheck('router', buildRequest(method))).toBe(true);
  });

  it.each(['GET', 'HEAD', 'OPTIONS'])('skips a %s to a route, so cross-site links still work', (method) => {
    expect(needsOriginCheck('router', buildRequest(method))).toBe(false);
  });

  it('checks every server function call, GET included', () => {
    expect(needsOriginCheck('serverFn', buildRequest('GET'))).toBe(true);
  });
});
