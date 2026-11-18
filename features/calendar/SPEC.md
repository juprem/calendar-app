# Calendar — Specification

Behavioural contract of the calendar: RDV data, scheduling rules, the three calendar views, the
RDV form and detail modal. Terms are defined in `docs/GLOSSARY.md`. History in `CHANGELOG.md`.

| § | Title | Status |
|---|---|---|
| 1 | RDV data | Shipped |
| 2.1 | Conflict rule | Specced |
| 2.2 | Create an RDV | Specced |
| 2.3 | Update an RDV | Specced |
| 2.4 | Delete an RDV | Specced |
| 2.5 | Read RDVs by period | Shipped |
| 3 | RDV presentation and contact filter | Shipped |
| 4 | Daily view | Shipped |
| 5 | Weekly view | Specced |
| 6 | Monthly view | Shipped |
| 7.1 | RDV form | Shipped |
| 7.2 | RDV detail modal | Shipped |

Every server call in this spec requires a signed-in user with calendar access. Otherwise the
server refuses it with `UNAUTHORIZED` (not signed in) or `FORBIDDEN` (no calendar access).

---

## 1 RDV data
**Status:** Shipped · **Refs:** —

An RDV belongs to exactly one Day. A Day exists only once an RDV has been placed on its date; it
is never deleted, even when its last RDV is removed or moved.

#### Data

**Day**

| Field | Type | Required | Default | Rule |
|---|---|---|---|---|
| `id` | integer | yes | assigned by the database | |
| `date` | date (UTC midnight) | yes | — | unique: one Day per calendar date |

**RDV**

| Field | Type | Required | Default | Rule |
|---|---|---|---|---|
| `id` | integer | yes | assigned by the database | |
| `dayId` | integer → Day | yes | — | set by the server from the RDV date (§2.2) |
| `startHour` | hour string | yes | — | format and range in §2.2 |
| `endHour` | hour string | yes | — | strictly later than `startHour` (§2.2) |
| `name` | string | yes | — | free text |
| `rdvType` | RDV type or null | no | null | one of the six RDV type values |
| `isConfirmed` | boolean or null | no | null | confirmation status |
| `confirmationDate` | date (UTC midnight) or null | no | null | independent of the RDV date |
| `confirmationMode` | confirmation mode or null | no | null on the server; the form sends `email` (§7.1) | `email`, `direct`, `phone` |
| `additionalInfos` | string or null | no | null | free text |
| `contactId` | integer → Contact, or null | no | null | |

The fields `isConfirmed`, `confirmationDate` and `confirmationMode` are independent: any
combination is accepted and stored.

#### Edge cases and errors
- An RDV whose contact is deleted: owned by `features/contacts/SPEC.md`.
- Deleting an RDV deletes its reminder email log entry: owned by `features/reminders/SPEC.md`.

---

## 2.1 Conflict rule
**Status:** Specced · **Refs:** CAL-RDV-1

Before creating or updating an RDV, the server compares its start and end hour strings with every
other RDV of the same Day. Hour strings are compared as text, which matches time order for the
`HH:mm` values accepted by §2.2. RDVs on different Days never conflict.

#### Behaviours
**Overlap test**
- Trigger: create (§2.2) or update (§2.3), after validation.
- Effect: the new range `[start, end]` conflicts with an existing RDV `[S, E]` when
  `start < E` and `end > S`: the two ranges share more than zero minutes.
- On update, the RDV being updated is excluded from the comparison.
- On conflict: the server refuses with `CONFLICT` and the message
  `Conflit avec "<name>" (<startHour>–<endHour>)` (en dash) naming the first conflicting RDV found.
  Nothing is written.

#### Examples
Existing RDV 09:00–10:00 on the same Day:

| New range | `start < E` | `end > S` | Outcome |
|---|---|---|---|
| 09:30–10:30 | yes | yes | conflict |
| 09:00–10:00 | yes | yes | conflict |
| 09:00–11:00 | yes | yes | conflict |
| 08:00–10:00 | yes | yes | conflict |
| 09:15–09:45 | yes | yes | conflict |
| 10:00–11:00 | no | yes | accepted (back to back) |
| 08:00–09:00 | yes | no | accepted (back to back) |

