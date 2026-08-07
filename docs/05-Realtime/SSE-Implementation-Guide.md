# Understanding Relay's Real-Time and SSE Implementation

Last reviewed against the repository: August 8, 2026

## What this feature does

The real-time feature makes a committed message appear in another open browser
without requiring that browser to refresh. It also synchronizes the current
user's unread state between tabs or devices.

The most important idea is:

> HTTP changes the data, PostgreSQL stores the truth, and SSE tells open
> browsers that the truth changed.

SSE does **not** save messages. It does **not** replace the normal message API.
It is the delivery channel used after the server has safely committed a change.

The complete design has four parts:

1. A normal HTTP command creates a message or marks a conversation as read.
2. The same database transaction stores a small real-time event.
3. An authenticated SSE endpoint repeatedly looks for events addressed to the
   current user and sends them down an open HTTP response.
4. The browser receives each event and merges it into the existing React Query
   cache.

## The simplest mental model

Imagine PostgreSQL as a post office:

- `RealtimeEvent` is a letter describing something that happened.
- `RealtimeEventDelivery` is the address label saying who may receive it.
- `/api/realtime` is a postal worker checking for new letters every 750 ms.
- `EventSource` is an open mailbox slot in the browser.
- `lastEventId` is the receipt number of the last letter the browser handled.
- React Query caches are the screen's local copy of the application's data.

The letter is durable for 24 hours. If a connection briefly disappears, the
client can ask for letters after its last receipt. Normal HTTP refetches are
still the final recovery mechanism and source of truth.

## SSE in plain language

Server-Sent Events, or SSE, is a browser standard for receiving a sequence of
events over one HTTP response.

A normal HTTP response works like this:

```text
browser -> request -> server -> one response -> connection finishes
```

An SSE response works like this:

```text
browser -> request -> server -> response stays open
                            -> event 1
                            -> event 2
                            -> keepalive
                            -> event 3
                            -> response eventually closes
```

SSE is one-way: server to browser. The browser still uses `fetch` and normal
POST routes to send commands to the server. That is a good fit here because
message sending and read commands already have reliable, validated HTTP APIs.

SSE uses the `text/event-stream` content type. Each event is plain text, and a
blank line ends one event. Relay sends an event in this shape:

```text
id: 7deff65d-...
event: relay
data: {"eventId":"7deff65d-...","type":"message.created",...}

```

The fields mean:

- `id` is the SSE cursor remembered for reconnection.
- `event` is the browser event name. The client listens for `relay`.
- `data` is a JSON string containing Relay's event envelope.
- the final empty line tells the browser that the event is complete.

The stream also sends:

```text
retry: 1000

: keepalive 1786...

```

`retry` is an SSE reconnection hint. A line beginning with `:` is a comment;
the application ignores it, but it keeps the connection active through
proxies. Relay also implements its own controlled reconnect behavior.

## Why SSE was chosen instead of WebSockets

This application mainly needs server-to-browser notification. It does not need
a permanent two-way socket for message commands. SSE provides:

- a native browser client through `EventSource`;
- ordinary HTTP authentication and deployment behavior;
- automatic streaming event parsing;
- event IDs and reconnection support;
- less infrastructure than a dedicated WebSocket or pub/sub service.

The application is intended for a serverless deployment. A JavaScript array or
an in-process event emitter would belong to only one server instance and would
be erased when that instance stops. PostgreSQL is shared and durable, so any
server instance can find committed events.

The tradeoff is that the SSE route currently polls PostgreSQL every 750 ms.
This is simple and reliable for the current scale, but a high-traffic system
would usually replace polling with a dedicated pub/sub layer.

## Where the code lives

| Responsibility | File |
| --- | --- |
| SSE HTTP stream | `app/api/realtime/route.ts` |
| Create/query durable events | `app/features/realtime/services/realtime-events.service.ts` |
| Event TypeScript contracts | `app/features/realtime/types/realtime.types.ts` |
| Query validation | `app/features/realtime/schemas/realtime.schema.ts` |
| Browser connection and event handling | `app/features/realtime/components/RealtimeProvider.tsx` |
| React Query cache merge helpers | `app/features/realtime/utils/realtime-cache.ts` |
| Connection status UI | `app/features/realtime/components/RealtimeStatus.tsx` |
| Message transaction that publishes events | `app/features/messaging/services/sendMessage.service.ts` |
| Read transaction that publishes an event | `app/features/realtime/services/markConversationRead.service.ts` |
| Read detection in the timeline | `app/features/messaging/components/MessageTimeline.tsx` |
| Read mutation hook | `app/features/realtime/hooks/useMarkConversationRead.ts` |
| Database models | `prisma/schema.prisma` |

