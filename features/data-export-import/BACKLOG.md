# Backlog — Data export / import

## Left out by round

- Round 1 (tickets): no server-side storage of the files (browser download chosen), no scheduled export (manual only). Revisit if the user wants files kept automatically (R2).

- Round 2 (CAL-EXP-1→4, CAL-IMP-1/2, header buttons):
  - The import's Prisma transaction (array `$transaction` on PrismaNeon/Workers) has never run against a real DB (dev = prod). Try it once on a Neon branch before the first real import.
  - The export is recorded as done once the 4 downloads are triggered; if the browser blocks some of them, the "since last export" window still moves on (the rolling file covers the last month). Not fixed — needs a UX choice (confirm step or one zip file).
  - Empty `day` rows created before a failed import stay behind (harmless, outside the transaction).
  - No row cap on an import; a very large file may hit Worker CPU/body limits.
  - Import row schemas are deliberately permissive (no e164/email/enum checks) so legacy rows round-trip; they don't reuse the Create schemas.
  - No component test for the modal/buttons and no browser check yet; the Excel round trip is covered by `parseImportFile.test.ts`.

## Questions for UX and future evolutions

- Should the last export date be visible somewhere (Exporter tooltip), now that only the success toast shows the range?
- After an export, confirm "les 4 fichiers ont été téléchargés" before recording it, or bundle the 4 files into one zip?

- RDV ranges use the RDV date; an RDV created after an export but dated before it (older than one month) is never in any file. Add a `created_at`/`updated_at` on `rdv` to export "changed since last export" instead?
- Should import also accept files edited by hand (rows without id → always create)?
- Should `day` rows be exported too, or is the RDV `date` column enough (current assumption)?
