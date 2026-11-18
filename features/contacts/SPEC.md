# Contacts — Specification

Behavioural contract of the contacts page (`/contacts`): contact data, the contact list and its
server search, the detail panel, contact create, update and delete, the contact form, a contact's
RDV history, and general practitioners. Terms are defined in `docs/GLOSSARY.md`. History in
`CHANGELOG.md`.

| § | Title | Status |
|---|---|---|
| 1 | Contact data | Shipped |
| 2 | Contact search and list | Specced |
| 3 | Contact detail panel | Specced |
| 4.1 | Create a contact | Shipped |
| 4.2 | Update a contact | Shipped |
| 4.3 | Delete a contact | Shipped |
| 5 | Contact form | Specced |
| 6 | Contact RDV history | Shipped |
| 7.1 | General practitioner data | Shipped |
| 7.2 | General practitioner list | Shipped |
| 7.3 | General practitioner form | Shipped |
| 7.4 | Delete a general practitioner | Shipped |
| 7.5 | General practitioner select | Shipped |

Every server call in this spec requires a signed-in user with calendar access. Otherwise the
server refuses it with `UNAUTHORIZED` (not signed in) or `FORBIDDEN` (no calendar access).

A database failure on any call is answered with `INTERNAL_SERVER_ERROR` and the message
"Une erreur est survenue, veuillez réessayer.". A read that fails shows the error state
"Une erreur est survenue"; a read in progress shows a spinner.

---

## 1 Contact data
**Status:** Shipped · **Refs:** —

A contact is a patient. Its identity is first name + last name + birth date: no two contacts share
all three.

#### Data
| Field | Type | Required | Default | Rule |
|---|---|---|---|---|
| `id` | integer | yes | assigned by the database | |
| `firstname` | string | yes | — | |
| `lastname` | string | yes | — | |
| `civility` | `Dr`, `Mr`, `Mme`, or null | no | null | shown "Dr", "M.", "Mme" in the form select |
| `birthDate` | date (UTC midnight) | yes | resolved by the server when absent (§4.1) | (`firstname`, `lastname`, `birthDate`) unique |
| `email` | string or null | no | null | |
| `phoneNumber` | E.164 string or null | no | null | the form only produces `+33` followed by 9 digits (§5) |
| `birthLocation` | string or null | no | null | free text |
| `address` | string or null | no | null | free text |
| `notes` | string or null | no | null | free text |
| `generalPractitionerId` | integer → General practitioner, or null | no | null | must exist (§4.1) |

#### Edge cases and errors
- Deleting a contact that RDVs reference: §4.3.
- Deleting a general practitioner that contacts reference: §7.4.

---

## 2 Contact search and list
**Status:** Specced · **Refs:** —

The left sidebar of `/contacts` has two tabs, "Contacts" (default) and "Médecins" (§7.2). The
"Contacts" tab lists contacts page by page, filtered on the server by the contact search. More
contacts load when the user scrolls to the end of the list.

#### Behaviours
**Contact search** (also used by the calendar selects, `features/calendar/SPEC.md` §3 and §7.1)
- Input: a search string, possibly empty.
- Match: a contact matches when the search, compared case-insensitively, is a prefix of its first
  name, a prefix of its last name, or a prefix of "first name, a space, last name". The search is
  not trimmed. An empty search matches every contact.
- Order: last name, then first name, then `id`, ascending.
- Result: one page of at most the page size, plus whether more matches follow. The next page starts
  where the previous one ended (offset = number of contacts already loaded).

**Search input**
- Placeholder "Rechercher un contact...", clearable.
- The server is asked only once the input has not changed for the search delay. Each change
  restarts the delay. Clearing the input runs the empty search after the same delay.
- While the next search runs, the list keeps showing the previous results.
- A new search replaces the list with its first page and scrolls back to the top.

**Infinite scroll**
- Trigger: the last loaded row of the list is rendered (scrolled into view).
- Conditions: more matches follow and no page is already loading; otherwise nothing happens.
- Effect: the server returns the next page, appended to the end of the list.
- On failure: the loaded rows stay; the list shows the error state only when the first page fails.

**Row**
- Avatar with initials, then on one line the civility (when set) and "first name last name", then
  the email under it when set. The selected contact's row is highlighted.
- Clicking a row selects that contact (§3).

**After a contact is created, updated or deleted**
- Every loaded contact list and search is reloaded from its first page.

