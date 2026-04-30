# Adding a `priority` Field (low/medium/high) to the `rdv` Model — End-to-End Walkthrough

This guide covers every layer of the stack that must be touched, in the order you should apply the changes.

---

## Overview of layers touched

1. `prisma/schema.prisma` — add the enum + column
2. Run `npx prisma db push` — sync the DB
3. `src/models/CalendarModel.ts` — add the Zod enum + inferred type
4. `src/integrations/trpc/router/calendarRouter.ts` — add `priority` to `RdvCreateSchema` and the `addRdv` mutation
5. `src/services/calendarService.ts` — no change needed (service passes input through generically)
6. `src/components/Layout/AddRdv/AddRdv.tsx` — add a `Select` field for priority in the form
7. `src/components/DailyView/RdvCard/RdvCard.tsx` — display the priority badge
8. `src/components/DailyView/DailyView.tsx` — pass `priority` down to `RdvCard`

---

## Step 1 — `prisma/schema.prisma`

Add a Prisma enum and an optional column on `rdv`. Making it optional (`String?`) means existing rows are not broken and the field can be omitted when creating an rdv.

```prisma
// Add this enum at the top-level (outside any model)
enum Priority {
  low
  medium
  high
}

model rdv {
  id         Int       @id @default(autoincrement())
  day_id     Int
  start_hour String    @db.VarChar
  end_hour   String
  name       String    @db.VarChar
  rdv_type   String?   @db.VarChar
  status     String?   @db.VarChar
  priority   Priority?                   // <-- new field
  day        day       @relation(fields: [day_id], references: [id], onDelete: NoAction, onUpdate: NoAction, map: "constraint_day")

  @@index([day_id], map: "index_day")
}
```

> Note: Prisma 7.x with a PostgreSQL datasource maps a `enum` to a native Postgres `ENUM` type automatically.

---

## Step 2 — Sync the database

```bash
npx prisma db push
```

This creates the `Priority` enum type in NeonDB and adds the nullable `priority` column to the `rdv` table. No data migration is needed because the column is optional.

After pushing, the generated Prisma client (in `generated/prisma/`) will be regenerated automatically and will expose the `Priority` enum.

---

## Step 3 — `src/models/CalendarModel.ts`

Add a Zod enum for `RdvPriority` alongside the existing exports. This is the single source of truth for validation across the tRPC layer and can be reused in components.

```ts
// src/models/CalendarModel.ts
import z from 'zod';

export type CalendarMode = 'DAILY' | 'MONTHLY' | 'WEEKLY';

export interface Day {
  day: number;
  month: number;
  year: number;
}

// New: priority enum
export const RdvPrioritySchema = z.enum(['low', 'medium', 'high']);
export type RdvPriority = z.infer<typeof RdvPrioritySchema>;
```

---

## Step 4 — `src/integrations/trpc/router/calendarRouter.ts`

Import `RdvPrioritySchema` and add it as an optional field in `RdvCreateSchema`. Pass it through to the Prisma `create` call.

```ts
import z from 'zod';
import { publicProcedure } from '../init';
import { prisma } from '#/db.ts';
import { RdvPrioritySchema } from '#/models/CalendarModel.ts';

export const RdvCreateSchema = z.object({
  day: z.number(),
  day_month: z.number(),
  name: z.string(),
  day_year: z.number(),
  start_hour: z.string(),
  end_hour: z.string(),
  priority: RdvPrioritySchema.optional(), // <-- new field
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
        priority: input.priority ?? null, // <-- new field
      },
    });
  }),
};
```

---

## Step 5 — `src/services/calendarService.ts`

No changes needed. The `useAddRdv` hook calls `trpc.calendar.addRdv.mutationOptions()` and passes the input object directly from the component. TypeScript will automatically enforce the updated `RdvCreateSchema` type at the call site.

---

## Step 6 — `src/components/Layout/AddRdv/AddRdv.tsx`

Add an Ant Design `Select` for the priority field. The field is optional — no `required` rule — matching the optional schema.

