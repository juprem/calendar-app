# Weekly Calendar View — Implementation Plan

## Overview

The weekly calendar view (`WEEKLY` mode) is already declared as a `CalendarMode` type and wired into the Zustand store and nav buttons, but has no rendering logic yet. The task is entirely additive — no existing files need destructive changes.

---

## Files to Create

### 1. `src/components/WeeklyView/WeeklyView.tsx`

The pure presentational component. Receives an array of day+rdv pairs and renders a 7-column grid (one column per day of the week).

- Use Ant Design `Col`/`Row` or plain Tailwind CSS grid (`grid grid-cols-7`) for the column layout.
- Reuse `src/components/DailyView/RdvCard/RdvCard.tsx` for individual appointment cards — it already accepts `start_hour`, `end_hour`, `name`, and `type`.
- For the column headers, display the day name + date using Day.js (`.format('ddd DD')`).

### 2. `src/components/WeeklyView/WeeklyViewWrapper.tsx`

The data-fetching wrapper. Mirrors the pattern of `src/components/DailyView/DailyViewWrapper.tsx`.

- Read `day` from `useCalendarStore` to know the anchor date.
- Derive the 7 days of the week with Day.js: `day.startOf('week')` through `day.endOf('week')` (or `isoWeek` if Monday-first is preferred — add `import 'dayjs/plugin/isoWeek'`).
- Call `useGetDailyRdv` (from `src/services/calendarService.ts`) **once per day** — 7 parallel queries. TanStack Query deduplicates and batches these efficiently.
- Sort each day's rdvs by `start_hour` using the existing `getHourAndMinute` utility at `src/components/DailyView/utils/getHoursAndMinute.ts`.
- Pass the assembled data down to `WeeklyView`.

### 3. `src/components/WeeklyView/WeekWeekPicker.tsx` _(optional but recommended)_

A week navigation control — "previous week / current week / next week" — similar to `src/components/DailyView/Today.tsx`. Use the Ant Design `DatePicker.WeekPicker` variant (available in Ant Design 6.x) with `picker="week"` and call `setDay` from the store.

### 4. `src/configurations/trpc/router/calendarRouter.ts` — **add `listByWeek` procedure** _(optional optimization)_

The simplest approach is 7 individual `listByDay` queries (one per day). If you later want a single round-trip, add a `listByWeek` procedure:

```ts
listByWeek: publicProcedure
  .input(z.object({ startDay: z.number(), startMonth: z.number(), startYear: z.number() }))
  .query(({ input }) => { /* Prisma query for 7 days */ })
```

For an MVP, skip this and reuse `listByDay` × 7.

---

## Files to Modify

### 1. `src/routes/index.tsx`

**Current state:** The `Home` component only renders `DailyViewWrapper` when `mode === 'DAILY'`.

**Change:** Add the `WEEKLY` branch:

```tsx
import { WeeklyViewWrapper } from '#/components/WeeklyView/WeeklyViewWrapper.tsx';

function Home() {
  const calendarMode = useCalendarStore((state) => state.mode);

  return (
    <div className="p-8">
      {calendarMode === 'DAILY' && <DailyViewWrapper />}
      {calendarMode === 'WEEKLY' && <WeeklyViewWrapper />}
    </div>
  );
}
```

### 2. `src/services/calendarService.ts` _(possibly, if adding `listByWeek`)_

If you add the `listByWeek` tRPC procedure, add a corresponding `useGetWeeklyRdv` hook here following the same pattern as `useGetDailyRdv`. If you stay with 7× `listByDay`, no change is needed.

---

## Libraries and Patterns to Use

| Concern | What to use | Where it's already used |
|---|---|---|
| Date arithmetic (week start/end, formatting) | **Day.js** — `day.startOf('isoWeek')`, `.add(n, 'day')`, `.format('ddd DD MMM')` | `src/store/calendarStore.ts`, `DailyViewWrapper.tsx` |
| Client UI state (selected day, mode) | **Zustand** — `useCalendarStore` | `src/store/calendarStore.ts` |
| Server state / data fetching | **TanStack Query via tRPC** — `useGetDailyRdv` × 7 | `src/services/calendarService.ts` |
| Layout grid | **Tailwind CSS** — `grid grid-cols-7 gap-2` | All components |
| UI components (headers, pickers, badges) | **Ant Design** — `DatePicker` with `picker="week"`, `Badge`, `Tooltip` | `Today.tsx`, `AddRdv` |
| Individual appointment cards | Reuse **`RdvCard`** | `DailyView.tsx` |
| Path imports | `#/` or `@/` alias — never deep relative paths | All existing files |
| Time sorting | `getHourAndMinute` from `src/components/DailyView/utils/getHoursAndMinute.ts` | `DailyViewWrapper.tsx` |

---

## Step-by-Step Implementation Order

1. **Create `src/components/WeeklyView/WeeklyView.tsx`** — pure UI, no data, easy to iterate.
2. **Create `src/components/WeeklyView/WeeklyViewWrapper.tsx`** — wire up 7× `useGetDailyRdv`.
3. **Modify `src/routes/index.tsx`** — add the `WEEKLY` branch to `Home`.
4. _(Optional)_ **Add `WeekPicker`** component for week navigation.
5. _(Optional)_ **Add `listByWeek` tRPC procedure** to `calendarRouter.ts` + `calendarService.ts` for a single-round-trip optimization.

---

## Key Constraints to Respect

- **No server state in Zustand.** The selected day/week anchor lives in the store; the rdv data must come from TanStack Query.
- **Day.js ISO week plugin.** If you want weeks to start on Monday (standard in French calendars), import and extend Day.js: `import isoWeek from 'dayjs/plugin/isoWeek'; dayjs.extend(isoWeek);` — then use `startOf('isoWeek')`.
- **`month()` offset.** Day.js months are 0-indexed, but the DB schema stores them 1-indexed (see `DailyViewWrapper.tsx`: `today.month() + 1`). Apply the same `+1` offset when building the 7 day objects.
- **Database schema.** No schema change is needed — `rdv` records are already queried per `(day, month, year)` via the existing `listByDay` procedure.