#### Examples
- Contacts Jean Dupont, Jeanne Martin, Marie Claire Durand, Paul Jean.
  - Search "jea" → Jean Dupont, Jeanne Martin, Paul Jean (prefix of a first name or a last name).
  - Search "jean d" → Jean Dupont ("jean dupont" starts with "jean d"); Paul Jean does not match.
  - Search "marie claire d" → Marie Claire Durand.
  - Search "pont" → no match: "pont" is inside "Dupont" but is not a prefix.
- 120 contacts, empty search, page size 50: the first load returns contacts 1–50. Scrolling to row
  50 loads 51–100, then 101–120. After that, no more requests are sent.

#### Edge cases and errors
- No match: the list shows "Aucun contact trouvé".
- The selected contact does not match the new search: it leaves the list, and the detail panel
  keeps showing it (§3).
- A contact created or deleted by someone else between two page loads can shift the offset: one
  contact may then appear twice or be skipped until the next reload.

#### Validation
- The server accepts a search string up to the search length cap and a non-negative integer
  offset; anything else is refused with `BAD_REQUEST`.

#### Numbers
| Value | Code | Default | Note |
|---|---|---|---|
| Page size | `CONTACT_PAGE_SIZE` | 50 | |
| Search delay | `SEARCH_DEBOUNCE_MS` | 300 ms | shared with the general practitioner list (§7.2) |
| Search length cap | `SEARCH_MAX_LENGTH` | 100 characters | |

---

## 3 Contact detail panel
**Status:** Specced · **Refs:** —

The right pane of `/contacts` shows the selected contact.

#### Behaviours
**Selection**
- Nothing selected: an icon and "Sélectionnez un contact".
- Selecting a contact reads it from the server by `id`, shows its detail and leaves edit mode.
  The panel does not depend on the contact being in the loaded list.
- After an update, the panel reloads the contact.

**Detail**
- Header: avatar with initials (first letter of first name and of last name; the first two letters
  of the last name when the first name is empty), the civility as stored when set, and
  "first name last name".
- Rows, each only when set, in this order: email; phone as "+33 6 12 34 56 78"; birth date
  `DD/MM/YYYY`; birth location; address; general practitioner (§7.5 label, with no row when the
  contact has none or it was deleted); notes.
- Then the contact's RDV history (§6).
- Buttons: a delete icon button (§4.3) and "Modifier", which switches the panel to the edit form
  (§4.2).

#### Edge cases and errors
- The selected contact was deleted elsewhere: the panel shows
  "Sélectionnez un contact".

---

## 4.1 Create a contact
**Status:** Shipped · **Refs:** —

#### Behaviours
**Open**
- From the "Contact" button in the app header. The modal "Nouveau Contact" shows the contact form
  (§5) with the buttons "Annuler" and "Créer".

**Server rules**, in this order:
1. Birth date: when given, it is truncated to UTC midnight and used. When absent, the server looks
   for a homonym. If one exists, it refuses with `BAD_REQUEST`
   `Un contact "<firstname> <lastname>" existe déjà : la date de naissance est obligatoire`.
   Otherwise the birth date is the current date (UTC midnight).
2. Identity: when another contact has the same first name, last name and birth date, the server
   refuses with `CONFLICT` `Un contact "<firstname> <lastname>" né le <DD/MM/YYYY> existe déjà`.
3. General practitioner: when `generalPractitionerId` is set and no such general practitioner
   exists, the server refuses with `NOT_FOUND` `Médecin traitant introuvable (id <id>)`.
4. The contact is saved.

**Submit**
- Success: toast "Contact créé", the form clears, the modal closes, lists reload (§2).
- Failure: toast with the server message, or "Erreur lors de la création du contact" when it is
  empty. The modal stays open with the values entered.
- "Annuler" or closing the modal clears the form.

#### Examples
- Jean Dupont exists. Create "jean  dupont " with no birth date → refused, birth date required.
- No Jean Dupont exists. Create Jean Dupont with no birth date → saved, birth date = current date.
- Jean Dupont born 01/01/1990 exists. Create Jean Dupont born 01/01/1990 → `CONFLICT`. Born
  02/01/1990 → saved.

#### Validation
- `email` and `phoneNumber` are optional; `phoneNumber` must be E.164 when present; `civility`
  must be one of its three values. Otherwise `BAD_REQUEST`.
