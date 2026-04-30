# End-to-End Guide: Adding a `priority` Field to the `rdv` Model

## Overview

This guide walks through every layer of a typical Prisma + tRPC + React/TypeScript stack to add a `priority` field (values: `low`, `medium`, `high`) to the `rdv` (appointment) model.

---

## Step 1 — Prisma Schema (`prisma/schema.prisma`)

### 1a. Define the Enum

Add an enum for the three priority values:

```prisma
enum Priority {
  low
  medium
  high
}
```

### 1b. Add the Field to the Model

```prisma
model rdv {
  id          String    @id @default(cuid())
  // ... existing fields ...
  priority    Priority  @default(medium)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

> Use `@default(medium)` so existing rows (and new rows where priority is omitted) get a sensible value.

---

## Step 2 — Generate & Run the Migration

```bash
# Generate a named migration and apply it to the database
npx prisma migrate dev --name add_priority_to_rdv
```

This will:
1. Create `prisma/migrations/<timestamp>_add_priority_to_rdv/migration.sql`
2. Apply the SQL (adds the enum type + column with DEFAULT 'medium')
3. Regenerate the Prisma Client

The generated SQL will look roughly like:

```sql
CREATE TYPE "Priority" AS ENUM ('low', 'medium', 'high');

ALTER TABLE "rdv"
  ADD COLUMN "priority" "Priority" NOT NULL DEFAULT 'medium';
```

After migration, regenerate the client if it wasn't done automatically:

```bash
npx prisma generate
```

---

## Step 3 — Zod Validation Schemas (shared types / tRPC input layer)

If the project uses Zod for input validation (standard with tRPC), define a shared schema.

Create or update a shared types file, e.g. `src/lib/schemas/rdv.ts`:

```typescript
import { z } from "zod";

export const PriorityEnum = z.enum(["low", "medium", "high"]);
export type Priority = z.infer<typeof PriorityEnum>;

export const createRdvSchema = z.object({
  // ... existing fields ...
  title: z.string().min(1),
  startAt: z.date(),
  endAt: z.date(),
  priority: PriorityEnum.default("medium"),
});

export const updateRdvSchema = createRdvSchema.partial().extend({
  id: z.string(),
});
```

---

## Step 4 — tRPC Router (`src/server/routers/rdv.ts`)

Update the tRPC procedures to accept and return the `priority` field.

```typescript
import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { createRdvSchema, updateRdvSchema } from "../../lib/schemas/rdv";

export const rdvRouter = router({
  // LIST — no change needed; Prisma will return priority automatically
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.rdv.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { startAt: "asc" },
    });
  }),

  // CREATE — pass priority through
  create: protectedProcedure
    .input(createRdvSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.rdv.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      });
    }),

  // UPDATE — pass priority through (it's already in updateRdvSchema)
  update: protectedProcedure
    .input(updateRdvSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.rdv.update({
        where: { id },
        data,
      });
    }),

  // OPTIONAL: filter by priority
  listByPriority: protectedProcedure
    .input(z.object({ priority: z.enum(["low", "medium", "high"]) }))
    .query(async ({ ctx, input }) => {
      return ctx.db.rdv.findMany({
        where: {
          userId: ctx.session.user.id,
          priority: input.priority,
        },
        orderBy: { startAt: "asc" },
      });
    }),
});
```

---

## Step 5 — TypeScript Types (inferred automatically)

Because Prisma generates types from the schema, the `Rdv` type from `@prisma/client` will automatically include:

```typescript
import { Rdv, Priority } from "@prisma/client";
// Priority is now: "low" | "medium" | "high"
// Rdv["priority"] is Priority
```

No manual TypeScript interface changes are needed — but if the project maintains separate DTO types, update them:

```typescript
// src/types/rdv.ts
export type RdvDTO = {
  id: string;
  title: string;
  startAt: Date;
  endAt: Date;
  priority: "low" | "medium" | "high"; // <-- add this
  // ...
};
```

---

## Step 6 — React Form Component (Create/Edit RDV)

Update the form to include a priority selector.

```tsx
// src/components/RdvForm.tsx
import { useState } from "react";
import { trpc } from "../lib/trpc";

type Priority = "low" | "medium" | "high";

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "low",    label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high",   label: "High" },
];

type RdvFormProps = {
  initialValues?: {
    id?: string;
    title: string;
    startAt: Date;
    endAt: Date;
    priority: Priority;
  };
  onSuccess?: () => void;
};

