# Current Implementation Status

Reviewed against the repository on August 7, 2026.

## Complete enough for the current MVP foundation

- Prisma schema and migrations.
- Realistic seed data.
- Credentials authentication and JWT session.
- Registration and login validation.
- Current/public profile reads.
- Profile edit service and form.
- Debounced user search service/API/UI.
- Direct conversation open/create with race protection.
- Participant authorization.
- Inbox retrieval.
- Message history cursor pagination.
- Transactional message sending.
- Unread count persistence.
- React Query caches and infinite history.
- First optimistic message workflow.
- Direct inbox cache update after successful send.
- Sender-scoped message idempotency.
- Concurrent pending sends with targeted failure state.
- Failed-message retry/remove actions.
- Per-conversation draft persistence.
- Immediate unread-cache reconciliation.
- Strict transport validation and malformed-JSON handling.
- Send-time block enforcement.
- Standalone block/unblock services and authenticated APIs.
- Privacy-safe block relationship status and mutation rate limiting.
- Profile and conversation block controls.
- Blocked-account settings and React Query reconciliation.
- Database-backed rate limits for sensitive and high-volume operations.
- Correlated structured API errors and a database health endpoint.
- CSP, HSTS in production, and defensive browser headers.
- Playwright desktop/mobile and axe-core accessibility coverage.
- Vercel production deployment.

## Presentation status

Phases 1 through 3 are complete. The application now has a premium dark
Tailwind design system, shadcn/ui primitives, a public landing page, complete
authentication presentation, authenticated shell, responsive inbox,
conversation UI, paginated discovery, public profiles, and profile settings.
The landing page recognizes an active server session and exposes direct
dashboard access without showing sign-in or registration actions.

The application also has an original Relay favicon.

## Partial areas

- unread counters without real-time/multi-device read markers;
- group enum without group behavior;
- profile email/username editing is intentionally unavailable.

## Known correctness/tooling items

- Conversation detail GET performs an unread-state write.
- Full database integration coverage remains smaller than the service and
  browser suites.

## Verification performed

- TypeScript was pinned to compatible version `6.0.3`.
- `pnpm lint`: passed with zero warnings.
- `pnpm typecheck`: passed.
- `pnpm test`: sixteen tests passed.
- Playwright covers the critical flow on desktop and mobile.
- axe-core reports no critical or serious violations on covered screens.
- `pnpm peers check`: passed.
- `pnpm build`: passed and generated all application routes.
- responsive browser checks passed at 360 px and 1440 px without horizontal
  overflow.
- the mobile navigation drawer and desktop conversation split pane were checked
  in Chromium.
- message pagination preserved its visual anchor exactly.
- optimistic, success, send-failure, multiline, length-limit, and draft
  preservation behavior were checked in Chromium.
- the Relay favicon returned successfully through Next.js metadata routing.
- all 22 seeded matching search profiles loaded across three cursor pages
  without duplicates.
- profile form success retained values and refreshed the Auth.js session and
  navigation identity.
- landing, authentication, discovery, public profile, settings, inbox, and
  360 px mobile views were checked in the premium dark theme.
- The registration email-conflict field mapping was fixed and tested.
- Node and pnpm expectations, environment template, and Prisma generation are
  now reproducible.

## Next recommended action

The standalone blocking feature is complete; review its
[implementation report](../06-Engineering/Blocking-Feature-Report.md). Phase 5
remains available for the project author to implement WebSocket delivery and
stable multi-client read markers as a learning exercise.
