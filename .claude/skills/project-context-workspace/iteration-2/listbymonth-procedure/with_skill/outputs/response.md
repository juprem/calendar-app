# listByMonth tRPC Procedure

## Status

The `listByMonth` procedure **already exists** in the codebase. It was found in:

- **Router**: `/mnt/c/Users/oabdelnour/Documents/perso/calendar-app/src/configurations/trpc/router/calendarRouter.ts`
- **Service hook**: `/mnt/c/Users/oabdelnour/Documents/perso/calendar-app/src/services/calendarService.ts`

A **syntax bug** was found and fixed during this task (see below).

---

## Where it lives

### tRPC procedure — `calendarRouter.ts`

File: `src/configurations/trpc/router/calendarRouter.ts`

```ts
listByMonth: publicProcedure
  .input(z.object({ month: z.number(), year: z.number() }))
  .query(({ input }) => {
    const startMonth = dayjs().year(input.year).month(input.month - 1).date(1);
    const startNextMonth = startMonth.add(1, 'month');

    return prisma.day.findMany({
      where: {
        date: {
          gte: new Date(startMonth.format('YYYY-MM-DD')),
          lt: new Date(startNextMonth.format('YYYY-MM-DD')),
        },
      },
      include: { rdv: { orderBy: { start_hour: 'asc' } } },
      orderBy: { date: 'asc' },
    });
  }),
```

**Input**: `{ month: number, year: number }` — month is 1-indexed (1 = January, 12 = December).

**Returns**: An array of `day` records (with nested `rdv[]` sorted by `start_hour` ascending), filtered to all days in the given month/year, ordered by date ascending. Only days that have at least one appointment stored in the database are returned (sparse — days with no RDVs are not included).

**How it works**:
1. Computes the first day of the target month using Day.js.
2. Computes the first day of the following month.
3. Queries `prisma.day.findMany` with a `date >= startMonth AND date < startNextMonth` range filter.
4. Eagerly includes all related `rdv` records, sorted by `start_hour`.

### Service hook — `calendarService.ts`

File: `src/services/calendarService.ts`

```ts
export const useGetMonthlyRdv = (month: number, year: number) => {
  const trpc = useTRPC();
  return useQuery(trpc.calendar.listByMonth.queryOptions({ month, year }));
};
```

This hook wraps the tRPC call with TanStack Query for use in React components. Following project convention, components must always call this hook — never call tRPC directly from a component.

Cache invalidation is also wired in `useAddRdv`: when an RDV is created, the monthly query for the matching month/year is invalidated automatically.

---

## Bug fixed

The original `listByMonth` procedure had a syntax error: the `.query()` callback was incorrectly closed with `},` (a stray trailing comma inside the function body before the closing `}`). This was corrected to:

```ts
    });   // closes prisma.day.findMany({...})
  }),     // closes .query(({ input }) => { ... })
```

---

## How to use in a component

```tsx
import { useGetMonthlyRdv } from '@/services/calendarService';

function MonthlyView() {
  const { data, isLoading } = useGetMonthlyRdv(6, 2026); // June 2026

  if (isLoading) return <Spin />;

  return (
    <div>
      {data?.map((day) => (
        <div key={day.id}>
          <strong>{day.date.toString()}</strong>
          {day.rdv.map((rdv) => (
            <div key={rdv.id}>{rdv.name} — {rdv.start_hour} → {rdv.end_hour}</div>
          ))}
        </div>
      ))}
    </div>
  );
}
```

---

## Key conventions followed

- Input validated with Zod (`z.object({ month: z.number(), year: z.number() })`).
- Date range built with Day.js; dates stored as UTC midnight (`YYYY-MM-DDT00:00:00.000Z`).
- Procedure lives in the `calendar` sub-router (`calendarRouter.ts`), registered in `router.ts`.
- Service hook in `src/services/calendarService.ts` wraps the tRPC call per project convention.
- Components must use `useGetMonthlyRdv` from the service layer, never call tRPC directly.

---

## Skills used

- `project-context` — loaded full project context (tech stack, architecture, tRPC conventions, DB schema, directory map) before touching any file.
