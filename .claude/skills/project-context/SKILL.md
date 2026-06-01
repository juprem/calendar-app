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

Requests flow through these layers in order:

```
Browser
  └─ TanStack Router        src/routes/          (file = route, SSR)
       └─ Components        src/components/       (UI, calls service hooks)
            └─ Services     src/services/         (custom hooks wrapping tRPC)
                 └─ tRPC    src/integrations/trpc/router/  (type-safe procedures)
                      └─ Prisma  src/db.ts        (ORM, Neon adapter)
                           └─ NeonDB              (PostgreSQL)
```

### Directory map

| Path | What lives here |
|---|---|
| `src/routes/` | TanStack Router pages — one file per route |
| `src/components/` | Feature-scoped React components |
| `src/services/` | Domain hooks (`calendarService.ts`, `contactService.ts`) |
| `src/integrations/trpc/` | tRPC init, React hooks, and all routers |
| `src/store/` | Zustand stores (client-only UI state) |
| `src/models/` | TypeScript interfaces and Zod schemas |
| `src/db.ts` | Prisma client singleton with Neon adapter |
| `src/start.ts` | TanStack Start config + Clerk auth middleware |
| `prisma/schema.prisma` | Database schema |

### Component File Map (fast lookup)

| Component | File |
|---|---|
| App shell + header nav | `src/components/Layout/Layout.tsx` |
| Add RDV modal trigger | `src/components/Layout/AddRdv/AddRdv.tsx` |
| Add contact modal trigger | `src/components/Layout/AddContact/AddContact.tsx` |
| Daily calendar view | `src/components/DailyView/` |
| Contacts page root | `src/components/Contacts/Contacts.tsx` |
| Contact list sidebar | `src/components/Contacts/ContactList.tsx` |
| Contact detail panel | `src/components/Contacts/ContactDetail.tsx` |
| Contact avatar | `src/components/Contacts/ContactAvatar.tsx` |
| Day navigator (prev/next) | `src/components/DailyView/DayNavigator.tsx` |

### Route → Component map

| URL | Route file | Component |
|---|---|---|
| `/` | `src/routes/index.tsx` | Redirects to `/journaliere` |
| `/journaliere` | `src/routes/journaliere/index.tsx` | Daily view |
| `/hebdomadaire` | `src/routes/hebdomadaire/index.tsx` | Weekly view |
| `/mensuelle` | `src/routes/mensuelle/index.tsx` | Monthly view |
| `/contacts` | `src/routes/contacts/index.tsx` | `Contacts` |
| `/api/trpc/*` | `src/routes/api.trpc.$.tsx` | tRPC fetch handler |
| `/forbidden` | `src/routes/forbidden/index.tsx` | Access denied |
| `/sign-in` | `src/routes/sign-in/` | Clerk sign-in |

### Authentication

- Provider: Clerk, wired in `src/routes/__root.tsx`
- Middleware: `src/start.ts` — enforces `calendar_access` Clerk role
- Forbidden redirect: `src/routes/forbidden/index.tsx`
- Only users with the `calendar_access` role can access the app

### tRPC conventions

- Instance + context: `src/integrations/trpc/init.ts` (uses SuperJSON transformer, no context)
- React hooks entry point: `src/integrations/trpc/react.ts`
- Root router: `src/integrations/trpc/router/router.ts` (merges sub-routers)
- HTTP endpoint: `src/routes/api.trpc.$.tsx` — `createContext` must be `() => ({})`, never `createTRPCContext` from `@trpc/tanstack-react-query`
- Client setup: `src/integrations/tanstack-query/root-provider.tsx` — uses `httpBatchStreamLink` + SuperJSON

#### Current tRPC procedures

| Router | Procedure | Input | Description |
|---|---|---|---|
| `calendar` | `listByDay` | `string` (ISO date) | Fetch day + its RDVs |
| `calendar` | `listByWeek` | `{ startDay, startMonth, startYear }` | Fetch 7 days of RDVs |
| `calendar` | `listByMonth` | `{ month, year }` | Fetch all days in month |
| `calendar` | `addRdv` | `RdvCreateSchema` | Create a new RDV |
| `contacts` | `listAll` | — | Fetch all contacts |
| `contacts` | `addContact` | `CreateContactSchema` | Create a new contact |

- **Convention**: add new procedures to the matching sub-router; create a new sub-router for new domains, then register it in `router.ts`

### State split

- **Server state** (DB data): TanStack Query via tRPC hooks — never store in Zustand
- **Client UI state** (non-persisted): Zustand at `src/store/calendarStore.ts`
  - `calendarMode`: `DAILY | WEEKLY | MONTHLY`
  - `selectedDay`: the currently viewed date

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
- `rdv_type` (optional VarChar), `is_confirmed` (optional Boolean)
- Index on `day_id`

**`contact`** — a person
- `id` (PK), `firstname`, `lastname` (VarChar)
- `email`, `phone_number` (optional VarChar), `notes` (optional text)
- Unique constraint on `(firstname, lastname)`

After any schema change: `npx prisma db push`

> **Note**: dates are stored as a single `date` field (not separate `day/month/year` integers). Always use `new Date('YYYY-MM-DDT00:00:00.000Z')` when querying by date.

---

## Feature Map

| Feature | Status | Key files |
|---|---|---|
| Daily calendar view | ✅ Done | `src/components/DailyView/` |
| Weekly calendar view | 🔲 UI planned | Router procedure `listByWeek` exists in `calendarRouter.ts` |
| Monthly calendar view | 🔲 UI planned | Router procedure `listByMonth` exists in `calendarRouter.ts` |
| Create appointment (RDV) | ✅ Done | `src/components/Layout/AddRdv/`, `calendarRouter.ts` |
| List appointments by day | ✅ Done | `calendarRouter.ts`, `calendarService.ts` |
| Create contact | ✅ Done | `src/components/Layout/AddContact/`, `contactsRouter.ts` |
| List all contacts | ✅ Done | `src/components/Contacts/`, `contactsRouter.ts` |
| Auth (Clerk) | ✅ Done | `src/start.ts`, `__root.tsx` |
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

1. **New route** → add a file under `src/routes/` (TanStack Router auto-discovers it)
2. **New API procedure** → add to the relevant sub-router in `src/integrations/trpc/router/`; create a new sub-router for new domains
3. **New UI** → prefer Ant Design components; use Tailwind for layout/spacing
4. **Calling the API in a component** → always go through a service hook in `src/services/`, not directly via tRPC in the component
5. **Input validation** → Zod schemas in `src/models/`, reused as tRPC input validators
6. **Imports** → use `@/` or `#/` path alias instead of deep relative paths
7. **Date operations** → use Day.js; store as a single `date` field (UTC midnight), not separate `day/month/year` integers
8. **Navigation links** → use `<Link>` from `@tanstack/react-router` for anchor-style navigation; use `useNavigate` only for programmatic navigation inside event handlers
9. **Styling** → Tailwind CSS utilities for layout/spacing; avoid raw hex strings — use Ant Design `ConfigProvider` tokens where possible
