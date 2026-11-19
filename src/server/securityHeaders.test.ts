import { describe, expect, it } from 'vitest';
import { securityHeaders, withSecurityHeaders } from '#/server/securityHeaders.ts';

describe('withSecurityHeaders', () => {
  it('adds every security header and keeps status, headers and body', async () => {
    const original = new Response('hello', { status: 404, headers: { 'Content-Type': 'text/plain' } });

    const secured = withSecurityHeaders(original);

    for (const [name, value] of Object.entries(securityHeaders)) expect(secured.headers.get(name)).toBe(value);
    expect(secured.status).toBe(404);
    expect(secured.headers.get('Content-Type')).toBe('text/plain');
    expect(await secured.text()).toBe('hello');
  });

  it('secures redirects, whose headers are immutable', () => {
    const secured = withSecurityHeaders(Response.redirect('https://example.test/sign-in', 307));

    expect(secured.status).toBe(307);
    expect(secured.headers.get('Location')).toBe('https://example.test/sign-in');
    expect(secured.headers.get('X-Frame-Options')).toBe('DENY');
  });
});
