# Implementing the `listByMonth` tRPC Procedure

## Overview

This procedure accepts a `month` (1–12) and `year` (e.g. 2025) as input and returns all appointments that fall within that calendar month.

---

## Implementation

### 1. Input Validation (Zod Schema)

```ts
import { z } from "zod";

const listByMonthInput = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
});
```

---

### 2. tRPC Procedure (using Prisma)

```ts
// src/server/routers/appointment.ts

import { router, publicProcedure } from "../trpc"; // adjust path to your tRPC setup
import { z } from "zod";

export const appointmentRouter = router({
  listByMonth: publicProcedure
    .input(
      z.object({
        month: z.number().int().min(1).max(12),
        year: z.number().int().min(2000).max(2100),
      })
    )
    .query(async ({ ctx, input }) => {
      const { month, year } = input;

      // Compute the inclusive start and exclusive end of the target month
      const startDate = new Date(year, month - 1, 1);           // e.g. 2025-03-01T00:00:00
      const endDate = new Date(year, month, 1);                  // e.g. 2025-04-01T00:00:00

      const appointments = await ctx.prisma.appointment.findMany({
        where: {
          startTime: {
            gte: startDate,
            lt: endDate,
          },
        },
        orderBy: {
          startTime: "asc",
        },
      });

      return appointments;
    }),
});
```

> **Note:** `ctx.prisma` assumes a Prisma client is attached to the tRPC context. Adjust the field name (`appointment`, `startTime`) to match your actual Prisma schema model and field names.

---

### 3. Prisma Schema (assumed model)

```prisma
model Appointment {
  id        String   @id @default(cuid())
  title     String
  startTime DateTime
  endTime   DateTime
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

### 4. Registering the Router

In your root tRPC router file:

```ts
// src/server/routers/_app.ts

import { router } from "../trpc";
import { appointmentRouter } from "./appointment";

export const appRouter = router({
  appointment: appointmentRouter,
});

export type AppRouter = typeof appRouter;
```

---

### 5. Client-side Usage (React + TanStack Query)

```tsx
import { trpc } from "~/utils/trpc"; // adjust path

function CalendarMonthView({ year, month }: { year: number; month: number }) {
  const { data: appointments, isLoading } = trpc.appointment.listByMonth.useQuery({
    year,
    month,
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <ul>
      {appointments?.map((appt) => (
        <li key={appt.id}>
          {appt.title} — {new Date(appt.startTime).toLocaleDateString()}
        </li>
      ))}
    </ul>
  );
}
```

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| Use `gte` / `lt` on `startTime` | Covers the full calendar month without timezone edge cases from `lte` on the last millisecond |
| `new Date(year, month - 1, 1)` | JavaScript `Date` months are 0-indexed; subtracting 1 aligns with user-facing 1–12 input |
| `orderBy: { startTime: "asc" }` | Returns appointments in chronological order, which is the natural expectation for a calendar view |
| Zod range validation | Prevents obviously invalid inputs (month 0, month 13, unreasonable years) before hitting the database |

---

## Timezone Considerations

If your application serves users in multiple timezones, you should:

1. Store all `DateTime` values in UTC in Postgres (Prisma does this by default).
2. Accept an optional `timezone` string in the input (e.g. `"America/New_York"`).
3. Use a library like `date-fns-tz` or `luxon` to compute `startDate` and `endDate` in the user's local timezone before converting back to UTC for the Prisma query.

```ts
import { zonedTimeToUtc, startOfMonth, endOfMonth } from "date-fns-tz"; // example with date-fns-tz

const localStart = new Date(year, month - 1, 1); // midnight local
const utcStart = zonedTimeToUtc(localStart, timezone);
const utcEnd = zonedTimeToUtc(new Date(year, month, 1), timezone);
```
