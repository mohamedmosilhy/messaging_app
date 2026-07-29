# Testing Strategy

## Current status

The repository currently has no automated test suite or test scripts. The seed
data is thoughtfully designed for manual testing, but it does not replace
repeatable assertions.

## Testing layers

### Unit tests

Useful for:

- Zod schemas;
- error formatting;
- URL and date helpers;
- message grouping;
- reducer/state-machine behavior;
- query-cache updater functions extracted from hooks.

### Service integration tests

Use a dedicated PostgreSQL test database. Highest-priority cases:

- registration normalization and duplicate races;
- credential verification;
- profile validation;
- search self/block exclusions and pagination;
- direct conversation uniqueness under concurrent opens;
- participant-only access;
- equal-timestamp message pagination;
- send trimming and limits;
- send transaction metadata/unread updates;
- send rejection after a block;
- idempotent retry;
- read marker/count behavior.

### Component/hook tests

- form field and general errors;
- debounced search states;
- optimistic insert and replacement;
- concurrent mutations resolving out of order;
- failed-message retry;
- draft clear/restore;
- inbox update and unread reconciliation;
- composer keyboard behavior;
- accessible labels and status announcements.

### End-to-end tests

1. Register, login, edit profile, and logout.
2. Search for a user and open a new thread.
3. Open an existing long conversation and load older pages.
4. Send on a slow connection and observe state.
5. Fail and retry without duplicates.
6. Verify unread behavior using two sessions.
7. Verify desktop and mobile navigation.
8. Verify keyboard-only critical flows.

## Test data

- Never run destructive seed code against valuable data.
- Give tests isolated users and deterministic timestamps.
- Reset or transactionally isolate test state.
- Test missing avatar/bio and maximum-length values.
- Include equal timestamps and simultaneous requests.

## CI quality gate

Recommended order:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm exec tsc --noEmit
pnpm test
pnpm build
```

Run integration and end-to-end suites with a dedicated disposable database.

## Current tooling blocker

On July 29, 2026:

- TypeScript `7.0.2` was installed;
- typecheck passed;
- ESLint crashed because installed TypeScript ESLint packages reject that
  version;
- peer checks reported the incompatibility;
- Next.js compiled, then failed in its type stage.

Pin a mutually supported TypeScript version before treating lint/build failures
as application failures.
