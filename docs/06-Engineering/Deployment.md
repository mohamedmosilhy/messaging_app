# Deployment

## Production

Relay is deployed to Vercel:

**https://relay-messaging-app.vercel.app**

The linked Vercel project is `relay-messaging-app` under the project author's
team. PostgreSQL is provided through a serverless pooled connection suitable
for Vercel functions.

## Runtime requirements

- Node.js 24.x on Vercel;
- pnpm from the committed `packageManager` field;
- PostgreSQL;
- `DATABASE_URL`;
- `AUTH_SECRET`;
- production `AUTH_URL`;
- optional `HASHING_SALT`, defaulting to `10`.

Real-time delivery is same-origin and uses the existing database/session
configuration; it adds no external provider secret.

The root `.env.example` contains safe local placeholders. Real values belong in
Vercel environment settings and must never be committed.

## Quality gate

Run before release:

```bash
pnpm install --frozen-lockfile
pnpm db:generate
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

End-to-end tests must target an isolated or disposable database. The
`test:e2e:seeded` command deliberately resets its configured database.

## Database release

Production migrations are applied explicitly:

```bash
DATABASE_URL="production-connection" pnpm db:deploy
```

`prisma migrate deploy` applies committed migrations without creating
development migrations or requiring a shadow database.

Release order:

1. confirm a recent provider backup;
2. review the committed migration SQL;
3. apply backward-compatible migrations;
4. deploy compatible application code;
5. call `/api/health`;
6. test login, inbox, history, search, and sending;
7. monitor correlated logs and database health.

The destructive seed is used for the public demo only when a reset is intended.
It must never run against valuable production data.

## Vercel deployment

The repository is connected to the Vercel project. A manual production release
uses:

```bash
vercel --prod
```

Vercel builds the local source and runs Prisma generation as the first step of
the build command. Keeping generation in `build` makes fresh and cache-restored
deployments deterministic even when the package manager skips `postinstall`
for an unchanged dependency tree. Migrations remain an explicit operation;
they are not hidden inside every preview build.

## Health and observability

`GET /api/health` verifies that the function can reach PostgreSQL and returns
`Cache-Control: no-store`.

The request proxy supplies an `x-request-id`. Unexpected route failures produce
structured JSON logs with:

- timestamp;
- severity;
- event name;
- request ID;
- non-sensitive error classification.

Production logs intentionally omit raw error messages that may contain
infrastructure details. Vercel runtime logs and function metrics provide the
current monitoring surface.

## Security at the edge

Every response receives:

- Content Security Policy;
- HSTS in production;
- `X-Content-Type-Options: nosniff`;
- `X-Frame-Options: DENY`;
- strict referrer policy;
- restricted browser feature permissions.

Sensitive operations also use PostgreSQL-backed fixed-window limits, so limits
remain shared across serverless instances.

## Smoke checklist

- `/api/health` returns `200` and `status: ok`;
- landing page and static assets return successfully;
- demo credentials authenticate;
- authenticated landing actions replace sign-in actions;
- inbox and long history load;
- message creation updates the thread and inbox;
- profile/thread block controls and blocked-account settings load;
- profile settings Save/Reset controls are visible;
- response security headers are present;
- invalid credentials and malformed payloads do not leak internal details.

## Rollback

Application and schema rollback are separate:

- promote the last known-good Vercel deployment for application rollback;
- prefer additive/backward-compatible migrations so the prior build still
  works;
- do not reverse a destructive migration without a tested data-recovery plan;
- restore provider backups only after identifying the affected time window and
  expected data loss.

## Backups

The database provider owns scheduled backup/PITR capabilities. Before a
high-risk migration:

1. verify backup freshness;
2. record the restore point;
3. rehearse restore in a non-production project;
4. retain migration and deployment identifiers;
5. confirm application smoke tests against restored data.

## Scaling notes

- Prisma Client is reused during local hot reload.
- The production database connection must be pooled.
- Message history uses the composite cursor index.
- Database-backed rate limits work across instances.
- Inbox pagination remains future scaling/product work.
- Authenticated SSE uses durable PostgreSQL deliveries for reconnect recovery
  and multi-instance distribution.
- The current database-backed stream is appropriate for the demo scale; move
  the same contracts to dedicated pub/sub infrastructure before high fan-out.
