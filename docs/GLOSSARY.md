# Glossary

Every domain, UI and data term used in the specs under `features/*/SPEC.md`, defined once.
Specs link here instead of redefining a term.

| Term | Definition |
|---|---|
| **Calendar access** | Right to use the app. A signed-in user without it is sent to the forbidden page; every server call from them is refused with `FORBIDDEN`. Owned by `features/access/SPEC.md`. |
| **Calendar views** | The three screens that show RDVs over a period: daily (`/journaliere`, "Journalière"), weekly (`/hebdomadaire`, "Hebdomadaire"), monthly (`/mensuelle`, "Mensuelle"). |
| **Confirmation date** | Calendar date (no time) on which the RDV was confirmed with the patient. Independent of the RDV date. |
| **Confirmation mode** | Channel used to confirm the RDV: `email` ("Email"), `direct` ("Direct"), `phone` ("Téléphone"). |
| **Confirmation status** | `isConfirmed` of an RDV: `true` ("Confirmé"), `false` ("En attente"), or unset (`null`, no status). |
| **Conflict** | Two RDVs on the same Day whose time ranges overlap according to the conflict rule of `features/calendar/SPEC.md` §2.1. |
| **Contact** | A patient record (civility, first name, last name, birth date, phone, email, general practitioner). Owned by `features/contacts/SPEC.md`. In the UI a contact is labelled "Patient". |
| **Contact filter** | Contact chosen in the filter bar of the calendar views. RDVs not linked to it are dimmed. |
| **Contact label** | `[civility ]Firstname Lastname` of a contact. When two contacts share the same label, ` · DD/MM/YYYY` (birth date) is appended to tell them apart. |
| **Current period** | The date held by the calendar views, shared by all three: the day shown in daily view, the week containing it in weekly view, its month in monthly view. Starts on the current date when the app loads. |
| **Day** | Stored calendar date (UTC midnight, no time) that RDVs belong to. Created on demand the first time an RDV is placed on that date. |
| **Dimmed** | Displayed with reduced opacity and not clickable. |
| **General practitioner (GP)** | The patient's referring doctor ("médecin traitant"), linked to a contact. Owned by `features/contacts/SPEC.md`. |
| **Hour string** | Time of day as text, `HH:mm`, 24-hour, zero-padded (`08:15`, `23:45`). |
| **ISO date** | Calendar date as text, `YYYY-MM-DD`. |
| **RDV** | Rendez-vous: one appointment on one Day, with a start and end hour string, a name, and optional type, contact, confirmation status, confirmation date, confirmation mode and notes. |
| **RDV name** | Free-text title of an RDV. When a contact is picked in the form it is filled with the contact label (without birth date). |
| **RDV type** | Kind of consultation: `Premier bilan`, `Suivi`, `Rééducation`, `Bloc opératoire`, `Urgence`, `Privé`. |
| **Week** | Monday to Sunday, 7 days. The week of a date is the one whose Monday is that date or the closest Monday before it. |