## The event contract

Every delivered event uses a common envelope:

```ts
{
  eventId: string;
  type: "message.created" | "conversation.updated" | "conversation.read";
  version: 1;
  occurredAt: string;
  data: ...;
}
```

Why each field exists:

- `eventId`: uniquely identifies the notification. It is used for resuming and
  deduplicating delivery. It is not the message ID.
- `type`: tells the client which handler should process the event.
- `version`: lets a future client distinguish a changed payload format.
- `occurredAt`: gives a stable server timestamp for ordering and diagnosis.
- `data`: contains the type-specific information.

`RealtimeEventDataMap` connects each event name to the correct payload type.
The generic `createRealtimeEvent<Type extends RealtimeEventType>` then makes
TypeScript enforce matching names and data. For example, a
`conversation.read` event cannot accidentally be created with a message
payload.

Dates need special handling. JavaScript `Date` objects cannot travel through
JSON as `Date` instances, so `toRealtimeMessage` converts them to ISO strings.
After parsing the network event, `fromRealtimeMessage` converts them back to
`Date` objects so the real-time message has the same shape as an HTTP message.

## Database design

### `RealtimeEvent`

This table stores what happened:

```text
id              unique event/cursor ID
type            event name
version         payload contract version
conversationId  conversation affected by the event
payload         JSON event-specific data
occurredAt      database creation time
expiresAt       time after which recovery is no longer attempted
```

### `RealtimeEventDelivery`

This table stores who may receive the event:

```text
eventId  -> RealtimeEvent
userId   -> User
```

Its composite primary key is `(eventId, userId)`. That guarantees only one
delivery row per event and user. If a recipient ID accidentally appears twice,
`createRealtimeEvent` also removes duplicates with `new Set(...)` before
inserting rows.

Separating the event from deliveries avoids copying the whole JSON payload for
every participant. One event can have multiple small delivery rows.

Events expire after 24 hours. `deleteExpiredRealtimeEvents()` removes old
events, and cascading foreign keys remove their delivery rows. This is a
recovery window, not permanent message history. The `Message` table remains
the permanent source of truth.

## End-to-end flow: sending a message

Assume Layla sends Omar the text `Hello`.

```text
Layla's browser
  -> POST message command
  -> server transaction
       1. insert Message
       2. update conversation's latest message
       3. increment Omar's unread count
       4. advance Layla's own read marker
       5. insert message.created event + delivery rows
       6. insert conversation.updated event + delivery rows
  -> transaction commits
  -> HTTP response returns the saved message to Layla

Omar's /api/realtime stream
  -> database poll finds Omar's delivery
  -> sends event: relay / type: message.created
  -> Omar's RealtimeProvider parses it
  -> React Query message cache gains the message
  -> inbox preview/order/unread count updates
  -> UI rerenders automatically
```

### Why event creation is inside the message transaction

`sendMessage.service.ts` passes the Prisma transaction client `tx` to
`createRealtimeEvent`.

This prevents two dangerous states:

- the message commits but its event is missing;
- an event becomes visible for a message that later rolls back.

The message, unread changes, and events either all commit or all roll back.
This pattern is commonly called a **transactional outbox**, although here the
event table is also read directly by the delivery route.

### Why there are two send events

`message.created` carries the complete message required by the message list.
`conversation.updated` carries only inbox-preview metadata.

In the current client, `message.created` directly updates both the message
cache and inbox cache. `conversation.updated` is persisted and delivered, but
`RealtimeProvider` does not currently have a separate handler for it. It is
there as an explicit domain event and future extension point; the visible
inbox update currently comes from `message.created` plus refetching.

### Sender-side duplicates and optimistic messages

The sender receives both:

- the HTTP result from sending; and
- the SSE event addressed to all participants, including the sender.

This is intentional. Other tabs belonging to the sender also need the update.
It is safe because `mergeMessageIntoCache` matches either:

- the permanent server message `id`; or
- the client-generated `clientId` used by the optimistic bubble.

If it finds the optimistic version, it replaces it. If it finds the saved
message, it does not add another copy. This property is called
**idempotent handling**: processing the same result again has no harmful extra
effect.

## How the SSE server route works

The route is deliberately dynamic and runs in the Node.js runtime because it
streams bytes and queries Prisma:

```ts
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;
```

The request flow is:

