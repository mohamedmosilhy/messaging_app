# Phase 4 Implementation Report

Completed on July 29, 2026.

## Outcome

Phase 4 hardens the existing HTTP message workflow without changing the
project's layer boundaries. Sending is now safe across overlapping mutations
and repeated requests, failures remain actionable, drafts belong to the correct
conversation, blocked pairs cannot use an old thread to bypass restrictions,
and transport inputs are validated before services run.

The profile-settings action area was also fixed. Its Save/Reset controls now
sit in a sticky, fully visible footer inside the form, with extra page-bottom
space for short screens and mobile safe areas.

## Message identity and idempotency

`Message` now stores a required `clientId`. The browser creates a UUID before
sending and the API requires it in the POST body.

The database enforces:

```prisma
@@unique([senderId, clientId])
```

The scope is per sender because client-generated identities belong to a
sender's outbox. The service first looks for an existing row and returns it
when the conversation matches. It also catches a concurrent unique-key race
and returns the row committed by the winning request. Reusing a client ID in a
different conversation is rejected as validation failure.

The migration safely backfills existing messages with their already-unique
server IDs before making `clientId` required.

## Concurrent optimistic sends

The old hook stored and restored the complete infinite-query snapshot. That
could erase a later mutation when an earlier request failed.

The new hook:

- inserts each message with its own client ID and `sending` state;
- allows the composer to submit again while other sends are pending;
- replaces only the matching message on success;
- marks only the matching message on failure;
- ignores an older success when updating a newer inbox preview;
- deduplicates a server row already present in the cache.

This targeted cache model is ready to be reused by Phase 5 socket events.

## Failed-message outbox behavior

A failed optimistic message remains in the timeline with its error state.
Users can:

- retry with the original client ID;
- remove the failed local message;
- continue sending other messages independently.

Retry is safe even when the first request committed but its response was lost,
because the service and database treat the repeated client ID idempotently.

## Per-conversation drafts

`useConversationDraft` stores unsent text in browser storage using:

```text
relay:draft:<conversationId>
```

The hook uses `useSyncExternalStore`, so navigation restores the correct draft
and another tab can publish a storage change. Submitted text is cleared
immediately because its optimistic or failed bubble becomes the recoverable
state.

## Unread reconciliation

Opening a conversation immediately sets its cached inbox unread count to zero.
The existing conversation service remains authoritative and persists the same
reset. This removes the visible stale badge without pretending the current
counter model solves multi-device reads.

Phase 5 still needs a stable last-read marker and real-time read event.

## Block enforcement

The send service now checks both relationships after participant authorization:

```text
current user -> blocks other participant
other participant -> blocks current user
```

Either result produces a forbidden error before the transaction begins. This
closes the previous gap where an existing conversation could bypass a block
applied after the thread was created.

## Transport validation

Application-owned route inputs now have transport validation:

- conversation and target-user path/body IDs;
- strict open-conversation body;
- strict send body with UUID client ID and 1–1,000 character content;
- message limit and paired cursor fields;
- user-search query, limit, and cursor;
- registration and profile-edit bodies.

Malformed JSON is translated into a validation error instead of reaching the
generic internal-error path.

Auth.js owns and validates its own catch-all route.

## Database history index

The old `Message(conversationId)` index was replaced with:

```prisma
@@index([conversationId, createdAt, id])
```

It matches the history query's conversation filter and stable
`createdAt`/`id` cursor order. The migration was successfully applied to the
development PostgreSQL database.

## Files and layer ownership

- Prisma schema/migration: persistent identity and query index.
- Messaging service: idempotency, block rule, and transaction recovery.
- API schemas/routes: transport parsing and validation.
- React Query hook: optimistic lifecycle and cache reconciliation.
- Draft hook: browser-owned unsent text.
- Message components: delivery state and retry/remove controls.
- Conversation container: unread cache reconciliation.

No WebSocket behavior was added in this phase.

## Automated verification

At completion:

- `pnpm db:generate` passed;
- the Phase 4 migration applied successfully;
- `pnpm typecheck` passed;
- `pnpm lint` passed with zero warnings;
- `pnpm test` passed: 8 tests across 2 files;
- `pnpm build` passed.

The send-service tests now cover:

- transactional creation and metadata/unread updates;
- trimming, empty text, and length limits;
- idempotent return for a repeated client ID;
- send rejection when a block exists.

## Remaining recommendations

These are outside Phase 4:

- add isolated PostgreSQL integration tests for unique-key races;
- add automated component tests for out-of-order optimistic resolution;
- add browser E2E coverage;
- implement stable read markers before multi-client real-time reads;
- add block/unblock commands and UI;
- add rate limiting and structured production observability.

## Phase 5 handoff

The durable send command is ready to remain HTTP-first while WebSockets publish
committed `message.created` events. Socket handling should reuse the same
message DTO and merge by `clientId`/server ID, authorize every subscription,
and refetch after reconnect.
