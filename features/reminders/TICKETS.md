# Tickets — Weekly reminder email (Brevo + cron)

> **Scope:** every Sunday at 12:00 (noon, Europe/Paris), email every contact that has an RDV on the following Monday. Only RDV linked to a contact are concerned. A page shows the run result and lets the user resend failed emails and clear the log.
> **Template:** content to be provided later; the tickets assume a Brevo template filled with DB values.

---

### CAL-MAIL-1 — `email_log` table

**Type:** Story · **Priority:** High

**Description**

Log one row per RDV processed by a send (cron or manual).

**Acceptance criteria**

- [ ] Prisma model `email_log`: `id`, `rdv_id` (FK → rdv, `onDelete: Cascade`), `contact_id` (FK → contact), `target_date` (`@db.Date`, the Monday), `recipient` (nullable VarChar), `status` (`SENT` | `FAILED`), `error` (nullable text), `sent_at` DateTime
- [ ] No DB-level defaults (values set by the app)
- [ ] Domain `reminder` scaffolded (`models.ts`, `port/`, `adapter/`, `application/`), router registered
- [ ] `EmailLogRepository` port: `listByTargetDate`, `findSentForRdv(rdvId, targetDate)`, `record`, `clearAll`
- [ ] `npx prisma db push` applied

---

### CAL-MAIL-2 — Brevo email sender adapter

**Type:** Story · **Priority:** High

**Description**

`EmailSender` port with a Live adapter calling Brevo's transactional API, and a mock for tests.

**Acceptance criteria**

- [ ] Live adapter: `POST https://api.brevo.com/v3/smtp/email` with header `api-key`, body `{ to: [{ email, name }], templateId, params }`
- [ ] `params` built from the DB: contact `civility`, `firstname`, `lastname`, RDV `date`, `startHour`, `endHour`, `rdvType` (final list to align with the template)
- [ ] Non-2xx response → typed `EmailSendError` carrying Brevo's error message (stored as the log reason)
- [ ] Secrets via `wrangler secret put`: `BREVO_API_KEY`; vars: `BREVO_TEMPLATE_ID`, `BREVO_SENDER_EMAIL`
- [ ] Mock adapter for tests (success / failure configurable)

**Technical notes**

- Plain `fetch`, no Brevo SDK (Workers runtime, one endpoint)
- Sender domain `olivierabdelnour.dev` must be authenticated in Brevo (SPF/DKIM DNS records on Cloudflare), otherwise emails land in spam
- Template kept in Brevo so its wording can change without a deploy

---

### CAL-MAIL-3 — `sendMondayReminders` mutation

**Type:** Story · **Priority:** High

**Description**

Core logic shared by the cron and the page.

**Acceptance criteria**

- [ ] Target date = next Monday (Europe/Paris), UTC midnight
- [ ] Loads every RDV of that day with a `contact_id`; RDV without contact are ignored
- [ ] Skips an RDV already logged `SENT` for that Monday (cron retried or fired twice → no double email)
- [ ] Contact without email → logged `FAILED`, reason "Le contact n'a pas d'adresse email", no Brevo call
- [ ] Brevo error → logged `FAILED` with the error message; other RDV keep being processed
- [ ] Success → logged `SENT` with the recipient
- [ ] Tests against mocked repositories + mocked sender: no contact, no email, Brevo failure, already sent, mixed batch

---

### CAL-MAIL-4 — Cron trigger on Cloudflare Workers

**Type:** Story · **Priority:** High

**Description**

Run `sendMondayReminders` every Sunday at 12:00 Paris time.

**Acceptance criteria**

- [ ] `wrangler.jsonc`: `"triggers": { "crons": ["0 10,11 * * SUN"] }` (cron is UTC: 12:00 Paris is 10:00 UTC in summer, 11:00 UTC in winter)
- [ ] Handler runs the send only when the current Paris hour is 12, so exactly one of the two triggers acts
- [ ] Custom server entry exporting both the TanStack Start `fetch` handler and a `scheduled` handler (`main` in `wrangler.jsonc` points to it)
- [ ] `scheduled` calls the domain runtime directly (no tRPC, no Clerk — there is no user)
- [ ] Locally testable with `wrangler dev --test-scheduled` + `curl "http://localhost:8787/__scheduled?cron=0+10,11+*+*+SUN"`, against a mocked sender (dev uses the prod DB — no real sends, no test writes)

---

### CAL-MAIL-5 — `reminder` tRPC router

**Type:** Story · **Priority:** High

**Acceptance criteria**

- [ ] `getStatus` → `{ targetDate, rdvWithContactCount, sentCount, failed: [{ logId, rdvId, contact name, startHour, recipient, error }] }`; `targetDate` = the Monday of the latest log rows, or the next Monday when the log is empty; `rdvWithContactCount` is read live from `rdv`
- [ ] `resend(rdvId)` → sends this one RDV again, logs the result (a success replaces the failed row's status), returns it
- [ ] `clearLog` → deletes every `email_log` row
- [ ] Error mapping through `catchDomainErrors`

---

### CAL-MAIL-6 — Reminders page

**Type:** Story · **Priority:** High

**Description**

New page `/rappels` (header nav "Rappels") to check the Sunday run.

**Acceptance criteria**

- [ ] Route `src/routes/_protected/rappels/index.tsx`, link in `Layout.tsx`, data through `src/services/reminderService.ts`
- [ ] Two `MetricCard`: "RDV avec contact lundi <date>" and "Emails envoyés"; a visual warning when they differ
- [ ] List of failed rows: contact name, RDV hour, recipient, reason, and an "Envoyer" button calling `resend` (loading state, toast on result, list refreshed)
- [ ] "Valider" button (`Popconfirm`) calling `clearLog`, then the page shows the empty state
- [ ] Empty state when no run happened yet (`DataState`)

---

## Order

CAL-MAIL-1 → CAL-MAIL-2 → CAL-MAIL-3 → CAL-MAIL-4 → CAL-MAIL-5 → CAL-MAIL-6