1. `requireCurrentUserId()` authenticates the Auth.js session.
2. `enforceRateLimit(...)` prevents unlimited connection creation.
3. Zod validates optional `since` and `lastEventId` parameters.
4. The route limits an initial `since` lookup to at most five minutes.
5. Expired events are deleted.
6. A `ReadableStream` is returned with SSE headers.
7. For up to 25 seconds, the route queries events every 750 ms.
8. Events are encoded with `TextEncoder` and enqueued into the response.
9. If nothing is found, a keepalive comment is sent.
10. The stream closes, causing the client to establish a fresh connection.

The key response headers are:

- `Content-Type: text/event-stream`: tells the browser to parse SSE frames.
- `Cache-Control: no-cache, no-transform`: prevents stale or transformed
  stream data.
- `Connection: keep-alive`: expresses that the response stays open.
- `X-Accel-Buffering: no`: asks compatible proxies to forward chunks
  immediately instead of collecting them.

The stream lasts 25 seconds even though the platform permits 60 seconds. Short
connections avoid relying on an endless serverless function. Closing is normal,
not proof that real-time failed; the provider reconnects.

`request.signal` becomes aborted when the browser disconnects. The loop and
the custom `wait` function observe it so polling can stop promptly.

## Selecting only the correct user's events

`getRealtimeEventsForUser` requires both of these conditions:

```text
event has a RealtimeEventDelivery for the current user
AND
current user is still a participant in the conversation
```

The first condition says the event was addressed to the user. The second
rechecks present authorization. If the user's access changed after the event
was created, an old delivery row alone is not enough to reveal it.

The client never asks to subscribe to an arbitrary conversation ID. It opens
one private stream for its authenticated user, and the server decides every
event that user can see.

The same rules protect cursor resolution. `resolveCursor` accepts a supplied
event ID only if it is one of this user's authorized deliveries. This avoids
using another user's event as a meaningful cursor and avoids leaking whether
that event exists.

## Ordering and reconnection cursors

Events are ordered by two values:

```text
(occurredAt ascending, id ascending)
```

The ID is a tie-breaker because two rows can have the same timestamp. After a
known cursor, the query means:

```text
occurredAt > cursor.occurredAt
OR
(occurredAt == cursor.occurredAt AND id > cursor.id)
```

This is keyset pagination. It means "strictly after this exact position" and
prevents returning the cursor event again.

There are two ways to begin:

- First connection: the provider sends `since`, currently five seconds before
  it mounted, to cover a small page-load race.
- Reconnection: the provider sends its last processed `eventId` and the server
  resumes strictly after it.

The server reads the standard `Last-Event-ID` header when present and also
supports the `lastEventId` query parameter. The query parameter is useful
because this provider manually recreates `EventSource` instances while keeping
its cursor in the effect.

The initial lookback is capped at five minutes on the server, and events expire
after 24 hours. Therefore, event replay is helpful recovery—not the only
recovery plan. Every successful connection calls `reconcile()`, which
invalidates the main React Query keys and causes authoritative HTTP refetches.

## How the browser provider works

`RealtimeProvider` is mounted inside `SessionProvider` and
`QueryClientProvider`. This gives it access to the authenticated user and the
same React Query cache used by the screens.

It only connects after the session is authenticated. Its effect owns:

- the current `EventSource`;
- the most recently processed event ID;
- reconnect attempt count and timer;
- online/offline listeners;
- a stop flag used during React cleanup.

It opens:

```ts
new EventSource("/api/realtime?...cursor...")
```

Because this is a same-origin URL, the normal Auth.js session cookie is sent
with the request. No user ID is trusted from browser input.

### Opening

When `onopen` fires, the provider:

- resets the reconnect attempt counter;
- changes the displayed state to `connected`;
- invalidates conversation and message queries for recovery.

### Receiving

The provider listens specifically for the named SSE event:

```ts
source.addEventListener("relay", handleEvent);
```

`handleEvent` then:

1. parses the JSON `data`;
2. checks that the envelope is an object with version `1` and a string ID;
3. ignores an event ID already seen;
4. remembers the event ID as the reconnection cursor;
5. keeps only a bounded set of 500 seen IDs;
6. applies the matching cache update;
7. invalidates the inbox query for authoritative reconciliation.

The bounded set prevents duplicate processing without allowing memory use to
grow forever. The cache merge functions provide a second layer of
deduplication based on domain IDs.

### Disconnecting and retrying

On an error, the provider closes the failed source and calculates:

```text
backoff = min(30 seconds, 1 second * 2^attempt)
jitter  = random value up to 25% of backoff
delay   = backoff + jitter
```

