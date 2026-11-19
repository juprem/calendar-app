# Backlog — Dependency upgrade

## Left out by round

### Round 1 — planning (2026-11-18)

- **`prisma` 8.0**: skipped, it is still a release candidate (`8.0.0-rc.34`). Revisit once 8.0.0 is stable; Dependabot (CAL-DEP-5) will open the PR.
- **`typescript`**: no bump, already on the latest version (7.0.2). `7.1.0` is in beta.

### Round 2 — CAL-DEP-1 to 3 (2026-11-18)

- **Hydration error on `/contacts`**: `VirtualizedList`'s server HTML shows `DataState`'s spinner while the client hydrates with the contacts list. Already on `main` before the upgrade, so not fixed here.
- **Router warning on `sign-in`**: `src/routes/sign-in/index.tsx` exports `SignInPage`, which `$.tsx` imports, so TanStack Router warns that it cannot code-split it. Moving the component to `src/components/` fixes it. Not done because it's not a dependency change.
- **Rust React Compiler**: `@vitejs/plugin-react` 6 has `compiler: true` (`oxc-transform-react`), which would drop `@rolldown/plugin-babel` and `@babel/core`. Not used because it is still experimental.
- **`prettier` in `dependencies`**: it's a dev tool but sits in `dependencies`. Not moved, out of scope.

### Round 3 — CAL-DEP-4 (2026-11-18)

- **Simplifying `runEffect` / `runAndExpectFailure`**: on Effect 4.1.4, `Effect.runPromise` rejects with the original typed error and with the original defect, so both helpers could become `Effect.runPromise` (or `Effect.flip` for the test helper). Not done here: the ticket keeps `runEffect`'s structure and the change touches every composition root.
- **Shared "find one or none" helper**: the `Effect.tryPromise(...).pipe(Effect.map(Option.fromNullishOr), Effect.map(Option.map(toX)))` shape is written by hand in 8 adapter methods, so this upgrade had to rename each one. A `findOptional(query, mapper)` helper in `src/effect/` would make the next API change a one-line edit. Not done because it's a refactor, not a dependency change.
- **Browser console check**: pages and read-only tRPC queries were checked with `curl` (all 200, clean server log); no headless browser is installed, so client console errors were not checked.

### Round 4 — CAL-DEP-5 (2026-11-19)

- **Repo settings**: Dependabot alerts and security updates must be enabled in GitHub (Settings → Code security) by a repo admin; can't be done from the repo files.
- **First Dependabot run**: only happens after `.github/dependabot.yml` is on `main`; its PRs still need checking.
- **`VITE_CLERK_PUBLISHABLE_KEY` on Dependabot PRs**: the build step reads it from `vars`; if the first Dependabot PR fails there, the variable must be made available to Dependabot runs.
- **`allowScripts` pins**: `package.json` allows install scripts per exact version (`prisma@`, `@prisma/engines@`, `workerd@`, `esbuild@`). Dependabot does not edit them, so a PR that bumps one of these packages needs the matching entry updated by hand before merge.

## Questions for UX and future evolutions

1. Now that CI checks Dependabot PRs, should the weekly `minor-and-patch` group be auto-merged when CI is green?
2. Should Dependabot also bump the GitHub Actions in `ci.yml` (`actions/checkout@v4`, `actions/setup-node@v4`) with a `github-actions` entry?
