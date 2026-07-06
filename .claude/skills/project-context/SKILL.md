---
name: project-context
description: >
  Loads the full context of this calendar-app project — tech stack, architecture, feature map, database schema, and dev workflow. This skill MUST be invoked at the start of every Claude Code session in this repository. Use it any time you are about to write code, add a feature, fix a bug, or answer a question about how this project works. If you haven't loaded this context yet and are about to touch any file in this repo, load it now. Do not rely on general knowledge about TanStack, tRPC, or Prisma — always check the actual versions and conventions used here first.
---

# Calendar App — Project Context

This is a **professional scheduling tool** for managing appointments (RDV = rendez-vous) and contacts. It runs as a full-stack SSR React app deployed on Cloudflare Workers at `calendar.olivierabdelnour.dev`.

---

## Tech Stack

| Layer | Library / Tool | Version |
|---|---|---|
| SSR Framework | TanStack Start | latest |
| Routing | TanStack Router (file-based) | latest |
| Server State | TanStack Query | latest |
| UI Runtime | React | 19.2.3 |
| Language | TypeScript (strict) | 6.0.2 |
| Build | Vite | 7.3.2 |
| API | tRPC | 11.11.0 |
| ORM | Prisma | 7.x |
| Database | NeonDB (serverless PostgreSQL) | — |
| Auth | Clerk (`@clerk/tanstack-react-start`) | — |
| UI Components | Ant Design | 6.3.7 |
| Styling | Tailwind CSS | 4.1.18 |
| Icons | Lucide React | 0.545.0 |
| Client State | Zustand | 5.0.12 |
| Dates | Day.js | 1.11.20 |
| Serialization | SuperJSON | 2.2.2 |
| Deployment | Cloudflare Workers | — |
| CLI | Wrangler | 4.70.0 |
| Optimizer | React Compiler (Babel) | 1.0.0 |

**Path aliases**: Both `@/*` and `#/*` resolve to `./src/*`. Use either.

---

## Architecture

Every business domain (`calendar`, `contact`, `generalPractitioner`) is its own self-contained **hexagonal module** under `src/domain/<name>/`, built on the `effect` library (ports/adapters, typed errors, no direct Prisma coupling above the adapter layer). `src/server/` no longer holds domain logic — only `auth.ts` (the Clerk access check) remains there, unrelated to this pattern.

```
Browser
  └─ TanStack Router   src/routes/                                        (file = route, SSR)
       └─ Components   src/components/                                    (UI, calls service hooks)
            └─ Services  src/services/                                    (hooks wrapping tRPC — calendarService.ts, contactService.ts, generalPractitionerService.ts)
                 └─ Controller  src/domain/<name>/application/controllers/<name>Router.ts
                      (tRPC procedures: validate input with Zod, delegate to a query/mutation,
                       map typed domain errors → TRPCError via a shared middleware)
                      └─ Query / Mutation  src/domain/<name>/application/{queries,mutations}/
                           (plain function returning an UN-PROVIDED Effect — pure business logic,
                            depends only on a Port interface, zero Prisma awareness, independently
                            unit-testable against a mocked Port)
                           └─ Composition root  src/domain/<name>/application/controllers/runtime.ts
                                (the ONLY place that binds a Port to its concrete Live Adapter and
                                 converts the Effect to a Promise, via #/effect/runEffect.ts)
                                └─ Port  src/domain/<name>/port/       (Context.Tag contracts — no Prisma import)
                                     └─ Adapter  src/domain/<name>/adapter/   (Prisma-backed Live layer;
                                          mappers.ts is the ONLY file per domain that imports
                                          generated/prisma/client.ts)
                                          └─ Prisma  src/db.ts
                                               └─ NeonDB  (PostgreSQL)
```

