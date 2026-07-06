# Adding a `priority` Field (low / medium / high) to the `rdv` Model — End-to-End Guide

This guide covers every layer that must change, in the correct execution order, with exact file paths and code snippets drawn from the real codebase.

---

## Overview of changes

| Layer | File | What changes |
|---|---|---|
| 1. Database schema | `prisma/schema.prisma` | Add `priority` enum + column to `rdv` |
| 2. Zod model / input validator | `src/configurations/trpc/router/calendarRouter.ts` | Add `priority` to `RdvCreateSchema` |
| 3. tRPC mutation | `src/configurations/trpc/router/calendarRouter.ts` | Pass `priority` to `prisma.rdv.create` |
| 4. UI form | `src/components/Layout/AddRdv/AddRdv.tsx` | Add Priority `<Select>` field |
| 5. Display card | `src/components/DailyView/RdvCard/RdvCard.tsx` | Show priority badge |

The service layer (`src/services/calendarService.ts`) needs **no changes** because `useAddRdv` forwards the mutation input as-is via `trpc.calendar.addRdv.mutationOptions()`.

---

## Step 1 — Database schema (`prisma/schema.prisma`)

Add a Prisma enum and an optional column on `rdv`.

```prisma
// prisma/schema.prisma

enum Priority {
  low
  medium
  high
}

model rdv {
  id           Int       @id @default(autoincrement())
  day_id       Int
  start_hour   String    @db.VarChar
  end_hour     String
  name         String    @db.VarChar
  rdv_type     String?   @db.VarChar
  is_confirmed Boolean?
  priority     Priority?                        // <-- NEW
  day          day       @relation(fields: [day_id], references: [id], onDelete: NoAction, onUpdate: NoAction, map: "constraint_day")

  @@index([day_id], map: "index_day")
}
```

Making `priority` optional (`Priority?`) means existing rows are unaffected and the field is not required in the creation form.

After editing the file, push the migration:

```bash
npx prisma db push
```

This regenerates the Prisma client at `generated/prisma/` automatically. No manual codegen step is needed.

---

## Step 2 — Zod schema + tRPC mutation (`src/configurations/trpc/router/calendarRouter.ts`)

`RdvCreateSchema` lives at the top of this file and acts as both the tRPC input validator and the TypeScript type source.

**Add the import and the new field:**

```typescript
// src/configurations/trpc/router/calendarRouter.ts  (top of file)
import z from 'zod';
import { publicProcedure } from '../init';
import { prisma } from '#/db.ts';
import dayjs from 'dayjs';

export const RdvCreateSchema = z.object({
  date: z.string(),
  name: z.string(),
  start_hour: z.string(),
  end_hour: z.string(),
  rdv_type: z.string().optional(),
  is_confirmed: z.boolean().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),  // <-- NEW
});
```

**Pass the field in `addRdv`:**

```typescript
  addRdv: publicProcedure.input(RdvCreateSchema).mutation(async ({ input }) => {
    const date = toUTCDate(input.date);

    let day = await prisma.day.findFirst({ where: { date } });

    if (!day) {
      day = await prisma.day.create({ data: { date } });
    }

    return prisma.rdv.create({
      data: {
        start_hour: input.start_hour,
        end_hour: input.end_hour,
        name: input.name,
        day_id: day.id,
        rdv_type: input.rdv_type ?? null,
        is_confirmed: input.is_confirmed ?? null,
        priority: input.priority ?? null,   // <-- NEW
      },
    });
  }),
```

No changes are needed to `listByDay`, `listByWeek`, or `listByMonth` — Prisma's `include: { rdv: true }` already returns all columns, so `priority` will automatically appear in query results once the schema is pushed.

---

## Step 3 — UI form (`src/components/Layout/AddRdv/AddRdv.tsx`)

Three additions:
1. Extend the local `CreateRdvFormValues` interface.
2. Add a `PRIORITY_OPTIONS` constant.
3. Add a `<Form.Item>` for priority.
4. Forward the value in `onFinish`.

```typescript
// src/components/Layout/AddRdv/AddRdv.tsx

// 1. Extend the form values interface
interface CreateRdvFormValues {
  name: string;
  day: Dayjs;
  start_time: Dayjs;
  end_time: Dayjs;
  rdv_type?: string;
  is_confirmed?: boolean;
  priority?: 'low' | 'medium' | 'high';   // <-- NEW
}

// 2. New options constant (add alongside RDV_TYPE_OPTIONS and STATUT_OPTIONS)
const PRIORITY_OPTIONS = [
  { value: 'low',    label: 'Basse' },
  { value: 'medium', label: 'Moyenne' },
  { value: 'high',   label: 'Haute' },
];

// 3. In onFinish, forward the field
const onFinish = (values: CreateRdvFormValues) => {
  addRdv(
    {
      date: values.day.format('YYYY-MM-DD'),
      name: values.name,
      start_hour: values.start_time.format('HH:mm'),
      end_hour: values.end_time.format('HH:mm'),
      rdv_type: values.rdv_type,
      is_confirmed: values.is_confirmed,
      priority: values.priority,   // <-- NEW
    },
    {
      onSuccess: () => {
        form.resetFields();
        onClose();
      },
    },
  );
};

// 4. In the JSX, add the Select after the "Statut" item
<Form.Item label="Priorité" name="priority">
  <Select placeholder="Sélectionner" options={PRIORITY_OPTIONS} allowClear />
</Form.Item>
```

