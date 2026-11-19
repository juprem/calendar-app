# Security — Backlog

## Left out by round

### Round 1 — black-box test fixes (2026-11-18)
- **Content-Security-Policy** — deferred: needs an inventory of Clerk, asset and font origins first; a wrong CSP breaks sign-in. Start with `Content-Security-Policy-Report-Only` to collect violations.
- **Clerk production instance** — not done: prod still runs on the development instance (`pk_test_…`, `key-monarch-40.clerk.accounts.dev`). Needs a Clerk dashboard change and new secrets in the Worker; out of the code's reach.
- **DMARC `p=none`** — left as is: monitor-only; tighten to `quarantine` once Brevo reports show clean alignment.
- **Static assets headers** — not covered if a Workers `assets` binding is added later: those files are served before the Worker runs, so they would need a `public/_headers` file.

### Round 2 — code audit fixes (2026-11-19)
- **Input length limits** — not done: contact fields (`src/domain/contact/models.ts`) and import arrays (`src/domain/dataTransfer/models.ts`) have no `.max()`; needs a decision on each field's maximum.
- **Personal email in `wrangler.jsonc`** — left as is: `REMINDER_TEST_RECIPIENT` is committed; move it to a secret if the repo is or becomes public.
- **End-to-end CSRF check** — not run locally: dev hits the production database, so it waits for the deployed site.

## Questions for UX and future evolutions
- What maximum length should each contact field (name, notes, address) and each import accept?
- Should the app ever be embeddable in another site? `X-Frame-Options: DENY` forbids it; an allow-list would need `frame-ancestors` in a CSP instead.
- Is losing tRPC stack traces in local dev acceptable (`isDev: false`), or should dev keep them via an env-driven flag? Server logs still have them.
