# Adding the `listByMonth` tRPC Procedure

## Overview

The procedure belongs in `src/configurations/trpc/router/calendarRouter.ts` alongside the existing `listByDay` and `addRdv` procedures — both already live in that file. No new sub-router is needed (same domain). No changes to `router.ts` are required.

---

## Step 1 — Understand the database schema

From `prisma/schema.prisma`:

```prisma
model day {
  id    Int   @id @default(autoincrement())
  day   Int   @db.SmallInt
  month Int   @db.SmallInt
  year  Int   @db.SmallInt
  rdv   rdv[]

  @@index([month, year], map: "index_month")   // <-- already indexed for this exact query
}
```

The `day` table stores a row per calendar date with `day`, `month`, `year` as separate `SmallInt` columns. There is already a composite index on `(month, year)` — `index_month` — which is exactly what `listByMonth` needs. No schema changes are required.

Each `day` row has a `rdv[]` relation (one-to-many). To return all appointments for a month, query all `day` rows matching the given `month`+`year` and `include: { rdv: true }`.

---

## Step 2 — Add the Zod input schema

Following the project convention (convention #5: "Input validation → Zod schemas in `src/models/`, reused as tRPC input validators"), a dedicated schema should live in `src/models/CalendarModel.ts`. However, both existing calendar procedures define their schemas inline inside `calendarRouter.ts` (see `RdvCreateSchema` declared at the top of that file). To stay consistent with the local pattern in `calendarRouter.ts`, the schema is defined in the same file.

The input only needs `month` and `year`:

```ts
const ListByMonthSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int(),
});
```

`z.number().int().min(1).max(12)` catches invalid month values at the API boundary before they ever hit the database.

---

## Step 3 — Write the Prisma query

```ts
prisma.day.findMany({
  where: { month: input.month, year: input.year },
  include: { rdv: true },
  orderBy: { day: 'asc' },
})
```

- `findMany` instead of `findFirst` — we want every day in the month that has data.
- `where: { month, year }` — hits the `index_month` composite index directly.
- `include: { rdv: true }` — eager-loads all appointments for each day, matching the shape returned by `listByDay`.
- `orderBy: { day: 'asc' }` — returns days in chronological order, which is what any calendar UI will expect.

The return type is inferred by Prisma as `(day & { rdv: rdv[] })[]`.

---

## Step 4 — The complete updated file

Edit `src/configurations/trpc/router/calendarRouter.ts`:

```ts
import z from 'zod';
import { publicProcedure } from '../init';
import { prisma } from '#/db.ts';

export const RdvCreateSchema = z.object({
  day: z.number(),
  day_month: z.number(),
  name: z.string(),
  day_year: z.number(),
  start_hour: z.string(),
  end_hour: z.string(),
});

const ListByMonthSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int(),
});

export const calendarRouter = {
  listByDay: publicProcedure
    .input(z.object({ day: z.number(), month: z.number(), year: z.number() }))
    .query(({ input }) =>
      prisma.day.findFirst({
        where: { day: input.day, month: input.month, year: input.year },
        include: { rdv: true },
      }),
    ),

  listByMonth: publicProcedure
    .input(ListByMonthSchema)
    .query(({ input }) =>
      prisma.day.findMany({
        where: { month: input.month, year: input.year },
        include: { rdv: true },
        orderBy: { day: 'asc' },
      }),
    ),

  addRdv: publicProcedure.input(RdvCreateSchema).mutation(async ({ input }) => {
    let day = await prisma.day.findFirst({
      where: {
        month: input.day_month,
        day: input.day,
        year: input.day_year,
      },
    });

    if (!day) {
      day = await prisma.day.create({
        data: {
          day: input.day,
          month: input.day_month,
          year: input.day_year,
        },
      });
    }

    return prisma.rdv.create({
      data: {
        start_hour: input.start_hour,
        end_hour: input.end_hour,
        name: input.name,
        day_id: day.id,
      },
    });
  }),
};
```

No changes to `src/configurations/trpc/router/router.ts` — the `calendarRouter` object is already registered under the `calendar` namespace:

```ts
// router.ts — unchanged
export const trpcRouter = createTRPCRouter({
  calendar: calendarRouter,   // listByMonth is now part of this
  contacts: contactsRouter,
});
```

---

## Step 5 — Call it from a service hook

Following convention #4 ("calling the API in a component → always go through a service hook in `src/services/`"), expose the procedure via `src/services/calendarService.ts`:

```ts
import { trpc } from '@/configurations/trpc/react';

export function useListByMonth(month: number, year: number) {
  return trpc.calendar.listByMonth.useQuery(
    { month, year },
    { enabled: month >= 1 && month <= 12 },
  );
}
```

Then in a component (e.g. the future monthly view):

```tsx
import { useListByMonth } from '@/services/calendarService';

function MonthlyView({ month, year }: { month: number; year: number }) {
  const { data: days, isLoading } = useListByMonth(month, year);
  // data shape: Array<{ id, day, month, year, rdv: Rdv[] }>
}
```

---

## Summary of changes

| File | Change |
|---|---|
| `src/configurations/trpc/router/calendarRouter.ts` | Add `ListByMonthSchema` + `listByMonth` procedure |
| `src/configurations/trpc/router/router.ts` | No change — already registers `calendarRouter` |
| `prisma/schema.prisma` | No change — `index_month` already exists |
| `src/services/calendarService.ts` | Add `useListByMonth` hook (follow-on step) |

The procedure is fully type-safe end-to-end: Zod validates the input, Prisma infers the return type, and TanStack Query / tRPC propagates the type to the consuming component automatically.
