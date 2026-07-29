# Phase 6 Implementation Report

Completed on July 29, 2026.

## Outcome

Phase 6 turns the completed HTTP messaging product into a deployable,
observable, tested application while leaving Phase 5 WebSocket delivery
untouched for the project author's practice.

The work covers:

- production security boundaries;
- request correlation and structured logs;
- serverless-safe rate limiting;
- database/runtime health;
- query profiling;
- deterministic feature-complete seed data;
- desktop/mobile browser and accessibility coverage;
- real documentation screenshots;
- dead-code and dependency cleanup;
- professional repository documentation;
- Vercel and serverless PostgreSQL deployment.

## Security hardening

### Shared rate limiting

`RateLimitBucket` stores fixed-window counters in PostgreSQL. This matters on
Vercel because separate function instances cannot share an in-memory map.

Implemented scopes:

| Scope             |                              Limit |
| ----------------- | ---------------------------------: |
| Authentication    | 10 per client/email per 15 minutes |
| Registration      |        5 per client/email per hour |
| User search       |             60 per user per minute |
| Open conversation |             30 per user per minute |
| Send message      |             60 per user per minute |
| Message history   |            120 per user per minute |

Identifiers are SHA-256 hashed before storage. New fixed windows clean expired
buckets. `429` responses provide `Retry-After`.

### Authentication timing

Credential verification now performs a bcrypt comparison against a fixed dummy
hash when the email does not exist. Missing and invalid accounts therefore take
the same expensive comparison path and return the same public result.

### Browser policy

Next.js response configuration now supplies:

- Content Security Policy;
- HSTS in production;
- MIME sniffing protection;
- clickjacking protection;
- strict referrer policy;
- disabled camera, microphone, geolocation, payment, and USB permissions.

The framework identity header is disabled.

## Error handling and observability

The previous route handlers repeated slightly different catch blocks. They now
share `routeErrorResponse`.

`proxy.ts` creates or forwards `x-request-id`. API error bodies include that
identifier, so a user-visible failure can be matched to one server event.

Unexpected failures emit structured JSON with:

- timestamp;
- severity;
- event;
- request ID;
- safe error classification.

Production logs omit raw exception messages. Domain/validation failures remain
user-safe and are not treated as operational crashes.

`GET /api/health` performs a PostgreSQL connectivity check and disables caching.

## Persistence and runtime

- Prisma Client is reused through `globalThis` during development hot reload.
- Missing `DATABASE_URL` fails with a clear startup error.
- The Phase 6 migration introduces shared rate-limit storage and an expiry
  index.
- Production migrations remain explicit through `pnpm db:deploy`.

## Performance review

The message-history query was measured with `EXPLAIN (ANALYZE, BUFFERS)` against
the seeded three-page thread.

PostgreSQL selected:

```text
Index Only Scan Backward
using Message_conversationId_createdAt_id_idx
```

The representative 21-row query used three shared-buffer hits, required zero
heap fetches, and completed in approximately 0.05 ms locally. This verifies
that the composite index matches the filter and stable cursor order. It does
not replace production-scale query monitoring.

## Accessibility

The root layout now includes a keyboard-visible skip link with stable main
targets across public, authenticated, error, and not-found layouts.

The first axe-core run found an invalid `aria-label` on the conversation-list
loading container. Adding an appropriate status role fixed the violation.

Playwright checks covered public, inbox, and profile settings surfaces with no
critical or serious axe violations.

## Browser coverage

Playwright runs Chromium using:

- desktop Chrome dimensions;
- Pixel 7 mobile emulation.

Covered behavior:

- public landing and sign-in;
- signed-in landing actions;
- inbox rendering;
- long history pagination until the first message;
- profile Save button visibility and viewport placement;
- critical/serious accessibility violations.

Failure artifacts include screenshot, trace, and video.

## Complete seed

The deterministic seed now creates:

- 36 fictional users;
- 12 direct conversations;
- 104 messages;
- two login-ready accounts;
- a thread spanning three API pages;
- equal timestamps for cursor tie-breaking;
- an empty conversation;
- a 1,000-character message;
- unread badges of 1, 2, and 3;
- avatar/bio fallbacks;
- 22 matching `alex` search profiles;
- a discoverable user without an existing thread;
- both block directions;
- client IDs for every stored message.

The seed also clears rate-limit state. It is intentionally destructive and
must target disposable development, test, or demo data.

## Screenshots

Real screenshots are stored in `docs/assets/screenshots`:

- landing;
- inbox with unread states;
- active long conversation;
- profile settings with visible Save/Reset actions.

They are generated by the same Playwright browser used for E2E verification.

## Cleanup and refactoring

The repository was audited with Knip plus import/search verification.

Removed:

- the obsolete pure-CSS `SignoutButton`;
- empty feature API directories left over from the earlier folder layout;
- the unused Auth.js Prisma adapter dependency;
- the unused TanStack ESLint plugin dependency;
- the unnecessary direct PostgreSQL type dependency;
- the empty root `public` directory;
- generated browser-test artifacts and operating-system metadata.

Retained intentionally:

- shadcn/ui primitive exports that form the local component library;
- Prisma runtime and PostgreSQL packages required indirectly by generated
  Prisma code and the PG adapter;
- historical phase reports and committed migrations.

## Deployment

The project is linked to:

```text
mohamedmosilhys-projects/relay-messaging-app
```

Production:

**https://relay-messaging-app.vercel.app**

Deployment `dpl_GpiUKApMrjH7BAjcUsJn98dcYnRL` reached Ready. The application
uses Vercel, a free Prisma Postgres resource in `fra1`, a pooled serverless
connection, explicit Prisma migrations, Auth.js production secrets, and
post-deployment health and authentication smoke checks.

## Verification gates

At completion:

- Prisma generation passed;
- all migrations applied;
- seed completed;
- Prettier passed;
- ESLint passed;
- TypeScript passed;
- 10 Vitest tests passed;
- Playwright desktop/mobile flows passed;
- axe-core critical/serious checks passed;
- production build passed;
- local and deployed health checks passed;
- Vercel production deployment reached Ready.

## Remaining work

Deliberately outside Phase 6:

- Phase 5 WebSocket delivery and reconnect behavior;
- stable multi-client read markers;
- block/unblock product controls;
- database integration tests for transaction races;
- dedicated monitoring/alerting vendor;
- inbox pagination at larger scale.

The HTTP send service, client message IDs, idempotency constraint, and cache
reconciliation are ready to support the author's Phase 5 implementation.