---

## Step 4 — Display card (`src/components/DailyView/RdvCard/RdvCard.tsx`)

Add `priority` to the props interface and render a color-coded badge.

```typescript
// src/components/DailyView/RdvCard/RdvCard.tsx

interface RdvCardProps {
  start_hour: string;
  end_hour: string;
  name: string;
  type: string | null;
  is_confirmed: boolean | null;
  priority?: 'low' | 'medium' | 'high' | null;   // <-- NEW
  onClick?: () => void;
}

// Color map (add above the component function)
const PRIORITY_STYLES: Record<string, { label: string; classes: string }> = {
  low:    { label: 'Basse',   classes: 'bg-green-50 text-green-700 border-green-200' },
  medium: { label: 'Moyenne', classes: 'bg-amber-50 text-amber-700 border-amber-200' },
  high:   { label: 'Haute',   classes: 'bg-red-50 text-red-700 border-red-200' },
};

// Inside the component, destructure priority
export function RdvCard({ start_hour, end_hour, name, type, is_confirmed, priority, onClick }: RdvCardProps) {
  const isConfirmed = is_confirmed === true;
  const priorityStyle = priority ? PRIORITY_STYLES[priority] : null;

  return (
    <div
      onClick={onClick}
      className="flex items-center bg-white rounded-xl border border-[#E7E5E4] px-4 py-3 mb-3 hover:border-[#92400E]/30 hover:shadow-sm transition-all cursor-pointer"
    >
      {/* ... existing clock block ... */}
      {/* ... existing divider ... */}
      {/* ... existing name block ... */}

      <div className="flex items-center gap-3 ml-3 shrink-0">
        {priorityStyle && (                                              // <-- NEW
          <span className={`text-xs px-2.5 py-1 rounded-full border whitespace-nowrap ${priorityStyle.classes}`}>
            {priorityStyle.label}
          </span>
        )}
        {type && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-[#92400E] border border-amber-200 whitespace-nowrap">
            {type}
          </span>
        )}
        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${isConfirmed ? 'bg-green-500' : 'bg-amber-400'}`} />
      </div>
    </div>
  );
}
```

> **Note**: Check which parent component renders `<RdvCard>` (likely `src/components/DailyView/DailyView.tsx`) and pass `priority={rdv.priority}` there once the Prisma type carries the field.

---

## Step 5 — Verify the parent passes `priority` down

Open `src/components/DailyView/DailyView.tsx` and find where `<RdvCard>` is rendered. The `rdv` objects returned by `listByDay` / `listByWeek` / `listByMonth` will now include a `priority` field after the schema push. Add the prop:

```tsx
<RdvCard
  start_hour={rdv.start_hour}
  end_hour={rdv.end_hour}
  name={rdv.name}
  type={rdv.rdv_type ?? null}
  is_confirmed={rdv.is_confirmed ?? null}
  priority={rdv.priority ?? null}   // <-- NEW
/>
```

---

## Execution checklist

```
[ ] 1. Edit prisma/schema.prisma — add Priority enum + priority column
[ ] 2. Run: npx prisma db push
[ ] 3. Edit src/configurations/trpc/router/calendarRouter.ts — RdvCreateSchema + addRdv handler
[ ] 4. Edit src/components/Layout/AddRdv/AddRdv.tsx — form field
[ ] 5. Edit src/components/DailyView/RdvCard/RdvCard.tsx — display badge
[ ] 6. Edit src/components/DailyView/DailyView.tsx — pass priority prop to RdvCard
[ ] 7. Run: npm run dev — verify form saves and card renders the badge
```

---

## Why no service-layer changes are needed

`src/services/calendarService.ts` uses `trpc.calendar.addRdv.mutationOptions()` which is fully generic — it infers the input type directly from `RdvCreateSchema`. As soon as `priority` is added to that schema, `useAddRdv`'s input type is updated automatically. No wrapper logic needs to change.

---

## Skills used

- `project-context` — loaded full tech stack, architecture, schema, and conventions before producing this guide.
