# Backlog — Calendar

## Left out by round

### 2026-11-18 · Spec written from the shipped code
- Specs for `contacts`, `reminders`, `data-transfer` and `access` not written yet: one area per round, calendar first.
- Monthly route loader prefetches with a 0-based month while the view reads with a 1-based month, so the prefetch never hits the view's cache entry. Not a behaviour of the spec; a code fix to schedule.
- Weekly and monthly loaders prefetch the current date's period, not the shared current period; a cache miss when the user had moved elsewhere. Same as above.

### 2026-11-18 · RDV server rules (CAL-RDV-1..3)
- Existing RDVs that break the new rules (overlaps, end not after start, end stored as `00:00` from a drag at 24:00) are not cleaned up. Reason: no data migration was asked for; a one-off query can list them if needed.
- Validation messages and the 23:59 drag end cap are `[PROPOSAL]` in §2.2 and §5, to confirm.

## Questions for UX and future evolutions
- q.6 Should releasing the mouse outside the weekly grid, or leaving it, cancel the drag? (§5)
- q.7 Should the confirmation date field be labelled "Date de confirmation", and should the mode default to "Email" when no confirmation is set? (§7.1)
- Should the daily view get a date picker and the three views a "back to the current date" button?
- Should overlapping RDVs in the weekly view be laid out side by side?
