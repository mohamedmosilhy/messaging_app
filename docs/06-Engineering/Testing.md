# Testing Strategy

## Current status

Vitest is configured for Node-based service tests. The first suite contains six
tests for registration and message sending. Authentication, hashing, participant
lookup, and Prisma boundaries are mocked so the normal test command never
modifies a developer database.

Current scripts:

```bash
pnpm test
pnpm test:watch
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

## Phase 0 verification

On July 29, 2026, TypeScript was pinned from incompatible `7.0.2` to `6.0.3`.
After that change:

- ESLint passed with zero warnings;
- TypeScript passed;
- all six tests passed;
- peer-dependency validation passed;
- the Next.js production build passed.

The current tests are service tests with mocked infrastructure boundaries. The
next testing expansion should add a dedicated PostgreSQL integration database
for transaction, constraint, and concurrency behavior.
