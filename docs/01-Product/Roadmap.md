# Product Roadmap

I am treating the application as a sequence of stable milestones. The purpose
of this order is to avoid building real-time behavior on top of unresolved
retry, unread, and cache behavior.

## Phase 0: trustworthy baseline

**Status:** Completed on July 29, 2026. See the
[Phase 0 report](../06-Engineering/Phase-0-Report.md).

### Work

- Pin a TypeScript version compatible with Next.js and `typescript-eslint`.
- Document the supported Node and pnpm versions.
- Add `.env.example` without secrets.
- Add test infrastructure.
- Add the first critical service tests.

### Exit criteria

- `pnpm lint` passes.
- `pnpm exec tsc --noEmit` passes.
- tests pass.
- `pnpm build` passes.
- installation is reproducible.

The first suite tests the real registration and message-send services while
mocking authentication, hashing, and persistence boundaries. A dedicated
PostgreSQL integration suite remains a later testing expansion and must use an
isolated test database.

## Phase 1: design system and application shell

**Status:** Completed on July 29, 2026. See the
[Phase 1 report](../06-Engineering/Phase-1-Report.md).

### Work

- Created semantic colors, spacing, type, borders, radius, and focus tokens.
- Added reusable shadcn/ui primitives styled with Tailwind CSS.
- Added a shared authenticated product layout.
- Made the inbox the main authenticated workspace.
- Added a desktop split pane and mobile navigation behavior.
- Added global and protected loading, error, and not-found boundaries.

### Exit criteria

- All current features have a clear location.
- The shell works from 360 px mobile to large desktop.
- Focus states and keyboard order work.

The shell and inbox were checked in a real browser at 360 px and 1440 px.
Phase 1 does not redesign the message bubbles or composer; those remain the
first work in Phase 2.

## Phase 2: inbox and conversation UI

**Status:** Completed on July 29, 2026. See the
[Phase 2 report](../06-Engineering/Phase-2-Report.md).

### Work

- Redesigned conversation rows and inbox states.
- Added a conversation header and participant profile affordance.
- Built incoming and outgoing message bubbles.
- Added timestamps, day separators, grouping, skeletons, and retry feedback.
- Replaced the test input with an auto-growing composer.
- Added scroll anchoring and jump-to-latest behavior.

### Exit criteria

- The full messaging workflow feels complete over HTTP.
- No raw IDs, enum values, or test-only labels remain.
- Loading, empty, error, and success states are designed.

The conversation workflow was checked in Chromium at 360 px and desktop
sizes. Optimistic, failed, pagination, long-content, and keyboard-composer
behavior were verified.

## Phase 3: remaining pages

**Status:** Completed on July 29, 2026. See the
[Phase 3 report](../06-Engineering/Phase-3-Report.md).

### Work

- Redesigned login, registration, and the public landing page.
- Moved discovery into a complete new-chat workspace.
- Connected search cursor pagination.
- Redesigned public profiles and profile settings.
- Refreshed session profile data after edits.
- Standardized avatar preview and fallback behavior.
- Rebuilt the design system as a premium dark Relay theme.

### Exit criteria

- No temporary presentation page remains.
- Forms preserve useful values and display server errors accurately.
- Every image has a safe fallback.

The landing, authentication, inbox, search, profile, and settings experiences
were checked in Chromium at desktop and 360 px. Search loaded all 22 seeded
matching profiles without duplication, and profile updates refreshed the
active session immediately.

## Phase 4: behavior and edge-case hardening

**Status:** Completed on July 29, 2026. See the
[Phase 4 report](../06-Engineering/Phase-4-Report.md).

### Work

- Added a client message ID and sender-scoped database uniqueness.
- Made concurrent pending sends update only their own cached message.
- Added persistent failed-message retry and remove actions.
- Preserved drafts per conversation in browser storage.
- Reconciled the active conversation's unread cache immediately.
- Enforced either block direction at send time.
- Added strict route schemas and malformed-JSON handling.
- Added the message-history composite index.

### Exit criteria

- Slow, failed, repeated, and concurrent sends behave predictably.
- Automatic retry cannot duplicate a message.
- HTTP and real-time results can be deduplicated.

All exit criteria are satisfied for the HTTP workflow and now feed the
completed Phase 5 real-time convergence path.

## Phase 5: real-time delivery

**Status:** Completed on August 7, 2026. See the
[real-time delivery report](../06-Engineering/Realtime-Delivery-Report.md).

### Work

- Authenticate real-time connections.
- Authorize conversation subscriptions.
- Publish events after database transactions commit.
- Merge and deduplicate message events.
- Reconnect with backoff and refetch missed state.
- Add read events.
- Consider typing and presence only after message delivery is stable.

### Exit criteria

- Two sessions exchange messages without manual refresh.
- Reconnection loses and duplicates no messages.
- Unauthorized subscriptions fail.
- unread/read state converges across clients.

The completed implementation uses authenticated Server-Sent Events backed by
a durable PostgreSQL event log. This fits the existing Vercel serverless
deployment while preserving the planned authorization, reconnection,
deduplication, and source-of-truth rules. Typing and presence remain deferred.

## Phase 6: production readiness

**Status:** Completed on July 29, 2026. See the
[Phase 6 report](../06-Engineering/Phase-6-Report.md).

- Added Playwright desktop/mobile flows and axe-core accessibility checks.
- Captured real seeded application screenshots.
- Profiled the message-history query and verified its composite index.
- Added database-backed rate limiting, security headers, CSP, request IDs,
  structured logs, and a health endpoint.
- Defined Vercel deployment, migration, rollback, backup, and smoke checks.
- Expanded the deterministic seed for every implemented feature boundary.
- Audited unused files/dependencies and removed confirmed dead code.
- Deployed the application and documented the live demo.

## Standalone blocking feature

**Status:** Completed on August 7, 2026. See the
[blocking feature report](../06-Engineering/Blocking-Feature-Report.md).

- Added standalone blocking services, schemas, types, actions, hooks, and UI.
- Added authenticated list, status, block, and unblock API contracts.
- Added profile/thread controls and blocked-account settings.
- Reconciled block state with discovery and composer availability.
- Added mutation rate limiting and service coverage.

## Ownership

I built the data, services, API, client state, complete presentation,
behavioral hardening, production-readiness work, and real-time delivery layer.
