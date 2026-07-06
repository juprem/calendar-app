# Weekly Calendar View — Implementation Plan

## Current State

The weekly calendar view is **already largely implemented**. Here is what already exists:

### Existing files (no creation needed)

| File | Status | Role |
|---|---|---|
| `src/routes/hebdomadaire/index.tsx` | Done | Route at `/hebdomadaire`, protected by `requireCalendarAccess()`, renders `WeeklyViewWrapper` |
| `src/components/WeeklyView/WeeklyViewWrapper.tsx` | Done | Connects Zustand store + `useGetWeeklyRdv` service hook, computes Monday, passes data down |
| `src/components/WeeklyView/WeeklyView.tsx` | Done | Root layout: `WeekSelector` + sticky day-header row + `WeekTimeGrid` |
| `src/components/WeeklyView/WeekSelector.tsx` | Done | Previous/next week navigation using Zustand `setDay`, displays week label |
| `src/components/WeeklyView/WeekDayHeader.tsx` | Done | Column header: day abbreviation + date number, highlighted for today |
| `src/components/WeeklyView/WeekTimeGrid.tsx` | Done | Scrollable grid, left time-gutter + 7 `WeekDayColumn` cells, auto-scrolls to 08:00 on mount |
| `src/components/WeeklyView/WeekDayColumn.tsx` | Done | Single day column: hour grid lines + absolutely-positioned `WeekRdvBlock` items |
| `src/components/WeeklyView/WeekRdvBlock.tsx` | Done | Individual appointment block: top/height from start/end hours, truncated name + time |
| `src/components/WeeklyView/weeklyViewConstants.ts` | Done | `HOUR_HEIGHT=64`, `START_HOUR=0`, `END_HOUR=24`, `HOURS` array, French `DAY_NAMES` |
| `src/configurations/trpc/router/calendarRouter.ts` | Done | `listByWeek` procedure: fetches 7 days starting from Monday via `prisma.day.findFirst` (parallel) |
| `src/services/calendarService.ts` | Done | `useGetWeeklyRdv(startDay, startMonth, startYear)` hook wrapping tRPC query |
| `src/store/calendarStore.ts` | Done | Zustand store: `day` (Dayjs) + `setDay` — shared across daily/weekly/monthly views |
| `src/components/Layout/Layout.tsx` | Done | Navigation already includes "Hebdomadaire" link to `/hebdomadaire` |

---

## What Still Needs Work

The scaffolding is complete, but several improvements remain before the feature is fully production-ready:

### 1. Missing invalidation of `listByWeek` in `useAddRdv` (`src/services/calendarService.ts`)

When a new RDV is created via `useAddRdv`, `onSuccess` currently invalidates only `listByDay` and `listByMonth`. If the user is on the weekly view when they add an appointment, the grid will **not refresh**.

**File to modify:** `src/services/calendarService.ts`

```ts
onSuccess: (_, variables) => {
  const [year, month, day] = variables.date.split('-').map(Number);
  const date = dayjs().year(year).month(month - 1).date(day);
  const dow = date.day();
  const monday = date.subtract(dow === 0 ? 6 : dow - 1, 'day');

  queryClient.invalidateQueries({
    queryKey: trpc.calendar.listByDay.queryKey(variables.date),
  });
  queryClient.invalidateQueries({
    queryKey: trpc.calendar.listByMonth.queryKey({ month, year }),
  });
  // Add this:
  queryClient.invalidateQueries({
    queryKey: trpc.calendar.listByWeek.queryKey({
      startDay: monday.date(),
      startMonth: monday.month() + 1,
      startYear: monday.year(),
    }),
  });
},
```

### 2. `listByWeek` date query uses wrong constructor (`src/configurations/trpc/router/calendarRouter.ts`)

The `listByWeek` procedure calls `new Date(d.format('YYYY-MM-DD'))` — this parses as **local midnight**, not UTC midnight, which can return wrong results near midnight in non-UTC timezones (including Cloudflare Workers). The `listByDay` procedure correctly uses `new Date(\`${isoDate}T00:00:00.000Z\`)`.

**File to modify:** `src/configurations/trpc/router/calendarRouter.ts`

```ts
// Before
return prisma.day.findFirst({
  where: { date: new Date(d.format('YYYY-MM-DD')) },
  include: { rdv: true },
});

// After
return prisma.day.findFirst({
  where: { date: new Date(`${d.format('YYYY-MM-DD')}T00:00:00.000Z`) },
  include: { rdv: true },
});
```

### 3. No loading skeleton for the weekly grid

`WeeklyViewWrapper` passes `isLoading` to `WeeklyView`, which passes it to `WeekSelector` (where an `antd` `<Spin>` appears inline). However, the time grid itself renders with empty columns rather than a visual skeleton, which can look jarring.

**Options (pick one):**
- Add an `isLoading` guard in `WeekTimeGrid` to render placeholder blocks (`<Skeleton.Button>` from Ant Design) in each column.
- Alternatively, add a full-grid overlay with reduced opacity while loading.

**File to modify:** `src/components/WeeklyView/WeekTimeGrid.tsx` or `WeeklyView.tsx`

### 4. No Zod model file for weekly input

`listByDay` re-uses `z.string()` inline. `listByWeek` uses an inline `z.object(...)`. For consistency with the project pattern (Zod schemas in `src/models/` reused as tRPC validators), a `CalendarModel.ts` could centralize `ListByWeekSchema` and `ListByMonthSchema`.

**File to create (optional):** `src/models/CalendarModel.ts`

```ts
import z from 'zod';

export const ListByWeekSchema = z.object({
  startDay: z.number(),
  startMonth: z.number(),
  startYear: z.number(),
});

export const ListByMonthSchema = z.object({
  month: z.number(),
  year: z.number(),
});
```

---

## Libraries and Patterns in Use

| Concern | Tool | Notes |
|---|---|---|
| Routing | TanStack Router (file-based) | Route file at `src/routes/hebdomadaire/index.tsx` already exists |
| Server state | TanStack Query via tRPC | `useGetWeeklyRdv` in `calendarService.ts` |
| Client UI state | Zustand (`calendarStore`) | `day` is shared; week derived from it with `.day()` / `.subtract()` |
| Date math | Day.js | Monday computation: `day.subtract(dow === 0 ? 6 : dow - 1, 'day')` |
| UI components | Ant Design 6.x | `Spin` for loading indicator |
| Layout / spacing | Tailwind CSS 4.x | All grid, flex, border, color utilities |
| Icons | Lucide React | `ChevronLeft`, `ChevronRight` in `WeekSelector` |
| Absolute positioning | CSS (inline `style`) | RDV blocks positioned by `top` and `height` computed from start/end hours |
| Auth guard | `requireCalendarAccess()` from `src/server/auth.ts` | Called in `beforeLoad` |

---

## Summary

The weekly view is **functionally complete** — all files exist and the route is live at `/hebdomadaire`. The three concrete changes required to make it fully correct and production-ready are:

1. **Add `listByWeek` cache invalidation** inside `useAddRdv` (`src/services/calendarService.ts`) — highest priority.
2. **Fix the UTC date constructor** in `listByWeek` (`src/configurations/trpc/router/calendarRouter.ts`).
3. **Optionally** add a loading skeleton to `WeekTimeGrid` and centralize Zod schemas in `src/models/CalendarModel.ts`.

No new routes, no new tRPC routers, no schema changes, and no new dependencies are required.