---

## 2.2 Create an RDV
**Status:** Specced · **Refs:** CAL-RDV-2

#### Behaviours
**Create**
- Trigger: the user submits the creation form (§7.1).
- Input: RDV date (ISO date), `name`, `startHour`, `endHour`, and the optional fields of §1.
  `confirmationDate` is sent as an ISO date.
- Effect, in order:
  1. The server validates the input (§2.2 Validation).
  2. It looks up the Day of the RDV date, and creates it if it does not exist.
  3. It runs the conflict rule (§2.1) against that Day.
  4. It stores the RDV with every absent optional field set to null.
- Returns: the stored RDV.
- On failure: invalid input → §2.2 Validation. Conflict → §2.1. Database failure →
  `INTERNAL_SERVER_ERROR` with the message `Une erreur est survenue, veuillez réessayer.`

#### Edge cases and errors
- A conflict refusal after step 2 leaves the newly created Day in place, with no RDV.

#### Validation
The server refuses the input with `BAD_REQUEST` and writes nothing when a rule fails. The message
is the one of the first failing rule, in table order, as plain text.

| Field | Rule | Message on refusal |
|---|---|---|
| RDV date | ISO date of an existing calendar date (`2026-02-30` is refused) | "Date invalide : format attendu AAAA-MM-JJ." [PROPOSAL] |
| `name` | at least one character that is not whitespace | "Le nom du rendez-vous est obligatoire." [PROPOSAL] |
| `startHour`, `endHour` | `HH:mm`, from `00:00` to `23:59` | "Heure invalide : format attendu HH:mm." [PROPOSAL] |
| `endHour` | strictly later than `startHour` | "L'heure de fin doit être après l'heure de début." [PROPOSAL] |
| `confirmationDate` | when present, ISO date of an existing calendar date | "Date invalide : format attendu AAAA-MM-JJ." [PROPOSAL] |
| `rdvType`, `confirmationMode` | when present, one of the values of §1 | type validation message |

Any minute is accepted; the 15-minute step is a form rule only (§7.1).

#### Examples
- `startHour` 09:00, `endHour` 09:00 → refused, "L'heure de fin doit être après l'heure de début."
- `startHour` 09:00, `endHour` 09:01 → accepted.
- `name` "   " → refused, "Le nom du rendez-vous est obligatoire."
- `startHour` "9:00" → refused, "Heure invalide : format attendu HH:mm."

---

## 2.3 Update an RDV
**Status:** Specced · **Refs:** CAL-RDV-2

#### Behaviours
**Update**
- Trigger: the user saves the edit form (§7.1).
- Input: RDV `id`, plus the same fields as §2.2. Every optional field may be null, which clears it.
- Effect, in order:
  1. The server looks up the RDV by `id`.
  2. It finds or creates the Day of the submitted date. The RDV moves to that Day when the date
     differs.
  3. It runs the conflict rule (§2.1) on that Day, excluding this RDV.
  4. It replaces every field of the RDV with the submitted values.
- Returns: the stored RDV.
- On failure: invalid input → §2.2 Validation, checked before the lookup. Unknown `id` →
  `NOT_FOUND` with `Rendez-vous introuvable (id <id>)`. Conflict → §2.1. Database failure → as
  in §2.2.

#### Validation
The rules of §2.2, plus `id`: integer.

---

## 2.4 Delete an RDV
**Status:** Specced · **Refs:** CAL-RDV-3

#### Behaviours
**Delete**
- Trigger: the user confirms the deletion in the detail modal or the edit form (§7.2).
- Input: RDV `id`.
- Effect: the server looks up the RDV, then deletes it. Its Day is kept.
- Returns: the deleted RDV.
- On failure: unknown `id` → `NOT_FOUND` with `Rendez-vous introuvable (id <id>)`, nothing is
  deleted. Database failure → as in §2.2.

