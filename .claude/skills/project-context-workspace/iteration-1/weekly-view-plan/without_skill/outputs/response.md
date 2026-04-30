# Weekly Calendar View — Implementation Plan (General React/TypeScript)

> Generated without reading any project files. Based on general knowledge of modern React/TypeScript full-stack apps.

---

## 1. Files to Create

### Components

| File | Purpose |
|------|---------|
| `src/components/calendar/WeekView.tsx` | Top-level weekly view container. Renders the 7-day grid header + time-slot grid. |
| `src/components/calendar/WeekGrid.tsx` | The scrollable time-slot grid (24 rows × 7 columns). |
| `src/components/calendar/WeekHeader.tsx` | Day-of-week headers with dates (Mon 26, Tue 27, …). |
| `src/components/calendar/EventBlock.tsx` | A single positioned event card rendered inside the grid. |
| `src/components/calendar/TimeGutter.tsx` | Left-side time labels (12 AM, 1 AM, …). |
| `src/hooks/useWeekEvents.ts` | Custom hook: fetches/filters events for the active week range. |
| `src/utils/calendarWeek.ts` | Pure helpers: `getWeekDays(date)`, `getEventPosition(event, slotHeight)`, overlap detection. |

### Routes (if using file-based routing, e.g. TanStack Router or Next.js App Router)

| File | Purpose |
|------|---------|
| `src/routes/calendar/week.$date.tsx` | Route file for `/calendar/week/2025-05-26`. Loads week data via a loader. |

---

## 2. Files to Modify

| File | Change |
|------|--------|
| `src/components/calendar/CalendarLayout.tsx` (or equivalent shell) | Add a "Week" tab/button to the view switcher alongside Month/Day views. |
| `src/routes/calendar/index.tsx` (or `_layout.tsx`) | Add the `/week` route to the router config and default redirect. |
| `src/server/routers/events.ts` (tRPC) or `src/api/events.ts` | Add/extend a `getEventsByRange(startDate, endDate)` procedure if it doesn't exist. |
| `src/types/calendar.ts` | Add `WeekViewEvent` type if you need a shape different from the DB model (e.g. with computed `top`/`height` CSS values). |
| `src/styles/calendar.css` (or equivalent) | Add grid CSS variables (`--slot-height`, `--gutter-width`) used by the week grid. |

---

## 3. Libraries to Use

### Date handling
- **`date-fns`** (preferred) — `startOfWeek`, `endOfWeek`, `eachDayOfInterval`, `addWeeks`, `subWeeks`, `format`, `isSameDay`. Avoid `moment.js` (deprecated).
- Alternative: **`dayjs`** with the `weekOfYear` plugin.

### UI / Styling
- **CSS Grid** for the 7-column time grid (no extra library needed). Use `grid-template-columns: repeat(7, 1fr)` and `grid-template-rows: repeat(48, var(--slot-height))` for 30-min slots.
- If the project already uses a component library (Ant Design, MUI, shadcn/ui), reuse its `Tooltip`, `Popover`, and `Badge` for event detail previews.
- **`react-resizable`** or **`react-dnd`** only if drag-and-drop / resize of events is needed.

### Data fetching
- Follow the existing pattern (tRPC + TanStack Query, or Next.js Server Actions + `useQuery`). Do NOT introduce a new data-fetching layer.
- Use `keepPreviousData: true` in the query options so the grid doesn't flash empty while navigating between weeks.

### Animations (optional)
- **`framer-motion`** / **`motion`** for slide-left/slide-right transitions when navigating weeks.

---

## 4. Key Patterns

### Event positioning (CSS absolute inside grid cell)
```ts
// src/utils/calendarWeek.ts
export function getEventStyle(event: CalendarEvent, slotHeightPx: number) {
  const startMinutes = event.startTime.getHours() * 60 + event.startTime.getMinutes();
  const durationMinutes =
    (event.endTime.getTime() - event.startTime.getTime()) / 60_000;
  return {
    top: `${(startMinutes / 60) * slotHeightPx}px`,
    height: `${(durationMinutes / 60) * slotHeightPx}px`,
  };
}
```

### Overlap detection (side-by-side columns)
Group events on the same day that overlap in time, assign each a `column` index and a `totalColumns` count, then set `width: calc(100% / totalColumns)` and `left: calc(100% / totalColumns * column)`.

### Week navigation
Keep the active week anchor date in the URL (`/calendar/week/2025-05-26`) so the view is shareable and browser-back works. Derive the 7 days from that anchor with `date-fns`'s `startOfWeek`.

### Data fetching hook pattern
```ts
// src/hooks/useWeekEvents.ts
export function useWeekEvents(anchorDate: Date) {
  const start = startOfWeek(anchorDate, { weekStartsOn: 1 });
  const end = endOfWeek(anchorDate, { weekStartsOn: 1 });
  return trpc.events.getByRange.useQuery(
    { start: start.toISOString(), end: end.toISOString() },
    { keepPreviousData: true }
  );
}
```

### Accessibility
- Each event block needs `role="button"` + `aria-label` describing the event title and time.
- The time gutter labels should use `aria-hidden="true"` (they are decorative).
- Keyboard navigation: `Tab` between events, `Enter`/`Space` to open detail.

---

## 5. Suggested File Order of Implementation

1. `src/utils/calendarWeek.ts` — pure helpers, no dependencies, easy to test.
2. `src/server/routers/events.ts` — extend API to support date range queries.
3. `src/hooks/useWeekEvents.ts` — wire the API to a React hook.
4. `src/components/calendar/TimeGutter.tsx` + `WeekHeader.tsx` — static structure.
5. `src/components/calendar/EventBlock.tsx` — positioned event card.
6. `src/components/calendar/WeekGrid.tsx` + `WeekView.tsx` — assemble everything.
7. Route file + view-switcher modification — integrate into the app shell.