Without jitter, many browsers disconnected at the same time could reconnect at
exactly the same moments and repeatedly overload the server. Random jitter
spreads those attempts out.

The provider listens to the browser's `online` and `offline` events. It avoids
trying to connect while `navigator.onLine` is false and preserves cached data
instead of blanking the UI.

When the provider unmounts or its authenticated user/active route changes, the
effect cleanup closes the stream, clears the timer, and removes browser event
listeners. This prevents leaked connections and state updates from an obsolete
effect.

## Updating React Query without a second state system

There is no separate "SSE messages" array. Both HTTP and SSE results converge
in the same React Query cache.

### Message history

`mergeMessageIntoCache` walks all pages of the infinite messages query. It:

- replaces a matching optimistic `clientId` with the committed message;
- replaces a matching server `id` only once;
- removes any extra matching copies;
- appends a genuinely new message to the newest page.

### Inbox

`mergeMessageIntoInbox` first rejects an older or duplicate message. For a
newer message it:

- updates the latest message ID, text, and time;
- moves the conversation to the top;
- increments unread only if the message came from another user and the
  conversation is not currently active;
- keeps unread at zero for the active conversation or the sender's own message.

The active conversation ID is derived from the current pathname.

### Why patch and invalidate

Direct cache patches make the UI feel immediate. Invalidation then fetches the
server's authoritative state. Using both provides fast feedback and eventual
correction if a local assumption was incomplete.

## End-to-end flow: marking a conversation read

Read state is a command followed by a real-time notification:

```text
latest committed message becomes fully visible
  -> MessageTimeline's IntersectionObserver notices it
  -> only report while the document is visible
  -> POST /api/conversations/:conversationId/read with messageId
  -> validate authentication, conversation participation, and message
  -> advance Participation.lastReadMessageId in a transaction
  -> recalculate unreadCount after that marker
  -> store conversation.read event for all participants
  -> HTTP response patches the current tab
  -> SSE event patches the same user's other tabs/devices
```

The code deliberately chooses the latest **committed** message. An optimistic
message still has `deliveryStatus`, so it cannot become a durable read marker
before the server has accepted it.

The marker only advances. `isAfter` compares message creation time and uses the
message ID as a tie-breaker. If an old tab reports an older message, the service
returns the current state and creates no backwards update or extra event.

The read transaction uses serializable isolation and retries Prisma conflict
error `P2034` up to three total attempts. This protects monotonic state when two
tabs race to advance the same marker.

`useMarkConversationRead` also remembers the last submitted message ID to avoid
repeated POSTs from observer callbacks. If the request fails, it clears that
local guard so a later attempt can retry.

`conversation.read` is delivered to all conversation participants, but the
current provider changes unread state only when `event.data.userId` equals the
current session user. The event is currently used to synchronize a user's own
inbox across that user's tabs; individual "read by the other person" bubble
receipts are not yet displayed.

## Reliability rules built into the design

### The database is authoritative

SSE may disconnect. HTTP history and inbox endpoints can always rebuild the UI
from PostgreSQL.

### Publish only committed work

Events are inserted in the same transaction as their domain change.

### Expect duplicates

The provider remembers event IDs, and cache helpers merge by message ID and
client ID. Correctness does not depend on exactly-once network delivery.

### Expect missed events

The cursor replays recent events, and successful reconnection invalidates HTTP
queries. The latter covers expired events and any replay edge case.

### Recheck authorization

A delivery row and current participation are both required when querying.

### Bound every resource

- stream lifetime: 25 seconds;
- polling interval: 750 ms;
- query batch: 100 events;
- initial lookback: at most five minutes;
- event retention: 24 hours;
- client deduplication set: 500 IDs;
- retry backoff: at most 30 seconds before jitter.

## What happens in common failure cases

### The internet goes offline

The status changes to `Offline`, cached messages remain visible, and the
provider waits for the browser's `online` event. It then reconnects and
refetches.

### The 25-second stream closes normally

`EventSource` reports the closed connection, the provider enters
`Reconnecting`, waits with backoff, then opens another stream. This cycling is
expected in the current serverless-friendly design.

### The browser receives the same event twice

The event ID set ignores it. Even if that set no longer contains an old ID,
the cache merge rejects the duplicate message.

### The browser was closed for longer than event retention

It cannot replay those expired notification rows, but initial page HTTP queries
load the current messages and inbox from their permanent tables.

### An event contains invalid JSON or an unsupported version

The handler returns without mutating the cache. A later HTTP reconciliation
still recovers authoritative state.