- [OPEN q.1] The server accepts an empty first or last name and does not check the email format on
  create (it does on update). Should both be refused?

---

## 4.2 Update a contact
**Status:** Shipped · **Refs:** —

#### Behaviours
**Open**
- "Modifier" in the detail panel. The panel switches to "Modifier le contact", the contact form
  (§5) filled with the contact's values, and the buttons "Annuler" (back to the detail) and
  "Enregistrer".

**Server rules**
- Unknown `id`: `NOT_FOUND` `Contact introuvable (id <id>)`.
- Then the rules of §4.1 steps 1 to 3, where the contact being updated never counts as its own
  homonym or identity conflict.

**Submit**
- Empty email, phone, birth location, address, notes and general practitioner are sent as null.
- Success: toast "Contact mis à jour", the panel returns to the detail view, lists and the detail
  reload.
- Failure: toast with the server message, or "Erreur lors de la mise à jour du contact" when it is
  empty. The form stays open with the values entered.

#### Validation
- As §4.1, plus `email` must be a valid email when present, otherwise `BAD_REQUEST`.

---

## 4.3 Delete a contact
**Status:** Shipped · **Refs:** —

#### Behaviours
- Trigger: the delete icon in the detail panel, then confirm "Supprimer ce contact ?" /
  "Cette action est irréversible." with "Supprimer" (or "Annuler").
- Effect: the contact and its reminder email log entries are deleted.
- Success: toast "Contact supprimé", nothing is selected, lists reload (§2).
- Failure: toast with the server message, or "Erreur lors de la suppression du contact".

#### Edge cases and errors
- [OPEN q.2] A contact referenced by RDVs: the schema declares no delete rule for `rdv.contact_id`
  and no migration sets one, so the live database either clears the RDVs' contact or refuses the
  delete (generic error toast). Which one is intended?

---

## 5 Contact form
**Status:** Specced · **Refs:** —

Shared by create (§4.1) and update (§4.2).

#### Behaviours
**Fields** (in display order)

| Label | Control | Required | Sent as |
|---|---|---|---|
| "Civilité" | select "Dr" / "M." / "Mme", clearable, placeholder "—" | no | `civility` |
| "Prénom" | text, placeholder "Prénom" | yes | `firstname` |
| "Nom" | text, placeholder "Nom" | yes | `lastname` |
| "Médecin traitant" | general practitioner select (§7.5) | no | `generalPractitionerId` |
| "Email" | email input, placeholder "email@example.fr" | no | `email` |
| "Téléphone" | fixed "+33" prefix and a text input, placeholder "6 12 34 56 78" | no | `phoneNumber` |
| "Date de naissance" | date picker `DD/MM/YYYY`, placeholder "JJ/MM/AAAA" | see homonym check | `birthDate`, UTC midnight |
| "Lieu de naissance" | text, placeholder "Ville, Pays" | no | `birthLocation` |
| "Adresse" | text, placeholder "12 rue de la Paix, 75001 Paris" | no | `address` |
| "Notes" | text area, 3 rows, placeholder "Ajouter des notes..." | no | `notes` |

**Phone**
- The input keeps digits only and drops one leading 0; it shows them as the first digit then pairs
  ("6 12 34 56 78"). The value is `+33` followed by the digits; an empty input sends nothing.
- Error "Le numéro doit contenir 9 chiffres" unless the value is empty or exactly 9 digits.

**Homonym check** on "Date de naissance"
- Runs when the birth date changes, when the first or last name changes after the birth date
  field was touched, and on submit.
- Birth date set, or first or last name empty: valid, no server call.
- Otherwise the form waits the homonym check delay. If the first or last name changed during the
  wait, this check is dropped (the change starts a new one). Then it asks the server whether
  another contact has the same first and last name (case and surrounding spaces ignored; in
  update, the edited contact excluded). A result already received for the same names is reused
  without a new call.
- Homonym found: error "Un contact porte déjà ce nom : la date de naissance est obligatoire" and
  the form is not sent.
- Server call fails: the check passes; the server rule of §4.1 still applies on submit.

#### Examples
- Jean Dupont exists. The user types "Jean" then "Dupont" in under 300 ms each with an empty,
  touched birth date → one server call, after the last keystroke, and the error shows.
- Same names with a birth date set → no server call, no error.

#### Numbers
| Value | Code | Default | Note |
|---|---|---|---|
| Homonym check delay | `HOMONYM_CHECK_DEBOUNCE_MS` | 300 ms | |

