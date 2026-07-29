# Phase 0 Implementation Report

Completed: July 29, 2026

## Outcome

Phase 0 is complete. The project now has a compatible, reproducible tooling
baseline; a safe environment template; automatic Prisma Client generation; and
the first automated service test suite. Lint, typecheck, tests, peer checks, and
the Next.js production build all pass.

## Scope completed

### Toolchain compatibility

- Replaced TypeScript `7.0.2` with pinned TypeScript `6.0.3`.
- Added Vitest `4.1.10`.
- Added `packageManager: pnpm@11.17.0`.
- Added package engine declarations:
  - Node.js `^20.9.0 || ^22.0.0 || >=24.0.0`;
  - pnpm `11.17.0`.
- Added `.nvmrc` recommending Node.js `24.11.1`, the version used for the
  verification.
- Regenerated and updated `pnpm-lock.yaml`.
- Confirmed there are no peer-dependency issues.

### Reproducible project scripts

Added:

```json
{
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:watch": "vitest",
  "db:generate": "prisma generate",
  "postinstall": "prisma generate"
}
```

The post-install step ensures the custom generated Prisma Client exists after a
clean dependency installation.

### Environment documentation

Added a tracked `.env.example` containing safe placeholders for:

- `DATABASE_URL`;
- `AUTH_SECRET`;
- `AUTH_URL`;
- `HASHING_SALT`.

Updated `.gitignore` so `.env.example` is committed while real `.env*` files
remain ignored.

### Test infrastructure

Added `vitest.config.ts` with:

- the project `@` alias;
- Node test environment;
- `tests/**/*.test.ts` discovery;
- automatic mock cleanup.

The initial tests call the real service functions and mock their infrastructure
boundaries. They do not connect to or mutate the developer database.

### Registration service tests

Three tests verify:

1. email/username trimming and lowercase normalization;
2. bcrypt cost use and stored user shape;
3. email and username conflict mapping.

The email conflict test exposed an existing bug: an existing email was returned
under the `username` field. The service now returns the error under `email`.

### Message-send service tests

Three tests verify:

1. content is trimmed before persistence;
2. message creation, latest-message metadata, and unread increment run through
   one transaction callback;
3. empty and over-1,000-character messages fail before authorization/database
   work.

## Quality cleanup

Once ESLint worked again, it reported six warnings. I removed:

- five unused `catch` bindings;
- one unused messaging type import.

No product behavior was changed by this cleanup.

## Verification results

| Command            | Result                          |
| ------------------ | ------------------------------- |
| `pnpm install`     | Passed; Prisma Client generated |
| `pnpm peers check` | Passed; no peer issues          |
| `pnpm lint`        | Passed; zero warnings           |
| `pnpm typecheck`   | Passed                          |
| `pnpm test`        | Passed; 2 files, 6 tests        |
| `pnpm build`       | Passed                          |

The production build compiled, completed TypeScript checking, generated all 13
static page entries, and finalized successfully.

## Files added

- `.env.example`
- `.nvmrc`
- `vitest.config.ts`
- `tests/services/register.service.test.ts`
- `tests/services/sendMessage.service.test.ts`
- `docs/06-Engineering/Phase-0-Report.md`

## Files updated

- `.gitignore`
- `package.json`
- `pnpm-lock.yaml`
- `app/features/auth/services/register.service.ts`
- five files with unused `catch` cleanup
- `app/features/messaging/hooks/useSendMessage.ts`
- Phase 0/testing/setup/status documentation

## Review notes

The initial suite deliberately mocks infrastructure boundaries. It gives fast,
deterministic coverage of application-service behavior and cannot delete or
modify local database data.

It does not yet replace:

- PostgreSQL integration tests for real constraints and transactions;
- concurrency tests for duplicate conversation creation;
- component/hook tests for optimistic caches;
- browser end-to-end tests.

Those remain documented testing expansions, not blockers for the Phase 0
tooling baseline.

## Suggested review order

1. Review `package.json`, `.nvmrc`, and `.env.example`.
2. Review `vitest.config.ts`.
3. Review both service test files.
4. Review the one behavioral bug fix in `register.service.ts`.
5. Run the verification commands from the table.
