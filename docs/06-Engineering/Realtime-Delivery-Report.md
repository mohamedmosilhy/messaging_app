# Real-Time Delivery Implementation Report

Completed on August 7, 2026.

## Outcome

Relay now delivers committed messages and read state to authenticated sessions
without manual refresh. The implementation keeps HTTP as the reliable command
and recovery path, and uses Server-Sent Events for notification.

## Why SSE and PostgreSQL

The production target is Vercel. A process-local WebSocket server would not
provide durable connections or cross-instance fan-out there. Relay instead
stores versioned events and per-user deliveries in PostgreSQL and streams them
through an authenticated same-origin SSE route. This requires no new provider
or secret and works across serverless instances.

## Durable event path

The message transaction now:

1. creates the message;
2. updates latest-message metadata;
3. increments recipient unread state;
4. advances the sender's read marker;
5. stores `message.created` and `conversation.updated` with participant
   deliveries.

Database isolation makes events visible only when the whole transaction
commits. Idempotent HTTP retries return the existing message and do not create
duplicate events.

The event log retains a 24-hour recovery window. HTTP inbox/history refetches
remain authoritative after reconnect and cover longer gaps.

## Authentication and authorization

`GET /api/realtime` uses the Auth.js session. Event queries require both:

- a delivery row for the current user;
- current participation in the event conversation.

Clients do not submit arbitrary conversation channel IDs. An inaccessible last
event ID is ignored rather than revealing whether it exists. Connection opens
are database-rate-limited.

## Client convergence

`RealtimeProvider` owns EventSource lifecycle and:

- merges by `clientId` and server message ID;
- keeps a bounded event-ID deduplication set;
- updates active message and inbox caches;
- reconnects with exponential backoff, jitter, and a 30-second cap;
- resumes after the last delivered event ID;
- refetches inbox, conversation, and message queries on connection;
- preserves useful cached data while offline.

Live, Connecting, Reconnecting, and Offline states appear in the shell and
mobile conversation header.

## Read markers

`Participation` now stores `lastReadMessageId` and `lastReadAt`.
`MessageTimeline` reports the latest committed message only while its marker
and the browser document are visible. The read service validates the message,
uses a serializable transaction, never moves the marker backwards, derives
remaining unread messages, and publishes `conversation.read`.

Conversation detail GET is now side-effect free. Other tabs and devices
reconcile read state from the event and authoritative inbox refetch.

## Migration

Migration `20260807210000_realtime_delivery` adds:

- the two participation read-marker columns and foreign key;
- `RealtimeEvent` with conversation/order/expiry indexes;
- `RealtimeEventDelivery` with unique event/user delivery and user index.

The additive migration was applied to both the local development database and
the production Prisma PostgreSQL database. Prisma reported all five repository
migrations applied on each target. No seed or data reset ran.

## Verification

- Prisma schema validation and Client generation pass.
- ESLint and strict TypeScript pass.
- 24 tests across seven files pass.
- Tests cover authorized event filtering, resume cursors, duplicate cache
  delivery, optimistic replacement, inbox deduplication, and monotonic reads.
- The production build passes with both real-time routes.
- Playwright desktop and mobile application suites pass and assert that an
  authenticated SSE connection reaches Live state.

## Deferred work

- typing and presence;
- delivery/read-receipt presentation on individual bubbles;
- dedicated pub/sub infrastructure if traffic outgrows database-backed SSE;
- expanded automated two-browser-session coverage.
