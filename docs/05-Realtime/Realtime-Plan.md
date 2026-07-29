# Real-Time Plan

## Goal

Real-time delivery is my next major backend feature after the HTTP UI,
optimistic behavior, retries, and unread rules are stable.

The database remains the source of truth. WebSockets notify clients about
committed state; they do not replace service validation, authorization,
transactions, or history endpoints.

## Completed prerequisites

- Client-generated message IDs and database idempotency.
- Optimistic updates safe for concurrent sends.
- Send-time block enforcement.
- Stable message DTO identity across optimistic and stored states.
- Service tests for idempotent retry and send-time blocking.

## Remaining prerequisite

- Define and implement a multi-client read-marker strategy.
- Expand PostgreSQL integration coverage for sending and participation.

## Connection lifecycle

1. Client opens an authenticated connection.
2. Server validates the Auth.js identity.
3. Client subscribes to allowed conversation/user channels.
4. Server authorizes each subscription against participation.
5. Server publishes events only after database commit.
6. Client merges events into React Query caches.
7. On disconnect, client reconnects with exponential backoff and jitter.
8. After reconnect, client refetches authoritative HTTP data to cover missed
   events.

## Send path

Recommended approach:

- Keep `POST /messages` as the reliable command initially.
- Client inserts an optimistic message with `clientMessageId`.
- Service commits the message transaction.
- Server publishes `message.created`.
- HTTP response and socket event carry the same message DTO.
- Client deduplicates both paths.

Socket commands can be considered later, but they must call the same service
and idempotency rules.

## Subscription model

Possible channels:

- a private user channel for inbox/read changes;
- an authorized conversation channel for message events.

Never trust a conversation ID supplied during subscription. Verify current
participation on the server, and handle membership changes.

## Reconnection

- back off with a maximum delay;
- display offline/reconnecting state;
- do not clear cached useful messages;
- refetch inbox and active conversation after reconnect;
- track event IDs only as an optimization, not the sole recovery mechanism;
- tolerate out-of-order events using server timestamps and stable ordering.

## Read state

Opening a route is not necessarily reading every message. A more stable plan:

- client reports the latest visible/read message;
- service validates that message belongs to the conversation;
- participation stores `lastReadMessageId` or equivalent;
- server publishes `conversation.read`;
- clients derive/reconcile unread state.

## Typing and presence

Add only after durable messages and reads are correct.

- Typing is ephemeral and throttled.
- Stop typing on timeout/disconnect.
- Presence is approximate, not a permanent truth.
- Do not write a database row for every typing/presence change.

## Failure behavior

- A socket failure must not prevent HTTP history or send fallback.
- Unauthorized subscriptions are rejected without leaking data.
- Duplicate events are harmless.
- Missed events are recovered through refetch.
- A message acknowledgement must not mark a failed database transaction as sent.

## Definition of done

- Two authenticated sessions exchange messages without refresh.
- Reconnect produces no loss or duplicates.
- HTTP response, socket event, and refetch converge.
- Non-participants cannot subscribe.
- unread/read state converges across two tabs.
- automated tests cover authorization, duplicate delivery, and reconnect.