```tsx
import { DatePicker, Form, Input, Modal, Select, TimePicker } from 'antd';
import { Button } from '#/components/Button/Button.tsx';
import { useAddRdv } from '#/services/calendarService.ts';
import type { RdvPriority } from '#/models/CalendarModel.ts';
import type { Dayjs } from 'dayjs';

const { RangePicker } = TimePicker;

interface AddRdvProps {
  open: boolean;
  onClose: () => void;
}

interface CreateRdvFormValues {
  name: string;
  day: Dayjs;
  time: [Dayjs, Dayjs];
  priority?: RdvPriority;
}

const PRIORITY_OPTIONS = [
  { label: 'Basse', value: 'low' },
  { label: 'Moyenne', value: 'medium' },
  { label: 'Haute', value: 'high' },
];

export function AddRdv({ open, onClose }: AddRdvProps) {
  const { mutate: addRdv, isPending } = useAddRdv();

  if (!open) {
    return null;
  }

  const onAddRdv = (formValue: CreateRdvFormValues) => {
    const [startTime, endTime] = formValue.time;

    addRdv(
      {
        day: formValue.day.date(),
        day_month: formValue.day.month() + 1,
        name: formValue.name,
        day_year: formValue.day.year(),
        start_hour: startTime.format('HH:mm'),
        end_hour: endTime.format('HH:mm'),
        priority: formValue.priority,  // <-- new field
      },
      {
        onSuccess: onClose,
      },
    );
  };

  return (
    <Modal footer={null} open={open} onCancel={() => onClose()} title="Ajouter un rdv">
      <Form onFinish={onAddRdv}>
        <Form.Item label="Nom" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Jour du rdv" name="day" rules={[{ required: true }]}>
          <DatePicker />
        </Form.Item>
        <Form.Item label="heure début / fin" name="time" rules={[{ required: true }]}>
          <RangePicker format="HH:mm" minuteStep={15} />
        </Form.Item>
        {/* New: priority selector */}
        <Form.Item label="Priorité" name="priority">
          <Select allowClear options={PRIORITY_OPTIONS} placeholder="Sélectionner une priorité" />
        </Form.Item>
        <Button disabled={isPending} type="submit">
          Ajouter
        </Button>
      </Form>
    </Modal>
  );
}
```

---

## Step 7 — `src/components/DailyView/RdvCard/RdvCard.tsx`

Add a `priority` prop and render a colored badge. The field is optional, so the badge only renders when present.

```tsx
import type { RdvPriority } from '#/models/CalendarModel.ts';

// Color mapping for the priority badge
const PRIORITY_CONFIG: Record<RdvPriority, { label: string; className: string }> = {
  low:    { label: 'Basse',   className: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
  medium: { label: 'Moyenne', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
  high:   { label: 'Haute',   className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
};

interface RdvCardProps {
  start_hour: string;
  end_hour: string;
  name: string;
  type: string | null;
  priority?: RdvPriority | null;  // <-- new prop
  onClick?: () => void;
}

export function RdvCard({ start_hour, end_hour, type, name, priority, onClick }: RdvCardProps) {
  const priorityConfig = priority ? PRIORITY_CONFIG[priority] : null;

  return (
    <div className="relative pl-8">
      <div className="absolute left-0 top-2 w-3 h-3 rounded-full bg-blue-500 dark:bg-blue-400 border-4 border-white dark:border-slate-900"></div>
      <div className="absolute left-[5px] top-5 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700"></div>
      <div
        onClick={onClick}
        className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 mb-4 hover:border-blue-400 dark:hover:border-blue-600 cursor-pointer transition-colors"
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">{start_hour}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">-</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">{end_hour}</div>
            </div>
            <div className="font-medium text-slate-900 dark:text-white text-lg">{name}</div>
          </div>
          {/* New: priority badge */}
          {priorityConfig && (
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${priorityConfig.className}`}>
              {priorityConfig.label}
            </span>
          )}
        </div>
        {type && <span className="text-sm text-slate-600 dark:text-slate-400 mb-1">{type}</span>}
      </div>
    </div>
  );
}
```

---

## Step 8 — `src/components/DailyView/DailyView.tsx`

Pass the `priority` field from the `rdv` Prisma type down to `RdvCard`. The `rdv` type is already imported from the generated Prisma client, so `priority` will be available automatically after `npx prisma db push` regenerates the client.

```tsx
// Only the map call changes — add `priority` to the destructured fields
{rdvs.map(({ id, start_hour, end_hour, name, rdv_type, priority }) => (
  <RdvCard
    key={id}
    name={name}
    start_hour={start_hour}
    end_hour={end_hour}
    type={rdv_type}
    priority={priority}   // <-- new prop
  />
))}
```

The `priority` value coming from Prisma is typed as `Priority | null` (the generated enum). Cast it to `RdvPriority | null` or accept that both types share the same union string values — TypeScript's structural typing means they are compatible without an explicit cast.

---

## Summary checklist

| # | File | Change |
|---|---|---|
| 1 | `prisma/schema.prisma` | Add `Priority` enum + optional `priority` column on `rdv` |
| 2 | Terminal | `npx prisma db push` |
| 3 | `src/models/CalendarModel.ts` | Add `RdvPrioritySchema` Zod enum + `RdvPriority` type |
| 4 | `src/integrations/trpc/router/calendarRouter.ts` | Extend `RdvCreateSchema` and `addRdv` Prisma call |
| 5 | `src/services/calendarService.ts` | No change |
| 6 | `src/components/Layout/AddRdv/AddRdv.tsx` | Add `Select` priority field to the form |
| 7 | `src/components/DailyView/RdvCard/RdvCard.tsx` | Add `priority` prop + colored badge |
| 8 | `src/components/DailyView/DailyView.tsx` | Destructure and pass `priority` to `RdvCard` |
