# Real-Time Events

These contracts are implemented over the authenticated `/api/realtime` SSE
stream. Durable payloads are stored in PostgreSQL and delivered only to current
participants with a per-user delivery row.

## Envelope

Use one versionable envelope:

```ts
type RealtimeEvent<T> = {
  eventId: string;
  type: string;
  version: 1;
  occurredAt: string;
  data: T;
};
```

All timestamps are ISO 8601 UTC strings over the network.

## Durable events

### `message.created`

Published after the send transaction commits.

```ts
type MessageCreatedData = {
  message: MessageResponse;
  clientMessageId: string;
};
```

Client actions:

- replace matching optimistic message by client ID;
- otherwise merge by server message ID;
- update active message cache;
- update inbox preview/order;
- update unread state only when appropriate.

### `conversation.updated`

Carries minimal inbox metadata when latest activity changes.

```ts
type ConversationUpdatedData = {
  conversationId: string;
  lastMessageId: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
};
```

The client may directly patch the inbox and later invalidate/refetch.

### `conversation.read`

```ts
type ConversationReadData = {
  conversationId: string;
  userId: string;
  lastReadMessageId: string;
  readAt: string;
};
```

This event should follow a server-validated read command.

## Ephemeral events

### `typing.started`

```ts
type TypingData = {
  conversationId: string;
  userId: string;
};
```

### `typing.stopped`

Uses the same data shape. Clients also expire typing state after a timeout.

### `presence.changed`

```ts
type PresenceChangedData = {
  userId: string;
  state: "online" | "offline";
  lastSeenAt?: string;
};
```

Presence is approximate and should not be presented as guaranteed truth.

## Client-to-server commands

Implemented command:

- mark conversation read;

Subscription is implicit in the authenticated private stream. Typing
start/stop remains deferred.

Message sending can remain HTTP at first.

## Event rules

- Events use the same public DTOs as HTTP where possible.
- `eventId` identifies delivery; message IDs identify domain records.
- A client message ID connects optimistic and stored messages.
- Consumers ignore unknown event types/versions safely.
- Events contain no password, email, token, or unnecessary private data.
- Publish happens after commit.
- Authorization applies to delivery, not only subscription request.
- Handlers are idempotent and tolerate duplicate/out-of-order delivery.
- Durable events expire after 24 hours; HTTP refetch covers longer gaps.
