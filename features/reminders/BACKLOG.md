# Backlog — Weekly reminder email

## Left out by round

- Round 2 (implementation):
  - No "send now" batch button on `/rappels`: the cron plus per-row "Envoyer" cover the need.
  - The Brevo template only uses `civility`, `firstName`, `lastName`, `startHour`; `date`, `endHour`, `rdvType` are sent but unused until the template shows them.
  - Sender comes from the Brevo template (`olivier.abdelnour@gmail.com`): a gmail.com sender sent through Brevo fails DMARC alignment, so emails may land in spam. Authenticate `olivierabdelnour.dev` in Brevo and switch the template sender.
  - No component test for `Reminders` / `FailedReminderList`, and the page was not checked in a browser yet; domain logic is covered by tests.
  - Dev mocks the sender but still writes `email_log` rows to the shared DB; clear them with "Valider".
  - The cron was only checked on its no-op path (outside 12:00 Paris), not on a real Sunday.

## Questions for UX and future evolutions

- A contact with two RDV on Monday: one email per RDV (current behaviour) or one grouped email?
- Should a contact without email count as a failure on the page (current behaviour) or be listed separately?
- Should the user be alerted (email/push) when Sunday's run has failures, instead of having to open the page?
- Should "Valider" clear only the acknowledged run, or the whole log (current behaviour: whole log)?
- Should the email say the date ("lundi 19 octobre") rather than relying on "demain"?
- Should a successful reminder mark the RDV as confirmed by email (`confirmation_mode`), or stay separate from confirmation?
