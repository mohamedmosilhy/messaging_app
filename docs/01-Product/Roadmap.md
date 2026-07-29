# Product Roadmap

I am treating the application as a sequence of stable milestones. The purpose
of this order is to avoid building real-time behavior on top of unresolved
retry, unread, and cache behavior.

## Phase 0: trustworthy baseline

### Work

- Pin a TypeScript version compatible with Next.js and `typescript-eslint`.
- Document the supported Node and pnpm versions.
- Add `.env.example` without secrets.
- Add test infrastructure.
- Add the first service integration tests.

### Exit criteria

- `pnpm lint` passes.
- `pnpm exec tsc --noEmit` passes.
- tests pass.
- `pnpm build` passes.
- installation is reproducible.

## Phase 1: design system and application shell

### Work

- Create semantic colors, spacing, type, borders, shadows, and focus tokens.
- Build reusable UI primitives.
- Add a shared protected layout.
- Make the inbox the main authenticated workspace.
- Create desktop split-pane and mobile navigation behavior.
- Add global loading, error, and not-found boundaries.

### Exit criteria

- All current features have a clear location.
- The shell works from 360 px mobile to large desktop.
- Focus states and keyboard order work.

## Phase 2: inbox and conversation UI

### Work

- Redesign conversation rows and inbox states.
- Add conversation header and participant details affordance.
- Build incoming/outgoing message bubbles.
- Add timestamps, day separators, grouping, skeletons, and retry states.
- Replace the input with an auto-growing composer.
- Add scroll anchoring and jump-to-latest behavior.

### Exit criteria

- The full messaging workflow feels complete over HTTP.
- No raw IDs, enum values, or test-only labels remain.
- Loading, empty, error, and success states are designed.

## Phase 3: remaining pages

### Work

- Redesign login and registration.
- Move discovery into a new-chat panel.
- Connect search cursor pagination.
- Redesign profiles and settings.
- Refresh session profile data after edits.
- Standardize avatar behavior.

### Exit criteria

- No temporary presentation page remains.
- Forms preserve useful values and display server errors accurately.
- Every image has a safe fallback.

## Phase 4: behavior and edge-case hardening

### Work

- Add a client message ID and server idempotency constraint.
- Support multiple pending sends safely.
- Add failed-message retry/remove behavior.
- Preserve per-conversation drafts.
- Reconcile unread cache state.
- Enforce blocks while sending.
- Validate all route inputs consistently.
- Add the message-history composite index.

### Exit criteria

- Slow, failed, repeated, and concurrent sends behave predictably.
- Automatic retry cannot duplicate a message.
- HTTP and future socket results can be deduplicated.

## Phase 5: real-time delivery

### Work

- Authenticate socket connections.
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

## Phase 6: production readiness

- Complete accessibility and browser testing.
- Profile large threads and inboxes.
- Add rate limiting, headers, CSP, structured logs, and monitoring.
- Define deployment, migration, rollback, and backup processes.
- Expand automated end-to-end coverage.

## Ownership

I have already built the data, service, API, client-state, and first optimistic
foundations. The planned UI pass should replace the presentation layer and make
the focused behavioral improvements described above. Real-time delivery is the
next feature I plan to build after that interface and HTTP behavior are stable.
