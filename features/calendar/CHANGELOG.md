# Calendar spec — Changelog

## 2026-11-18 · Contact search on the server
- §3 Contact filter: select of every contact, substring match on the contact label → server contact search (`features/contacts/SPEC.md` §2, prefix rule), first page of matches only, chosen contact's label kept. Status Shipped → Specced. Why: loading every contact (~5000) cost too much Worker CPU.
- §7.1 RDV form "Patient (contact)": same change; the birth date suffix counts homonyms among the listed matches only. Status Shipped → Specced.

## 2026-11-18 · Decisions on q.1 to q.5
- §2.1 Conflict rule: three strict cases → any overlap of more than zero minutes (`start < E and end > S`). Identical ranges and ranges sharing only a start or an end now conflict. Why: q.1, two RDVs at the same time were accepted. Refs: CAL-RDV-1.
- §2.2, §2.3 Validation: server accepted any string → refuses a non-ISO or non-existent date, a blank name, an hour outside `HH:mm` 00:00–23:59, and an end not after its start, with `BAD_REQUEST` and a plain-text message. Why: q.2, q.3, only the form checked these. Refs: CAL-RDV-2.
- §5 Drag to create: end cap 24:00 → 23:59 [PROPOSAL]. Why: the form turned 24:00 into 00:00, which the end-after-start rule of §2.2 refuses. Refs: CAL-RDV-2.
- §2.4 Delete: unknown id `INTERNAL_SERVER_ERROR` → `NOT_FOUND` "Rendez-vous introuvable (id <id>)". Why: q.4, same answer as update. Refs: CAL-RDV-3.
- §4 Daily view: q.5 closed, the metric cards stay as shipped (clock time of the current date, label "RDV aujourd'hui" on every day).

## 2026-11-18 · Spec written from the shipped code
- §1 to §7.2 added, describing the code as shipped. Open questions q.1 to q.7 record behaviour
  that may be unintended; they are kept as described until decided.