export function RdvForm({ initialValues, onSuccess }: RdvFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [priority, setPriority] = useState<Priority>(
    initialValues?.priority ?? "medium"
  );
  // ... other state for startAt, endAt ...

  const utils = trpc.useUtils();

  const createRdv = trpc.rdv.create.useMutation({
    onSuccess: () => {
      utils.rdv.list.invalidate();
      onSuccess?.();
    },
  });

  const updateRdv = trpc.rdv.update.useMutation({
    onSuccess: () => {
      utils.rdv.list.invalidate();
      onSuccess?.();
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { title, priority /*, startAt, endAt */ };

    if (initialValues?.id) {
      updateRdv.mutate({ id: initialValues.id, ...payload });
    } else {
      createRdv.mutate(payload);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* ... existing fields ... */}

      <label htmlFor="priority">Priority</label>
      <select
        id="priority"
        value={priority}
        onChange={(e) => setPriority(e.target.value as Priority)}
      >
        {PRIORITY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <button type="submit">
        {initialValues?.id ? "Update" : "Create"} Appointment
      </button>
    </form>
  );
}
```

---

## Step 7 — Display Priority in the RDV List / Calendar View

Update the component that renders appointment cards to show the priority badge.

```tsx
// src/components/RdvCard.tsx
import type { Rdv } from "@prisma/client";

const PRIORITY_STYLES: Record<Rdv["priority"], string> = {
  low:    "badge-blue",
  medium: "badge-yellow",
  high:   "badge-red",
};

const PRIORITY_LABELS: Record<Rdv["priority"], string> = {
  low:    "Low",
  medium: "Medium",
  high:   "High",
};

type RdvCardProps = { rdv: Rdv };

export function RdvCard({ rdv }: RdvCardProps) {
  return (
    <div className="rdv-card">
      <h3>{rdv.title}</h3>
      {/* ... other fields ... */}
      <span className={`badge ${PRIORITY_STYLES[rdv.priority]}`}>
        {PRIORITY_LABELS[rdv.priority]}
      </span>
    </div>
  );
}
```

---

## Step 8 — Optional: Sort / Filter by Priority in the UI

If the UI should allow filtering by priority, add a filter component and pass the value to the tRPC query:

```tsx
// src/components/RdvList.tsx
import { useState } from "react";
import { trpc } from "../lib/trpc";
import { RdvCard } from "./RdvCard";

type FilterPriority = "all" | "low" | "medium" | "high";

export function RdvList() {
  const [filter, setFilter] = useState<FilterPriority>("all");

  const { data: rdvs } = trpc.rdv.list.useQuery();

  const filtered = rdvs?.filter(
    (rdv) => filter === "all" || rdv.priority === filter
  );

  return (
    <div>
      <label>Filter by priority: </label>
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value as FilterPriority)}
      >
        <option value="all">All</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      {filtered?.map((rdv) => <RdvCard key={rdv.id} rdv={rdv} />)}
    </div>
  );
}
```

---

## Step 9 — Seed File (if applicable)

If the project has a `prisma/seed.ts`, update seed data to include `priority`:

```typescript
await prisma.rdv.createMany({
  data: [
    { title: "Doctor visit", startAt: new Date(), endAt: new Date(), priority: "high" },
    { title: "Dentist",      startAt: new Date(), endAt: new Date(), priority: "medium" },
    { title: "Haircut",      startAt: new Date(), endAt: new Date(), priority: "low" },
  ],
});
```

---

## Summary Checklist

| # | Layer | What to change |
|---|-------|---------------|
| 1 | `prisma/schema.prisma` | Add `Priority` enum + `priority` field with `@default(medium)` |
| 2 | Database | Run `npx prisma migrate dev --name add_priority_to_rdv` |
| 3 | Zod schemas | Add `PriorityEnum` to `createRdvSchema` and `updateRdvSchema` |
| 4 | tRPC router | Include `priority` in `create` and `update` mutation inputs |
| 5 | TypeScript types | Auto-updated by Prisma; update manual DTO types if any |
| 6 | React form | Add `<select>` for priority in create/edit form |
| 7 | Display components | Render priority badge in appointment card / calendar event |
| 8 | List/filter UI | Optionally add priority filter dropdown |
| 9 | Seed data | Update seed records with `priority` values |

---

## Key Considerations

- **Default value**: Using `@default(medium)` means the migration is non-breaking — existing rows get `medium` automatically, and `priority` can be omitted from API calls.
- **Enum vs String**: Prisma enums map to database-native enums (PostgreSQL `CREATE TYPE`) which enforce valid values at the DB level. This is safer than a plain `String`.
- **Type safety end-to-end**: Prisma generates `Priority` and uses it in the `Rdv` type. Zod's `z.enum(["low","medium","high"])` mirrors this at the API boundary. React receives the inferred TypeScript type from tRPC, so the entire stack is fully type-safe with no manual casting needed beyond the `<select>` onChange handler.
- **Optimistic updates**: If the project uses tRPC's optimistic update patterns, update the `onMutate` callback to include the new `priority` field in the optimistic record.