All Effect plumbing — including domain-specific typed errors — lives in one place: `src/effect/`: `errors.ts` (`DbError`, `toDbError`, `NotFoundError`, and every domain error such as `RdvConflictError` and `ContactConflictError`), `runEffect.ts` (the `Cause`/`Exit`-unwrapping Promise adapter — needed because `Effect.runPromise` normally rejects with an opaque `FiberFailure` wrapper, not the real typed error), `testSupport.ts` (`runAndExpectFailure`, the test-side mirror of the same unwrapping). No domain has its own `errors.ts` — every port, adapter, mutation, and router imports error classes directly from `#/effect/errors.ts`, even ones specific to a single domain (e.g. `RdvConflictError` is only thrown by `calendar`'s `scheduleRdv`/`updateRdv`, but still lives and is imported from `#/effect/errors.ts`). This was a deliberate choice over a per-domain re-export file, to avoid every domain needing a thin `errors.ts` that just re-exports the shared errors and adds one of its own — one import path for all error types, full stop.

**Why this shape**: hand-declared domain models (`models.ts` in each domain) are deliberately NOT type aliases of Prisma's generated types, even though they're often structurally identical to them — this keeps `port`/`application` fully decoupled from the ORM. The trade-off is accepted deliberately: TypeScript won't flag domain models as stale if the Prisma schema changes; `adapter/mappers.ts` is the one place that would need updating.

**Model ownership**: each entity — and its full lifecycle, i.e. the read shape plus its create/update Zod schemas and inferred DTO types — has exactly one canonical declaration, in that entity's owning domain's `models.ts` (e.g. `Contact`/`CreateContactSchema`/`UpdateContactSchema` all live in `src/domain/contact/models.ts`; `Rdv`/`RdvWithContact`/`RdvCreateSchema`/`UpdateRdvSchema` in `src/domain/calendar/models.ts`; `GeneralPractitioner`/its Create/Update schemas in `src/domain/generalPractitioner/models.ts`). A domain that needs another domain's model (e.g. `calendar`'s `RdvWithContact` needing `contact`'s `Contact`, or `contact`'s `RdvHistoryEntry` composing `calendar`'s `RdvWithContact`) imports it directly rather than re-declaring it — cross-domain imports at the model/mapper/port level are expected here, not a smell. `src/models/*.ts` no longer independently mirrors these shapes; it only holds what's genuinely frontend-only and has no domain equivalent (Ant Design option lists/labels, colour/style lookups, `Dayjs`-based form-value shapes, small formatting helpers), importing the domain's types/value-lists where it needs them (e.g. `RdvModel.ts`'s `RDV_TYPE_OPTIONS` maps over `RDV_TYPE_VALUES` imported from `#/domain/calendar/models.ts`). Components import entity/DTO types directly from `src/domain/<name>/models.ts`, not through `src/models/*.ts`.

### Directory map

