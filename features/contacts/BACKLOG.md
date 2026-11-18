# Contacts — Backlog

## Left out by round

### 2026-11-18 · Next-page loading indicator
- **The spinner sits under the scroll area, not inside it.** While it shows, the list viewport shrinks by about 32 px. Kept there to leave the shared `VirtualizedList` untouched; add a footer slot to it if a second infinite-scroll list appears or the shrink is noticed.
- **Not checked in the browser.** The dev server uses the prod DB; scrolling is read-only, so a manual look is safe whenever convenient.

### 2026-11-18 · Contact search on the server
- **Selects show the first 50 matches only** (calendar filter, RDV form "Patient"). There is no scroll-to-load-more in the dropdown: a contact past the 50th match is reached by typing more of its name. Deferred to keep the Selects simple; wire `fetchNextPage` to the Select's `onPopupScroll` if users complain.
- **The general practitioner list is still loaded whole** and filtered in the browser (§7.2). It is small, so it costs little Worker CPU. Move it to the same server search if it grows.
- **The general practitioner select still uses a substring match** (§7.5), unlike the prefix rule of the contact search. Kept as shipped.
- **No database index for the search.** The `ILIKE` prefix search and the `(lastname, firstname, id)` sort run as a sequential scan, which is fine at about 5000 rows. Add an index on `(lastname, firstname, id)` (and `lower()` / `text_pattern_ops` indexes if prefix search gets slow) once Neon query time shows up. This needs a migration on the prod DB.
- **Offset pagination** can show a contact twice or skip one when another user creates or deletes a contact between two page loads (§2 edge case). Keyset pagination would fix it; not worth it at this size.
- **The birth date suffix in the RDV contact select** only counts homonyms among the listed matches (calendar §7.1).
- **No manual browser check yet.** The dev server uses the prod DB, so only read-only checks are allowed there.

## Questions for UX and future evolutions
- [q.1] Should the server refuse an empty first or last name, and check the email format on create as it does on update?
- [q.2] When a contact that RDVs reference is deleted, should the RDVs keep their link cleared, or should the delete be refused? The live database behaviour is unverified.
- [q.3] Should the server refuse an empty general practitioner last name?
- [q.4] Should deleting a general practitioner still linked to contacts show its own message (for example "Ce médecin est lié à 3 contacts") instead of the generic error?
- Should the contact search also match on email or phone? Front-desk users may search by phone number.
- Should the search ignore accents ("helene" finding "Hélène")? That needs `unaccent` in Postgres.