### More than 100 events are waiting

The server sends the first ordered batch, advances `lastEventId`, and the next
750 ms poll requests the following batch.

## Security checklist

The implementation protects the stream at several layers:

- authentication comes from the server-side Auth.js session;
- the connection endpoint is rate-limited per authenticated user;
- query parameters are validated with Zod;
- the browser cannot select another user's private channel;
- delivery rows restrict recipients;
- current conversation participation is checked again during delivery;
- cursor lookup applies the same authorization;
- payloads use public DTOs and contain no session token or password;
- event expiration limits stored notification data.

Remember that hiding an EventSource URL in frontend code is not security.
Authorization must happen in the route and database query, as it does here.

## How to build this pattern yourself next time

Use this order. Each step creates a stable foundation for the next one.

### 1. Keep commands as normal services

First make `POST /messages` correct without real-time delivery. It must perform
authentication, authorization, validation, idempotency, and a database
transaction.

### 2. Define versioned event contracts

Create a discriminated union mapping each event name to its payload. Use stable
public DTOs and serialize dates explicitly.

### 3. Add a durable event/outbox table

Give events a unique ID, type, version, payload, ordering timestamp, and
retention time. Add delivery rows or another secure recipient mapping.

### 4. Publish within the domain transaction

Pass the transaction client into the event creation function. Never announce a
change that has not committed.

### 5. Write an authorized ordered query

Fetch only the authenticated user's events. Define deterministic ordering with
a tie-breaker and support a cursor that means strictly after the last event.

### 6. Build the SSE route

Return a `ReadableStream` with `text/event-stream`, format frames correctly,
send keepalives, react to request abort, and set resource limits.

### 7. Build one top-level browser provider

Open `EventSource` only when authenticated. Close it during cleanup. Track
online state, reconnect with backoff and jitter, and retain the last cursor.

### 8. Make every event handler idempotent

Assume the same event can arrive more than once. Merge using stable domain IDs
instead of blindly appending.

### 9. Reconcile with authoritative HTTP data

Patch caches for speed, then invalidate/refetch after connection recovery.
Real-time notification should enhance the application, not become its only way
to load data.

### 10. Test invariants, not only the happy path

At minimum test:

- a non-recipient cannot receive an event;
- a former participant cannot receive an old delivery;
- cursor queries begin strictly after the cursor;
- an optimistic and committed message become one item;
- duplicate events do not increment unread twice;
- an older read marker cannot replace a newer one;
- reconnect recovery restores correct state.

## How to inspect SSE while developing

1. Sign in and open the browser developer tools.
2. Open the Network panel and filter for `realtime`.
3. Select `/api/realtime` and inspect its EventStream/Response view.
4. In a second authenticated browser session, send a message.
5. Look for an event named `relay` with type `message.created`.
6. Check that the connection indicator changes among Connecting, Live,
   Reconnecting, and Offline as expected.

Useful questions when debugging:

- Was the domain row committed?
- Was a `RealtimeEvent` inserted in the same transaction?
- Does a delivery row exist for the receiving user?
- Is that user still a conversation participant?
- Did `/api/realtime` return status 200 and `text/event-stream`?
- Does the frame have a blank line after `data`?
- Is the browser listening to `relay`, not the default `message` event?
- Did the event reach the provider but get rejected by version validation?
- Did the cache query key exactly match the screen's query key?
- Was the event correctly ignored as a duplicate?

## Current boundaries and future improvements

This implementation provides durable message delivery and current-user read
state synchronization. It intentionally does not yet provide:

- typing indicators;
- online presence;
- visible per-message read receipts for the other participant;
- a separate `conversation.updated` client handler;
- a dedicated pub/sub broker;
- broad automated two-browser-session coverage.

At larger scale, polling once per active user every 750 ms can create heavy
database load. A future transport could use PostgreSQL notifications, Redis,
or a managed pub/sub/WebSocket provider. The event envelope, authorization
rules, idempotent handlers, and HTTP recovery strategy should remain useful
even if that transport changes.

## Compact review: what to remember

If you remember only seven things, remember these:

1. SSE is a one-way streaming HTTP response from server to browser.
2. Commands still use normal HTTP APIs and server-side services.
3. Store the domain change and its event in the same transaction.
4. Authenticate the stream and authorize every delivered event.
5. Resume using a deterministic cursor, but refetch HTTP data after reconnect.
6. Treat duplicate delivery as normal and make handlers idempotent.
7. PostgreSQL is the truth; SSE only helps every open UI learn about changes
   quickly.