---

## 6 Contact RDV history
**Status:** Shipped · **Refs:** —

Under the contact detail, heading "Rendez-vous".

#### Behaviours
- The server returns every RDV of the contact, by RDV date ascending, then start hour descending.
- "Prochain": the first RDV dated on or after the current date, shown as a card.
- A segmented control "À venir" (default) / "Passés":
  - "À venir" lists RDVs dated on or after the current date, in server order.
  - "Passés" lists the others, in reverse order.
  - Switching tab clears the date range.
- A date range picker `DD/MM/YYYY` keeps only RDVs whose date is in the range.
- Card: start and end hour, date `DD/MM`, RDV name, contact label, RDV type badge, status icon.
  Clicking a card opens the RDV detail modal (`features/calendar/SPEC.md` §7.2).

#### Edge cases and errors
- The contact has no RDV: "Aucun rendez-vous".
- The tab or range leaves nothing: "Aucun résultat".

---

## 7.1 General practitioner data
**Status:** Shipped · **Refs:** —

#### Data
| Field | Type | Required | Default | Rule |
|---|---|---|---|---|
| `id` | integer | yes | assigned by the database | |
| `lastname` | string | yes | — | |
| `firstname` | string or null | no | null | |
| `address` | string or null | no | null | free text |

- Name: "first name last name" when a first name is set, else the last name.

---

## 7.2 General practitioner list
**Status:** Shipped · **Refs:** —

The "Médecins" tab of the sidebar. The list is loaded whole, then searched in the browser.

#### Behaviours
- The server returns every general practitioner, by last name ascending.
- Search input: placeholder "Rechercher un médecin...", clearable. After the search delay (§2), the
  list keeps the general practitioners matching the contact search rule of §2 on their first and
  last name. The address is not searched.
- Row: avatar with initials, name, the address under it when set, an edit button (opens §7.3 in
  edit) and a delete button (§7.4).
- A "+" button titled "Ajouter un médecin traitant" opens §7.3 in create.

#### Edge cases and errors
- No match: "Aucun médecin trouvé".

---

## 7.3 General practitioner form
**Status:** Shipped · **Refs:** —

#### Behaviours
- Title "Nouveau médecin traitant" (create) or "Modifier le médecin traitant" (edit).
- Fields: "Prénom" (placeholder "Prénom"), "Nom" (placeholder "Nom", required, error
  "Le nom est requis"), "Adresse" (placeholder "12 rue de la Paix, 75001 Paris"). An empty first
  name or address is sent as null.
- Buttons "Annuler" and "Ajouter" (create) or "Enregistrer" (edit).
- Success: toast "Médecin traitant ajouté" or "Médecin traitant mis à jour", the form clears and
  the modal closes; the general practitioner list reloads.
- Failure: toast with the server message, or "Erreur lors de l'ajout du médecin traitant" /
  "Erreur lors de la mise à jour du médecin traitant". The modal stays open.

#### Validation
- Update of an unknown `id`: `NOT_FOUND` `Médecin traitant introuvable (id <id>)`.
- [OPEN q.3] The server accepts an empty last name. Should it be refused?

---

## 7.4 Delete a general practitioner
**Status:** Shipped · **Refs:** —

#### Behaviours
- Trigger: the delete button of a row, then confirm "Supprimer ce médecin ?" /
  "Cette action est irréversible." with "Supprimer" (or "Annuler").
- Success: toast "Médecin traitant supprimé"; the list reloads.
- Failure: toast with the server message, or "Erreur lors de la suppression du médecin traitant".

#### Edge cases and errors
- Contacts still reference it: the database refuses, and the toast shows
  "Une erreur est survenue, veuillez réessayer.".
- [OPEN q.4] Should that case get its own message (for example the number of linked contacts)?

---

## 7.5 General practitioner select
**Status:** Shipped · **Refs:** —

The "Médecin traitant" field of the contact form (§5).

#### Behaviours
- Select of every general practitioner, clearable, placeholder "Sélectionner un médecin traitant".
- Option label: the name (§7.1), followed by " — <address>" when an address is set. The same label
  is shown in the contact detail (§3).
- Search: case-insensitive substring of the option label.
- A "+" button titled "Ajouter un médecin traitant" opens §7.3 in create. After a successful
  create, the new general practitioner is selected in the field.
