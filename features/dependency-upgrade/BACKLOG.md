# Backlog — Dependency upgrade

## Left out by round

### Round 1 — planning (2026-11-18)

- **`prisma` 8.0**: skipped, it is still a release candidate (`8.0.0-rc.34`). Revisit once 8.0.0 is stable; Dependabot (CAL-DEP-5) will open the PR.
- **`typescript`**: no bump, already on the latest version (7.0.2). `7.1.0` is in beta.
- **Simplifying `runEffect`**: left for after CAL-DEP-4, because it depends on whether Effect 4 still wraps errors in `FiberFailure`.
- **CI workflow**: none exists, so Dependabot PRs get no automatic `tsc` / test / build check. Out of scope for this round.

### Round 2 — CAL-DEP-1 to 3 (2026-11-18)

- **CAL-DEP-4 and CAL-DEP-5**: not started, scope of this round was 1 to 3.
- **Tailwind 4.1 → 4.3 visual check** (CAL-DEP-1): not done, the before/after comparison needed the Tailwind CLI downloaded with `npx`, which was blocked. Pages load with no console errors; screenshots of the week view and the contact form still need a manual look.
- **Clerk sign-in/sign-out and `calendar_access`** (CAL-DEP-2): not checked, dev ran with `VITE_MOCK_AUTH=true`.
- **Hydration error on `/contacts`**: `VirtualizedList`'s server HTML shows `DataState`'s spinner while the client hydrates with the contacts list. Already on `main` before the upgrade, so not fixed here.
- **Router warning on `sign-in`**: `src/routes/sign-in/index.tsx` exports `SignInPage`, which `$.tsx` imports, so TanStack Router warns that it cannot code-split it. Moving the component to `src/components/` fixes it. Not done because it's not a dependency change.
- **Rust React Compiler**: `@vitejs/plugin-react` 6 has `compiler: true` (`oxc-transform-react`), which would drop `@rolldown/plugin-babel` and `@babel/core`. Not used because it is still experimental.
- **`effect` 3.22.4**: a patch is available on 3.x. Left for CAL-DEP-4, which moves to 4.x anyway.
- **`prettier` in `dependencies`**: it's a dev tool but sits in `dependencies`. Not moved, out of scope.

## Questions for UX and future evolutions

1. Should a GitHub Actions CI workflow (`tsc`, `npm test`, `npm run build`) be added so Dependabot PRs are checked automatically, and could patch updates then be auto-merged?
