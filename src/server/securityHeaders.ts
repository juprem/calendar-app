export const securityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

export const withSecurityHeaders = (response: Response): Response => {
  const securedResponse = new Response(response.body, response);
  for (const [name, value] of Object.entries(securityHeaders)) securedResponse.headers.set(name, value);
  return securedResponse;
};