#### Examples
- Delete id 12, which exists → RDV 12 is returned and removed.
- Delete id 12 a second time → `NOT_FOUND`, "Rendez-vous introuvable (id 12)".

---

## 2.5 Read RDVs by period
**Status:** Shipped · **Refs:** —

#### Behaviours
| Read | Input | Range | Result |
|---|---|---|---|
| By day | ISO date | that date | the Day with its RDVs and their contacts, or null when no Day exists |
| By week | `startDay`, `startMonth` (0 = January), `startYear` | `[start, start + 7 days)` | the Days in range that exist, ascending by date |
| By month | `month` (1 = January), `year` | `[1st of month, 1st of next month)` | the Days in range that exist, ascending by date |

- In the week and month reads, each Day's RDVs are sorted by `startHour` ascending. The day read
  does not sort them.
- Days with no stored Day row are absent from the result. The views show them as empty.

---

## 3 RDV presentation and contact filter
**Status:** Shipped · **Refs:** —

Rules shared by the three calendar views.

#### Behaviours
**Status icon**
- `isConfirmed = true` → a check icon. `false` → a red warning icon. `null` → no icon.
- `confirmationMode` and `confirmationDate` do not affect any calendar view.

**Contact filter**
- Where: a filter bar shown on the three calendar views only.
- Control: a searchable select of every contact (case-insensitive substring match on the contact
  label), clearable, placeholder "Filtrer par patient".
- Effect: while a contact is chosen, every RDV whose `contactId` is not that contact, including
  RDVs with no contact, is dimmed. No RDV is hidden.
- The filter is kept when switching between calendar views.

**Open an RDV**
- Clicking an RDV that is not dimmed opens its detail modal (§7.2).

**Current period**
- The three views share one current period. Moving in one view moves the others.

#### Numbers
| Value | Code | Default | Note |
|---|---|---|---|
| Dimmed opacity, daily view | — | 30 % | |
| Dimmed opacity, weekly and monthly views | — | 20 % | |

#### Edge cases and errors
- A read fails: the view shows an error state with "Une erreur est survenue".

---

## 4 Daily view
**Status:** Shipped · **Refs:** —

Route `/journaliere`, also reached from `/`. Shows the RDVs of the day of the current period.

#### Behaviours
**Navigate**
- Previous and next buttons move the current period by 1 day. The view has no date picker and no
  button to return to the current date.

**Header**
- The weekday name (`dddd`) over the date (`D MMMM YYYY`), in French, capitalised.

**Metric cards**

| Label | Value | Subtitle |
|---|---|---|
| "RDV aujourd'hui" | number of RDVs of the shown day | — |
| "Prochain RDV" | start hour of the first RDV of the shown day whose start is later than the current clock time; "Aucun" if none | RDV name, then ` · <RDV type>` when set |
| "Dernier RDV" | start hour of the last RDV of the shown day; "-" if none | RDV name |

**RDV list**
- One card per RDV, sorted by `startHour` ascending.
- Card: start hour over end hour, RDV name, contact label when linked, RDV type badge when set,
  status icon (§3). `additionalInfos`, when set, shows as a tooltip.

#### Examples
- Shown day has RDVs at 09:00 and 14:00; clock time 11:30 → "Prochain RDV" shows 14:00.
- Same RDVs, shown on a later day, clock time 15:00 → "Prochain RDV" shows "Aucun", even though
  that day has not started. "RDV aujourd'hui" still counts the shown day's RDVs.

#### Edge cases and errors
- No RDV on the shown day: the list is empty, with no message. The cards show 0, "Aucun", "-".

---

## 5 Weekly view
**Status:** Specced · **Refs:** CAL-RDV-2, [OPEN q.6]

Route `/hebdomadaire`. Shows the week (Monday to Sunday) containing the current period, as a
time grid of 7 columns.

#### Behaviours
**Navigate**
- Previous and next buttons move the current period by 7 days.
- A calendar button ("Choisir une date") opens a date picker (`DD/MM/YYYY`). Picking a date sets
  the current period to it. No button returns to the current date.
