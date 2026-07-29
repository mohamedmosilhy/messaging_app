# Deployment

## Current status

The project is not documented as a production deployment yet. The UI remains a
test presentation, automated tests are absent, and the current TypeScript
version blocks trustworthy lint/build verification.

## Runtime requirements

- supported Node.js version;
- pnpm version matching the lockfile workflow;
- PostgreSQL;
- production `DATABASE_URL`;
- Auth.js secret configuration;
- optional hashing cost configuration.

Create `.env.example` with names and safe descriptions, never real values.

## Build gate

Do not deploy until these pass from a clean install:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm exec tsc --noEmit
pnpm test
pnpm build
```

## Database process

1. Back up production.
2. Review generated migration SQL.
3. Test migration against staging data.
4. Apply migrations through the deployment workflow.
5. Deploy code compatible with the resulting schema.
6. Run smoke checks.
7. Monitor errors and query performance.

Never run the destructive development seed in production.

## Release checklist

- Environment validation succeeds.
- Auth callbacks and public URL are configured.
- Database connectivity and pooling are correct.
- Migrations are applied exactly once.
- Health/readiness endpoint exists.
- Security headers and rate limits are enabled.
- Logs and error monitoring redact sensitive data.
- Backup and rollback paths are known.
- Core login/search/send flows pass smoke testing.

## Observability

Add:

- structured application logs;
- request/correlation IDs;
- error monitoring;
- database latency/error metrics;
- message send success/failure metrics;
- real-time connection/reconnect metrics later.

## Rollback

Application rollback and schema rollback are different. Prefer backward-
compatible migrations so the previous application version can still run.
Destructive migrations require a specific data migration and recovery plan.

## Scaling considerations

- development-safe/production-appropriate Prisma client and connection pooling;
- composite message-history index;
- inbox pagination;
- search query/index measurement;
- rate limiting in shared infrastructure;
- sticky/shared real-time infrastructure if multiple instances are introduced.
