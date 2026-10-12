# Backlog — Data export / import

## Left out by round

- Round 1 (tickets): no server-side storage of the files (browser download chosen), no scheduled export (manual only). Revisit if the user wants files kept automatically (R2).

- Round 2 (CAL-EXP-1 + header buttons): "Importer"/"Exporter" buttons sit in the header (`Layout/DataTransfer/DataTransferButtons.tsx`) but are disabled with a "Bientôt disponible" tooltip until CAL-EXP-2/3/4 and CAL-IMP-1/2 land. The `/donnees` page from CAL-EXP-4/CAL-IMP-2 is replaced by these header buttons; when wired, split into `ImportButton`/`ExportButton`, each owning its modal like `AddContact`.

## Questions for UX and future evolutions

- With the buttons in the header, where does "Dernier export : <date>" show (button tooltip, export modal)?

- RDV ranges use the RDV date; an RDV created after an export but dated before it (older than one month) is never in any file. Add a `created_at`/`updated_at` on `rdv` to export "changed since last export" instead?
- Should import also accept files edited by hand (rows without id → always create)?
- Should `day` rows be exported too, or is the RDV `date` column enough (current assumption)?