- Label: `D — D MMMM YYYY` when Monday and Sunday are in the same month, otherwise
  `D MMMM — D MMMM YYYY` (em dash).

**Grid**
- Rows cover 00:00 to 24:00, labelled `HH:00` every hour with a `:30` mark every half hour.
- On opening, the grid scrolls to the initial scroll hour.
- Column headers: `Lun Mar Mer Jeu Ven Sam Dim` and the day number. The current date's column is
  highlighted.
- Hovering the grid shows a line at the pointer, snapped to the drag step, with the time as `8h`
  or `8h30`.

**RDV block**
- Placed in its day column from `startHour` to `endHour`, at least the minimum block height.
- Always shows the RDV name and status icon (§3). Shows `start – end` when the block is at least
  the time threshold, and the contact's first and last name when at least the contact threshold.
- Tooltip: `additionalInfos` and the contact's phone, when either is set.
- Overlapping RDVs in one column are drawn on top of each other at full width.

**Drag to create**
- Trigger: left mouse button pressed on an empty part of a day column. Pressing on an RDV block
  does not start a drag.
- While dragging: the selection follows the pointer within the starting column only, snapped to
  the drag step, between 00:00 and 23:45.
- On release inside the grid: start = the earlier of the two snapped times, end = the later one.
  When they are equal (a click), end = start + 1 drag step. End is capped at the drag end cap.
- Effect: the creation form (§7.1) opens with the column's date, the start and the end filled in.

#### Examples
- Press at 09:07, release at 10:22 → snapped 09:00 and 10:15 → form opens 09:00–10:15.
- Press and release at 23:52 → snapped 23:45, click → 24:00 capped → form opens 23:45–23:59.

#### Edge cases and errors
- Release outside the grid: the drag is not ended until the next release inside the grid. [OPEN q.6]

#### Numbers
| Value | Code | Default | Note |
|---|---|---|---|
| First grid hour | `START_HOUR` | 0 | |
| Last grid hour | `END_HOUR` | 24 | |
| Initial scroll hour | `INITIAL_SCROLL_HOUR` | 8 | |
| Drag and hover step | — | 15 min | |
| Drag end cap | — | 23:59 | [PROPOSAL] the latest end §2.2 accepts |
| Minimum block height | `QUARTER_HEIGHT` | 20 px (15 min) | |
| Time threshold | — | 36 px | |
| Contact threshold | — | 52 px | |

#### Open questions
- [OPEN q.6] Should releasing the mouse outside the grid, or leaving it, cancel the drag?

---

## 6 Monthly view
**Status:** Shipped · **Refs:** —

Route `/mensuelle`. Shows the month of the current period as a grid of weeks, Monday first.

#### Behaviours
**Navigate**
- Previous and next buttons move the current period by 1 month. The date picker of §5 is
  available. Label: `MMMM YYYY`, capitalised.

**Cell**
- Header row `Lun Mar Mer Jeu Ven Sam Dim`. Cells of days outside the month are empty and do
  nothing on click.
- A cell shows its day number (the current date is highlighted) and its first RDVs up to the
  visible cap, in the order of §2.5.
- RDV item: start hour, contact first and last name (or the RDV name when no contact), status
  icon (§3). Its native tooltip is `<start> – <end>  <name> · <additionalInfos>`.
- When a day has more RDVs than the visible cap, a button `+N autre` (N = 1) or `+N autres`
  (N > 1) opens the day list modal.

**Day list modal**
- Title: `dddd D MMMM YYYY`, capitalised. Lists every RDV of the day as daily-view cards (§4).
- Clicking a card opens its detail modal (§7.2); closing it returns to the list.

**Create**
- The monthly view has no create action on cells. RDVs are created from the header button (§7.1).

#### Numbers
| Value | Code | Default | Note |
|---|---|---|---|
| Visible cap per cell | `MAX_VISIBLE` | 3 | |

---

