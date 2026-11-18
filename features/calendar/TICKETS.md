# Tickets — Calendar

Status: ⚪ not started · 🟡 partly done (gap noted here and in BACKLOG) · 🔴 deviation, waiting for a decision · ✅ done and matches the spec

## RDV server rules (wave A)

> **Source:** decisions on spec questions q.1 to q.4, 2026-11-18. Tickets only. No schema change, no data reset. Existing RDVs that break the new rules (overlaps, end not after start) stay in the database; the rules apply to the next create or update of each RDV.

| Status | Wave | Ticket | Size | Depends on |
|---|---|---|---|---|
| ⚪ | A | CAL-RDV-1 — Refuse any overlap | S | — |
| ⚪ | A | CAL-RDV-2 — Server-side input validation | M | — |
| ⚪ | A | CAL-RDV-3 — `NOT_FOUND` on delete of an unknown RDV | S | — |

The three tickets touch disjoint files and can run in parallel. No shared contract changes: the tRPC procedure names and the error codes `CONFLICT` and `NOT_FOUND` stay as they are.

---

### CAL-RDV-1 — Refuse any overlap

**Spec:** §2.1 · **Files:** `src/domain/calendar/application/mutations/rdvConflict/rdvConflict.ts`, `rdvConflict.test.ts`

Replace the three-case overlap test with `start < existing.endHour && end > existing.startHour`.

**Acceptance criteria**
- [ ] One test per row of the §2.1 Examples table (5 conflicts, 2 back-to-back accepted)
- [ ] Update still excludes the RDV being updated (existing test kept)
- [ ] Conflict message unchanged: `Conflit avec "<name>" (<startHour>–<endHour>)`

---

### CAL-RDV-2 — Server-side input validation

**Spec:** §2.2 Validation, §2.3, §5 (drag end cap) · **Files:** `src/domain/calendar/models.ts` (`RdvCreateSchema`, `UpdateRdvSchema`), a test file next to it, `src/components/WeeklyView/grid/hooks/useDragToCreate.ts`, and the tRPC error formatting if the message needs it

Tighten both Zod schemas with the rules and messages of the §2.2 Validation table. Cap the drag-to-create end at 23:59.

**Acceptance criteria**
- [ ] One test per row of the §2.2 Validation table, for create and for update, each asserting the exact message
- [ ] Bounds tested: `2026-02-30` refused, `2026-02-28` accepted; `23:59` accepted, `24:00` refused; end equal to start refused, end one minute later accepted; name `"   "` refused
- [ ] The form toast shows the plain-text message (for example "L'heure de fin doit être après l'heure de début."), not the raw Zod issue list. Check how tRPC serialises input errors and adjust the error formatter or the client toast if needed
- [ ] Drag-to-create: a click at 23:45 opens the form at 23:45–23:59, and the RDV can be created
- [ ] The two schemas share the rules instead of repeating them

---

### CAL-RDV-3 — `NOT_FOUND` on delete of an unknown RDV

**Spec:** §2.4 · **Files:** `src/domain/calendar/application/mutations/deleteRdv/deleteRdv.ts` (new), `deleteRdv.test.ts` (new), `src/domain/calendar/application/controllers/calendarRouter.ts` (`deleteRdv` calls it)

Move deletion into a `deleteRdv` mutation that looks the RDV up first, as `updateRdv` does, and fails with `NotFoundError` when it is absent.

**Acceptance criteria**
- [ ] Test: existing id → the RDV is returned and the repository delete is called
- [ ] Test: unknown id → `NotFoundError` with "Rendez-vous introuvable (id <id>)", and the repository delete is not called
- [ ] The router maps it to `NOT_FOUND` (existing mapping, no change)

---

## Order

Wave A: CAL-RDV-1, CAL-RDV-2 and CAL-RDV-3 in parallel → simplify → reviewer-expert on the diff → spec-writer sets §2.1 to §2.4 and §5 to `Shipped`.