| Path | What lives here |
|---|---|
| `src/routes/` | TanStack Router pages — one file per route, nested under the `_protected` layout route |
| `src/components/` | Feature-scoped React components (see the full tree below) |
| `src/services/` | Domain hooks wrapping tRPC (`calendarService.ts`, `contactService.ts`, `generalPractitionerService.ts`) — this is the ONE layer that still sits outside `src/domain/` |
| `src/domain/<name>/` | A self-contained hexagonal module per business domain (`calendar`, `contact`, `generalPractitioner`) — `models.ts`, `testSupport.ts` (or `adapter/*-repository-mock.ts`), `port/`, `adapter/`, `application/{queries,mutations,controllers}/` — see Architecture above. No domain has its own `errors.ts`; all error classes (shared and domain-specific alike) live in `src/effect/errors.ts` |
| `src/effect/` | Effect kernel shared by every domain module: `errors.ts` (every error class in the app, shared or domain-specific), `runEffect.ts`, `testSupport.ts` |
| `src/configurations/trpc/` | tRPC init (`init.ts` — exports `protectedProcedure` and the raw `middleware` builder), React hooks, and the root router (`router/router.ts`, which just merges each domain's controller router) |
| `src/server/auth.ts` | Clerk access check (`requireCalendarAccess`) — the only thing left in `src/server/` |
| `src/store/` | Zustand stores (client-only UI state) |
| `src/models/` | Frontend-only display/option/style artifacts, one file per entity (e.g. `CalendarModel.ts`, `ContactModel.ts`) — importing types/value-lists from the owning domain's `models.ts` where needed. Entity types and create/update Zod schemas live in `src/domain/<name>/models.ts`, not here |
| `src/utils/` | Cross-feature pure helpers (`dateUtils.ts`, `timeUtils.ts`, `contactUtils.ts`) |
| `src/db.ts` | Prisma client singleton with Neon adapter |
| `src/start.ts` | TanStack Start config — registers `clerkMiddleware()` + CSRF middleware |
| `prisma/schema.prisma` | Database schema |

### Component Directory Tree

`src/components/` in full — use this to navigate straight to a file instead of guessing a path:

```
src/components/
├── Card/Card.tsx
├── MetricCard/MetricCard.tsx
├── RdvStatusIcon.tsx
├── DataState/DataState.tsx              — shared isLoading/isError/isEmpty primitive; every list/detail view renders through this
├── VirtualizedList/VirtualizedList.tsx  — generic @tanstack/react-virtual + DataState wrapper; pass items/renderItem/estimateSize
├── Layout/
│   ├── Layout.tsx                       — app shell + header nav
│   ├── CalendarFilterBar.tsx
│   ├── AddContact/
│   │   ├── AddContact.tsx               — trigger button
│   │   └── AddContactModal.tsx
│   ├── AddRdv/
│   │   ├── AddRdv.tsx                   — trigger button
│   │   ├── ContactSelectField.tsx
│   │   ├── EditRdvModal.tsx
│   │   ├── RdvDetailModal.tsx
│   │   └── RdvEditForm.tsx
│   └── ImportContacts/
│       ├── ImportContacts.tsx           — trigger button
│       ├── ImportContactsModal.tsx
│       └── xlsxUtils.ts                 — parses an uploaded .xlsx into CreateContact[] for bulkAddContacts
├── DailyView/
│   ├── DailyView.tsx
│   ├── DailyViewWrapper.tsx             — fetches via calendarService, passes data to DailyView (Wrapper+View pattern)
│   ├── DayNavigator.tsx
│   └── RdvCard/RdvCard.tsx
├── WeeklyView/
│   ├── WeeklyView.tsx
│   ├── WeeklyViewWrapper.tsx
│   ├── WeekSelector.tsx
│   └── grid/
│       ├── WeekTimeGrid.tsx
│       ├── HourLabel.tsx
│       ├── weeklyViewConstants.ts
│       ├── hooks/useDragToCreate.ts     — feature-scoped hook, exempt from the directory file-count convention
│       └── day/
│           ├── WeekDayColumn.tsx
│           ├── WeekDayHeader.tsx
│           └── WeekRdvBlock.tsx
├── MonthlyView/
│   ├── MonthlyView.tsx
│   ├── MonthlyViewWrapper.tsx
│   ├── MonthSelector.tsx
│   ├── CalendarCell.tsx
│   ├── CalendarRdvItem.tsx
│   ├── CellOverflow.tsx
│   └── RdvDayListModal.tsx
└── Contacts/                            — /contacts page; see below for the sidebar's internal split
    ├── Contacts.tsx                     — page root: fetches contacts, owns selectedId/isEditing, renders sidebar + detail panel
    ├── GeneralPractitionerFormModal.tsx — shared create/edit form modal for general_practitioner (used by both the sidebar and the contact form)
    ├── hooks/
    │   └── useDebouncedSearch.ts        — shared debounced search-input hook (feature-scoped, exempt from file-count convention)
    ├── ContactList/                     — the "Contacts" sidebar tab
    │   ├── ContactList.tsx              — orchestrator: owns only the Contacts/Médecins Segmented toggle
    │   ├── ContactListPanel.tsx         — contacts search state + filtering + VirtualizedList of ContactListItem
    │   └── ContactListItem.tsx          — one contact row
    ├── PractitionerList/                — the "Médecins traitants" sidebar tab — fully self-contained
    │   ├── PractitionerList.tsx         — fetches its own data, owns search + "+" create button + create/edit modal target state
    │   └── PractitionerListItem.tsx     — one practitioner row (edit pencil + delete with Popconfirm)
    └── ContactDetail/
        ├── ContactDetail.tsx            — read-only detail panel
        ├── ContactAvatar.tsx            — initials avatar, shared by contacts and practitioners
        ├── ContactRdvList.tsx           — a contact's appointment history
        ├── GeneralPractitionerDisplayName.tsx
        └── ContactEdit/
            ├── ContactEditForm.tsx
            ├── ContactFormFields.tsx
            └── GeneralPractitionerSelectField/
                └── GeneralPractitionerSelectField.tsx  — inline GP picker + "create" trigger inside the contact form
```

**Directory convention**: keep at most ~3 files directly inside a feature directory before splitting into a sub-module (see `ContactList/`, `PractitionerList/` above). A `hooks/` (or `utils/`) subdirectory scoped to one feature is exempt from that limit — see `Contacts/hooks/` and `WeeklyView/grid/hooks/`.

### Component File Map (fast lookup — see the tree above for the rest)

| Component | File |
|---|---|
| App shell + header nav | `src/components/Layout/Layout.tsx` |
| Contacts page root | `src/components/Contacts/Contacts.tsx` |
| Contacts/Médecins sidebar toggle | `src/components/Contacts/ContactList/ContactList.tsx` |
| Contact detail panel | `src/components/Contacts/ContactDetail/ContactDetail.tsx` |
| Daily calendar view | `src/components/DailyView/DailyViewWrapper.tsx` |
| Weekly calendar view | `src/components/WeeklyView/WeeklyViewWrapper.tsx` |
| Monthly calendar view | `src/components/MonthlyView/MonthlyViewWrapper.tsx` |
| Generic virtualized list | `src/components/VirtualizedList/VirtualizedList.tsx` |
| Loading/error/empty primitive | `src/components/DataState/DataState.tsx` |

### Route → Component map

Routes live under the `_protected` layout route (`src/routes/_protected.tsx`), which gates every child route behind `requireCalendarAccess()`.

| URL | Route file | Component |
|---|---|---|
| `/` | `src/routes/index.tsx` | Redirects to `/journaliere` |
| `/journaliere` | `src/routes/_protected/journaliere/index.tsx` | `DailyViewWrapper` |
| `/hebdomadaire` | `src/routes/_protected/hebdomadaire/index.tsx` | `WeeklyViewWrapper` |
| `/mensuelle` | `src/routes/_protected/mensuelle/index.tsx` | `MonthlyViewWrapper` |
| `/contacts` | `src/routes/_protected/contacts/index.tsx` | `Contacts` |
| `/api/trpc/*` | `src/routes/api.trpc.$.tsx` | tRPC fetch handler |
| `/forbidden` | `src/routes/forbidden/index.tsx` | Access denied |
| `/sign-in` | `src/routes/sign-in/` | Clerk sign-in |

### Authentication

- Provider: Clerk, wired in `src/routes/__root.tsx`; `src/start.ts` registers `clerkMiddleware()` + CSRF middleware at the request level
- Gate: `src/routes/_protected.tsx` — a layout route whose `beforeLoad` calls `requireCalendarAccess()`
- Access check: `src/server/auth.ts` (`requireCalendarAccess`, a `createServerFn`) — redirects to `/sign-in` if unauthenticated, `/forbidden` if missing the `calendar_access` Clerk role
- Only users with the `calendar_access` role can reach any route nested under `_protected`

### tRPC conventions

- Instance + context: `src/configurations/trpc/init.ts` — exports `protectedProcedure` (the Clerk-authed base procedure) and `middleware` (raw `t.middleware`, used by each domain to build its own error-catching middleware); uses SuperJSON transformer, no context
- React hooks entry point: `src/configurations/trpc/react.ts`
- Root router: `src/configurations/trpc/router/router.ts` — merges each domain's controller router (`src/domain/<name>/application/controllers/<name>Router.ts`)
- HTTP endpoint: `src/routes/api.trpc.$.tsx` — `createContext` must be `() => ({})`, never `createTRPCContext` from `@trpc/tanstack-react-query`
- Client setup: `src/configurations/tanstack-query/root-provider.tsx` — uses `httpBatchStreamLink` + SuperJSON
- Routers are thin adapters — validate input with Zod, then call `runCalendarEffect`/`runContactEffect`/`runGeneralPractitionerEffect` (each domain's own composition-root function in its `runtime.ts`) around an Effect. When a procedure composes real invariants (find-or-create `day`, RDV overlap conflicts, GP-existence checks), that Effect is a named function in `application/{queries,mutations}/` — the router just calls it. When a procedure is pure 1:1 delegation to a port method with no added logic (e.g. `deleteRdv`, `listAll`), it inlines a small `Effect.gen` calling the port directly in the router instead of a dedicated one-line wrapper file — a named application-layer function exists only when it earns its keep over just calling the port. This is a deliberate rule, not an inconsistency: some procedures call a named function, others inline the port, depending on whether there's real logic to name.
- Each domain's router builds its `catch<Name>Errors` middleware via `catchDomainErrors(errorMappings)` from `#/effect/toTRPCError/toTRPCError.ts` (shared across all three domains) instead of hand-writing an `instanceof` cascade — each router passes only its own domain-specific `[isMatch, code]` mappings (e.g. calendar: `RdvConflictError`→`CONFLICT`, `NotFoundError`→`NOT_FOUND`; GP: just `NotFoundError`→`NOT_FOUND`). `DbError` → generic `INTERNAL_SERVER_ERROR` and the final rethrow-unchanged fallback are handled once, inside `catchDomainErrors` itself.

#### Current tRPC procedures

| Router | Procedure | Input | Description |
|---|---|---|---|
| `calendar` | `listByDay` | `string` (ISO date) | Fetch a day + its RDVs |
| `calendar` | `listByWeek` | `{ startDay, startMonth, startYear }` | Fetch 7 days of RDVs |
| `calendar` | `listByMonth` | `{ month, year }` | Fetch all days in month |
| `calendar` | `addRdv` | `RdvCreateSchema` | Create a new RDV (throws `CONFLICT` on overlap) |
| `calendar` | `updateRdv` | `UpdateRdvSchema` | Update an existing RDV |
| `calendar` | `deleteRdv` | `number` | Delete an RDV |
| `contacts` | `listAll` | — | Fetch all contacts |
| `contacts` | `addContact` | `CreateContactSchema` | Create a new contact |
| `contacts` | `updateContact` | `UpdateContactSchema` | Update an existing contact |
| `contacts` | `deleteContact` | `number` | Delete a contact |
| `contacts` | `listRdvByContact` | `number` | Fetch a contact's appointment history |
| `contacts` | `bulkAddContacts` | `CreateContactSchema[]` | Bulk-import contacts (skips duplicates), powers `ImportContacts` |
| `generalPractitioner` | `listAll` | — | Fetch all general practitioners |
| `generalPractitioner` | `add` | `CreateGeneralPractitionerSchema` | Create a practitioner |
| `generalPractitioner` | `update` | `UpdateGeneralPractitionerSchema` | Update a practitioner |
| `generalPractitioner` | `delete` | `number` | Delete a practitioner (fails if still referenced by a contact — FK is `onDelete: NoAction`) |

- **Convention**: add new procedures to the matching domain's `application/controllers/<name>Router.ts`; for a genuinely new domain, scaffold the full `port/adapter/application` structure (see Architecture above) and register the new controller router in `src/configurations/trpc/router/router.ts`

**Testing**: every query/mutation function has a colocated `*.test.ts` (e.g. `application/mutations/scheduleRdv.test.ts`) that runs against a mocked `Layer` (see each domain's `testSupport.ts` for `mock<Name>Repository` factories) via `Effect.provide` + `Effect.runPromise` — never against Prisma or a real DB. Run the whole suite with `npm test` (Vitest, configured in `vitest.config.ts` at the repo root — `environment: 'node'`, no jsdom needed for these domain tests since nothing here touches the DOM).

### State split

- **Server state** (DB data): TanStack Query via tRPC hooks — never store in Zustand
- **Client UI state** (non-persisted): Zustand at `src/store/calendarStore.ts`
  - `calendarMode`: `DAILY | WEEKLY | MONTHLY`
  - `selectedDay`: the currently viewed date
- List-local UI state (search text, active tab, modal-target) lives inside the owning component via `useState`/small custom hooks — see `ContactList.tsx`'s Segmented toggle and `PractitionerList.tsx`'s self-contained fetch+search+modal state

---

## Database Schema

Defined in `prisma/schema.prisma` (PostgreSQL via Neon). Generated client output: `generated/prisma/`.

**`day`** — a calendar date
- `id` (PK, auto-increment)
- `date DateTime @unique @db.Date` — stored as a UTC date (`YYYY-MM-DDT00:00:00.000Z`)
- Relation: one `day` → many `rdv`

**`rdv`** — a single appointment
- `id` (PK), `day_id` (FK → day)
- `start_hour`, `end_hour`, `name` (VarChar)
- `rdv_type` (optional VarChar — see `RDV_TYPE_VALUES` in `domain/calendar/models.ts`), `is_confirmed` (optional Boolean)
- `additional_infos` (optional VarChar), `contact_id` (optional FK → contact, `onUpdate: NoAction`)
- Index on `day_id`

**`contact`** — a person
- `id` (PK), `firstname`, `lastname` (VarChar)
- `email`, `phone_number` (optional VarChar), `notes` (optional text)
- `civility` (optional VarChar — `Dr` / `Mr` / `Mme`, see `CIVILITY_OPTIONS` in `ContactModel.ts`)
- `birth_date` (Timestamp, defaults to now), `birth_location`, `address` (optional VarChar)
- `general_practitioner_id` (optional FK → `general_practitioner`, `onDelete: NoAction`)
- Unique constraint on `(firstname, lastname)`

**Naming**: every Prisma column above is snake_case — that's the actual Postgres column name, unchanged on purpose (no migration). Every TS-level model (`Rdv`, `Contact`, and their create/update DTOs in each domain's `models.ts`) is camelCase (`dayId`, `startHour`, `phoneNumber`, `generalPractitionerId`, …). `adapter/mappers.ts` is the only place that bridges the two — `toRdv`/`toContact` map a Prisma row to the camelCase entity; `toRdvPrismaInput`/`toContactPrismaInput` map a camelCase DTO back to Prisma's input shape for `create`/`update`. Nothing outside `adapter/` (or a `where`/`orderBy` clause querying by an untranslated Prisma field, e.g. `day_id`/`start_hour` in a live adapter's own Prisma call) should ever see a snake_case field name.

**`general_practitioner`** — a doctor a contact can be linked to
- `id` (PK), `lastname` (VarChar), `firstname` (optional VarChar), `address` (optional VarChar)
- Relation: one `general_practitioner` → many `contact`
- Deleting one that's still referenced by a `contact` fails at the DB level (no cascade) — the `generalPractitioner.delete` mutation surfaces this as a generic error toast, same as `contacts.deleteContact`'s behavior for RDV references

After any schema change: `npx prisma db push`

> **Note**: dates are stored as a single `date` field (not separate `day/month/year` integers). Always use `new Date('YYYY-MM-DDT00:00:00.000Z')` when querying by date.

---

## Feature Map

| Feature | Status | Key files |
|---|---|---|
| Daily calendar view | ✅ Done | `src/components/DailyView/` |
| Weekly calendar view | ✅ Done | `src/components/WeeklyView/`, `WeekTimeGrid` supports drag-to-create via `useDragToCreate` |
| Monthly calendar view | ✅ Done | `src/components/MonthlyView/` |
| Create/update/delete appointment (RDV) | ✅ Done | `src/components/Layout/AddRdv/`, `src/domain/calendar/application/controllers/calendarRouter.ts`, `application/mutations/{scheduleRdv,updateRdv,deleteRdv}.ts` (conflict detection via `RdvConflictError`, thrown from `scheduleRdv.ts`) |
| Link an RDV to a contact | ✅ Done | `rdv.contact_id`, `ContactSelectField.tsx` |
| Create/update/delete contact | ✅ Done | `src/components/Contacts/`, `src/domain/contact/application/controllers/contactsRouter.ts` |
| Bulk-import contacts from Excel | ✅ Done | `src/components/Layout/ImportContacts/`, `src/domain/contact/application/mutations/bulkCreateContacts.ts` |
| Contact ↔ appointment history | ✅ Done | `ContactRdvList.tsx`, `src/domain/contact/application/queries/getContactRdv.ts` |
| General practitioners (list/search/create/edit/delete) | ✅ Done | `src/components/Contacts/PractitionerList/`, `src/domain/generalPractitioner/application/controllers/generalPractitionerRouter.ts` |
| Link a contact to a general practitioner | ✅ Done | `contact.general_practitioner_id`, `GeneralPractitionerSelectField.tsx` |
| Auth (Clerk) | ✅ Done | `src/start.ts`, `src/routes/_protected.tsx`, `src/server/auth.ts` |
| Role-based access | ✅ Done | `calendar_access` Clerk role |

---

## Dev Workflow

```bash
npm run dev           # local dev server with hot reload
npm run build         # production build
npm test              # Vitest test suite

wrangler deploy       # deploy to Cloudflare Workers
npx prisma db push    # sync schema changes to NeonDB
npx prisma studio     # browse the database locally
```

- **Env vars**: `DATABASE_URL` (NeonDB), `CLERK_SECRET_KEY`, `VITE_CLERK_PUBLISHABLE_KEY`
- **Cloudflare secrets**: set via `wrangler secret put <VAR_NAME>` — never hardcode in source files
- **Deploy config**: `wrangler.jsonc`
- **DB config**: `prisma.config.ts`
- **Build config**: `vite.config.ts`

---

## Key Conventions

When writing code for this project, follow these patterns:

1. **New route** → add a file under `src/routes/_protected/` (TanStack Router auto-discovers it, and it's gated by `requireCalendarAccess()` for free); use `src/routes/` directly (outside `_protected`) only for public routes like `/sign-in` or `/forbidden`
2. **New API procedure** → validate with Zod in the domain's `application/controllers/<name>Router.ts`, delegate to a query/mutation function via that domain's `run<Name>Effect` composition root; for a new domain, scaffold `port/adapter/application` (see Architecture) and register the controller router in `src/configurations/trpc/router/router.ts`
3. **New query/mutation inside an existing domain** → write it as a plain function returning an un-provided `Effect` (depends only on that domain's `port/` interfaces, never on Prisma or the `*Live` adapter directly) in `application/queries/` or `application/mutations/`; add a colocated `*.test.ts` against a mocked `Layer` from `testSupport.ts`
4. **New UI** → prefer Ant Design components; use Tailwind for layout/spacing
5. **Calling the API in a component** → always go through a service hook in `src/services/`, not directly via tRPC in the component
6. **Input validation** → Zod create/update schemas live in the owning domain's `src/domain/<name>/models.ts`, reused as tRPC input validators directly from there; keep any purely display/option constants (e.g. `CIVILITY_OPTIONS`, `RDV_TYPE_OPTIONS`) in the matching `src/models/*.ts` file instead, importing the domain's value-list/type when needed
7. **Imports** → use `@/` or `#/` path alias instead of deep relative paths
8. **Date operations** → use Day.js; store as a single `date` field (UTC midnight), not separate `day/month/year` integers
9. **Navigation links** → use `<Link>` from `@tanstack/react-router` for anchor-style navigation; use `useNavigate` only for programmatic navigation inside event handlers
10. **Styling** → Tailwind CSS utilities for layout/spacing; avoid raw hex strings — use Ant Design `ConfigProvider` tokens where possible
11. **Component size** → when a component starts owning several unrelated concerns (data-fetch, filtering, virtualization, mode/tab switching, modal state, rendering more than one entity type), split it into an orchestrator + focused sub-components rather than letting one file grow all of them — see `ContactList/` vs. the self-contained `PractitionerList/` for the pattern
12. **Lists** → render through `VirtualizedList` (`src/components/VirtualizedList/VirtualizedList.tsx`) instead of hand-rolling `useVirtualizer`; it also wraps loading/error/empty via `DataState`
13. **Directory size** → keep ~3 files directly inside a feature directory before splitting into sub-modules; a feature-scoped `hooks/` (or `utils/`) subdirectory is exempt from that limit