## 7.1 RDV form
**Status:** Shipped · **Refs:** [OPEN q.7]

One form used to create and to edit an RDV.

#### Behaviours
**Open for creation**
- From the header button "RDV" on every page: empty form, mode "Email".
- From drag to create (§5): date, start and end filled in, mode "Email".
- Modal title "Nouveau Rendez-vous". Buttons "Annuler" and "Créer".

**Open for edit**
- From "Modifier" in the detail modal (§7.2). The modal switches in place to the title
  "Modifier le Rendez-vous", filled with the RDV's values (mode "Email" when the RDV has none).
- Buttons "Supprimer" (§2.4, same confirmation as §7.2), "Annuler" (back to the detail view) and
  "Enregistrer".

**Fields** (in display order)

| Label | Control | Required | Initial value | Sent as |
|---|---|---|---|---|
| "Patient (contact)" | searchable select of contacts by contact label, clearable, placeholder "Sélectionner un contact" | no | empty | `contactId`, null when empty |
| "Nom" | text, placeholder "Nom du rendez-vous" | yes | empty | `name` |
| "Date" | date picker `DD/MM/YYYY` | yes | empty | RDV date, ISO date |
| "Horaires" | time range picker `HH:mm`, form step, placeholders "Début" / "Fin" | yes | empty | `startHour`, `endHour` |
| "Type" | select of RDV types, clearable, placeholder "Type de consultation" | no | empty | `rdvType` |
| "Statut" | select "Confirmé" (true) / "En attente" (false), clearable, placeholder "Statut" | no | empty | `isConfirmed` |
| "Date" | date picker `DD/MM/YYYY` | no | empty | `confirmationDate`, ISO date or null |
| "Mode" | select "Email" / "Direct" / "Téléphone", clearable | no | "Email" | `confirmationMode` |
| "Informations complémentaires" | text area, 2 rows, placeholder "Notes, précautions, contexte..." | no | empty | `additionalInfos`, null when empty |

- Choosing a contact replaces "Nom" with the contact's civility, first and last name. Clearing
  the contact leaves "Nom" unchanged.
- The form has no inline contact creation.

**Submit**
- Missing required field: the form shows the field error and sends nothing.
- Success: toast "Rendez-vous créé" or "Rendez-vous mis à jour", the modal closes, and the
  calendar views reload the RDV's date, week and month. After an edit, the contact's RDV list also
  reloads.
- Failure: toast with the server message (§2.1 to §2.3), or "Erreur lors de la création du
  rendez-vous" / "Erreur lors de la mise à jour du rendez-vous" when it is empty. The modal stays
  open with the values entered.
- "Annuler" or closing the creation modal clears the form.

#### Numbers
| Value | Code | Default | Note |
|---|---|---|---|
| Form time step | — | 15 min | the server accepts any minute |

#### Open questions
- [OPEN q.7] The RDV date and the confirmation date are both labelled "Date". Should the second be
  "Date de confirmation"? And should the mode default to "Email" when no confirmation is set?

---

## 7.2 RDV detail modal
**Status:** Shipped · **Refs:** —

Opened by clicking an RDV in a calendar view (§3), the day list modal (§6) or a contact's RDV list.

#### Behaviours
**Display**
- Title: the RDV name.
- Rows, each shown only when its value is set: `start – end`; RDV type badge; status "Confirmé"
  or "En attente de confirmation"; "Date de confirmation : DD/MM/YYYY (<mode>)" with the mode
  label, "Email" when the mode is null; contact label; contact phone; `additionalInfos`.
- Buttons "Supprimer", "Fermer", "Modifier" (§7.1).

**Delete**
- "Supprimer" asks "Supprimer ce rendez-vous ?" with "Cette action est irréversible." and the
  buttons "Supprimer" / "Annuler".
- On confirm: §2.4. Success → toast "Rendez-vous supprimé", the modal closes, the calendar views
  reload the RDV's date, week and month. Failure → toast with the server message, or "Erreur lors
  de la suppression du rendez-vous" when it is empty.
