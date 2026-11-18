# Tickets — Data export / import (Excel)

> **Scope:** export and re-import the content of the DB (RDV, contacts, general practitioners) as Excel files, ids included.
> **Decisions taken:** files are generated in the browser and downloaded (no server storage); export is triggered manually; import upserts by id; RDV ranges are computed on the RDV date (`day.date`), Europe/Paris.

---

## Export — produced files

| File | Content | Name |
|---|---|---|
| RDV since last export | every RDV dated between the last export date (inclusive) and today (inclusive). First export ever: every RDV up to today | `rdv_<lastExportDate>_<today>.xlsx` (timestamped, never overwritten) |
| Rolling RDV | every RDV dated from today − 1 month onwards (future included) | `rdv_courants.xlsx` (constant) |
| Contacts | every contact | `contacts.xlsx` (constant) |
| Practitioners | every general practitioner | `medecins.xlsx` (constant) |

The 4 files are bundled in one `export_<today>.zip` (one download, so the browser never blocks a second one). Constant names overwrite the previous export when the zip is extracted into the same folder.

---

### CAL-EXP-1 — Persist the last export date

**Type:** Story · **Priority:** High

**Description**

Add an `export_log` table (`id`, `exported_at DateTime`) so the next export knows where the "RDV since last export" range starts. One row per export, the latest one is the reference.

**Acceptance criteria**

- [x] `export_log` model in `prisma/schema.prisma`, no DB-level default on `exported_at` (value set by the app)
- [x] Domain `dataTransfer` scaffolded (`models.ts`, `port/`, `adapter/` with mapper, `testSupport.ts`); `application/controllers/` (router + runtime) comes with the first procedure in CAL-EXP-2
- [x] `ExportLogRepository` port: `findLast()`, `record(exportedAt)`
- [x] `npx prisma db push` applied

---

### CAL-EXP-2 — `dataTransfer.getExportData` query

**Type:** Story · **Priority:** High

**Description**

One query returning everything the client needs to build the files, so the browser does not make four round-trips.

**Acceptance criteria**

- [x] Returns `{ exportedAt, lastExportAt | null, contacts, practitioners, rdvSinceLastExport, rdvRolling }`
- [x] Every row carries its `id` and every DB field; RDV rows also carry the `date` (from `day`), `contactId` and the contact's `firstname`/`lastname` for readability
- [x] `rdvSinceLastExport`: `day.date` between `lastExportAt` date (inclusive) and today (inclusive); when `lastExportAt` is null, every RDV up to today
- [x] `rdvRolling`: `day.date >= today − 1 month`
- [x] "Today" is computed in Europe/Paris and truncated to UTC midnight like every other date in the app
- [x] Query function in `application/queries/` with a colocated test on the range boundaries (first export, same-day re-export, month boundary)

**Technical notes**

- Inclusive bounds on purpose: an RDV exported twice is better than one never exported
- No `created_at` on `rdv`: an RDV added after an export but dated before it will only appear in `rdv_courants.xlsx` if within the last month — see BACKLOG

---

### CAL-EXP-3 — `dataTransfer.recordExport` mutation

**Type:** Task · **Priority:** High

**Description**

Record the export only once the files were generated, so a failed generation does not move the "since last export" start date.

**Acceptance criteria**

- [x] Input `{ exportedAt }` (the value returned by `getExportData`)
- [x] Inserts one `export_log` row
- [x] Called by the client after every file download was triggered without error

---

### CAL-EXP-4 — Export UI

**Type:** Story · **Priority:** High

**Description**

Wire the header "Exporter" button (currently a disabled placeholder in `Layout/DataTransfer/DataTransferButtons.tsx`).

**Acceptance criteria**

- [x] `ExportButton` component (own directory under `Layout/`, like `AddContact`) replaces the placeholder; success toast says which range the timestamped RDV file covers
- [x] Clicking "Exporter" fetches the data, builds the 4 `.xlsx` with `write-excel-file`, zips them with `fflate` into `export_<today>.zip`, downloads it, then calls `recordExport` (not called if building or downloading throws)
- [x] Loading state on the button, error toast if anything fails (and `recordExport` is not called)
- [x] Column headers are the camelCase field names, so the same files can be re-imported as-is (CAL-IMP-2)
- [x] Data fetched through a new `src/services/dataTransferService.ts` hook

**Technical notes**

- Add `write-excel-file` (MIT, ~20 KB gzip, browser build `write-excel-file/browser`). Lazy-import it on click to keep it out of the main bundle
- Use its column `schema` (one per file) with explicit types: `Date` for dates, `String` for phone numbers (keeps the leading 0), `Number` for ids, `Boolean` for `isConfirmed`
- Do not reinstall npm `xlsx@0.18.5` (unmaintained, known CVEs)

---

## Import

---

### CAL-IMP-1 — `dataTransfer.importData` mutation (upsert by id)

**Type:** Story · **Priority:** High

**Description**

Receive the parsed rows of any subset of the exported files and upsert them by id, in dependency order: practitioners → contacts → RDV.

**Acceptance criteria**

- [x] Input Zod schema: `{ practitioners?, contacts?, rdvs? }`, each row reusing the domain Create schema + a required `id`
- [x] Row with an existing id → update; unknown id → create with that id; nothing is ever deleted
- [x] RDV: the `day` is found-or-created from the row `date` (reuse the calendar find-or-create logic)
- [x] A contact referencing an unknown `generalPractitionerId`, or an RDV referencing an unknown `contactId`, is rejected with a row-level error
- [x] Contact identity conflict (`fullname_birthdate` on another id) → row-level error
- [x] Everything runs in one transaction: any row error → nothing is written, the full error list is returned (`{ file, rowNumber, reason }`)
- [x] After inserting explicit ids, each table's id sequence is reset to `MAX(id)` (`setval(pg_get_serial_sequence(...))`), otherwise the next create from the app collides
- [x] Success returns `{ created, updated }` counts per entity
- [x] Mutation function in `application/mutations/` with tests (update vs create, ordering, unknown FK, identity conflict)

**Technical notes**

- Check the Prisma Neon adapter in `src/db.ts` supports interactive transactions (WebSocket `PrismaNeon`, not `PrismaNeonHttp`)
- Large files: if one call hits Worker CPU/body limits, chunk on the client — measure first

---

### CAL-IMP-2 — Import UI

**Type:** Story · **Priority:** High

**Description**

Wire the header "Importer" button: it opens a modal to pick one or several exported files, preview, confirm.

**Acceptance criteria**

- [x] `Upload` (Ant Design) accepting `.xlsx`, multiple files
- [x] File kind detected from its columns (practitioner / contact / RDV), unknown file → error message
- [x] Parsed client-side with `read-excel-file`; preview shows the row count per entity before confirming
- [x] "Importer" sends the rows to `importData`; on failure, the row errors are listed (file, row, reason); on success, counts are shown and calendar/contact/practitioner queries are invalidated
- [x] Confirmation `Popconfirm` before import (it overwrites existing rows)

**Technical notes**

- Add `read-excel-file` (MIT, ~15 KB gzip, browser build `read-excel-file/browser`), lazy-imported when a file is picked
- Use its `schema` option (one per file kind, same column names and types as the CAL-EXP-4 export schemas) so cells arrive typed (`Date`, `Number`, `String`, `Boolean`) and its per-cell errors feed the row error list
- Share the column definitions between export and import (one module per entity) so the two cannot drift; the server Zod schemas stay the source of truth for validation

---

## Order

CAL-EXP-1 → CAL-EXP-2 → CAL-EXP-3 → CAL-EXP-4 → CAL-IMP-1 → CAL-IMP-2
