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

### Authentication

- Provider: Clerk, wired in `src/routes/__root.tsx`
- Middleware: `src/start.ts` — enforces `calendar_access` Clerk role
- Forbidden redirect: `src/routes/forbidden/index.tsx`
- Only users with the `calendar_access` role can access the app

### tRPC conventions

- Instance + context: `src/integrations/trpc/init.ts`
- React hooks entry point: `src/integrations/trpc/react.ts`
- Root router: `src/integrations/trpc/router/router.ts` (merges sub-routers)
- Sub-routers: `calendarRouter.ts` (listByDay, addRdv), `contactsRouter.ts` (listAll, addContact)
- HTTP endpoint: `src/routes/api.trpc.$.tsx`
- **Convention**: add new procedures to the matching sub-router; create a new sub-router for new domains, then register it in `router.ts`

### State split

- **Server state** (DB data): TanStack Query via tRPC hooks — never store in Zustand
- **Client UI state** (non-persisted): Zustand at `src/store/calendarStore.ts`
  - `calendarMode`: `DAILY | WEEKLY | MONTHLY`
  - `selectedDay`: the currently viewed date

---

## Database Schema

Three Prisma models in `prisma/schema.prisma` (PostgreSQL via Neon):

**`day`** — a calendar date
- `id` (PK, auto-increment), `day`, `month`, `year` (SmallInt)
- Unique constraint on `(day, month, year)`, index on `(month, year)`
- Relation: one `day` → many `rdv`

**`rdv`** — a single appointment
- `id` (PK), `day_id` (FK → day), `start_hour`, `end_hour`, `name` (VarChar)
- `rdv_type` (optional), `status` (optional)
- Index on `day_id`

**`contact`** — a person
- `id` (PK), `firstname`, `lastname` (VarChar)
- `email`, `phone_number` (optional), `notes` (optional text)

After any schema change: `npx prisma db push`

---

## Feature Map

| Feature | Status | Key files |
|---|---|---|
| Daily calendar view | ✅ Done | `src/components/DailyView/` |
| Weekly calendar view | 🔲 Planned | — |
| Monthly calendar view | 🔲 Planned | — |
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
7. **Date operations** → use Day.js; store as separate `day/month/year` fields, not timestamps
