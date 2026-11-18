# Contacts spec — Changelog

## 2026-11-18 · Next-page loading indicator
- §2 Infinite scroll: a spinner shows under the list while the next page loads. Why: the user had no sign that more contacts were coming.

## 2026-11-18 · Spec written; contact search moves to the server
- §1, §4.1 to §4.3, §6, §7.1 to §7.5 added, describing the code as shipped. Open questions q.1 to q.4 record behaviour that may be unintended.
- §2 Contact search and list: the whole contact list loaded and filtered in the browser → server contact search, pages of 50, next page on scroll to the end. Same prefix rule and 300 ms search delay. Why: returning ~5000 contacts per load cost too much Worker CPU.
- §2 Validation: search string capped at 100 characters (`SEARCH_MAX_LENGTH`). Why: each space in the query adds a database filter branch.
- §3 Contact detail panel: the selected contact is read by id from the server, so it stays shown when it leaves the list.
- §5 Contact form: the homonym check asks the server, after a 300 ms delay, instead of scanning every contact in the browser.
