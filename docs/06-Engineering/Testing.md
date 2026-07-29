# Testing Strategy

## Current status

Vitest covers registration, message sending, idempotency, blocks, and the
database-backed rate limiter. Authentication, hashing, participant lookup, and
Prisma boundaries are mocked so the normal unit command never modifies a
developer database.

Playwright covers the public/authenticated flow, session-aware landing page,
inbox, long message history, profile settings action visibility, and
accessibility on desktop and mobile. axe-core checks covered screens for
critical and serious violations.

Current scripts:

```bash
pnpm test
pnpm test:watch
pnpm test:e2e
pnpm test:e2e:seeded
pnpm test:e2e:ui
pnpm screenshots
```

The realistic seed data remains useful for manual exploration, but it does not
replace repeatable assertions.

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

### Implemented end-to-end tests

1. Render the landing page and authenticate with the seeded account.
2. Confirm signed-in landing actions replace authentication actions.
3. Load the inbox on desktop and mobile.
4. Open the long Layla thread and exhaust cursor pages.
5. Confirm profile Save remains in the viewport.
6. Run axe-core against public, inbox, and profile surfaces.

Recommended next expansions:

- intercepted slow/failing message requests and idempotent retry;
- registration and profile mutation;
- two-session unread behavior;
- keyboard-only assertions beyond axe automation.

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
Playwright artifacts are ignored unless a test fails; documentation screenshots
are captured explicitly into `docs/assets/screenshots`.

## Phase 0 verification

On July 29, 2026, TypeScript was pinned from incompatible `7.0.2` to `6.0.3`.
After that change:

- ESLint passed with zero warnings;
- TypeScript passed;
- all six tests passed;
- peer-dependency validation passed;
- the Next.js production build passed.

The service tests still mock infrastructure boundaries. A dedicated PostgreSQL
integration suite remains recommended for transaction, constraint, and
concurrency behavior.
