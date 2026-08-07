# Real-Time Plan

**Status:** Core delivery and reads completed on August 7, 2026.

## Goal

Real-time delivery extends the stable HTTP UI, optimistic behavior, retries,
and unread rules.

The database remains the source of truth. Server-Sent Events notify clients about
committed state; they do not replace service validation, authorization,
transactions, or history endpoints.

## Completed prerequisites

- Client-generated message IDs and database idempotency.
- Optimistic updates safe for concurrent sends.
- Send-time block enforcement.
- Stable message DTO identity across optimistic and stored states.
- Service tests for idempotent retry and send-time blocking.

## Completed read prerequisite

- `Participation.lastReadMessageId` and `lastReadAt` form a stable marker.
- The read service validates ownership, advances monotonically, and derives
  remaining unread state.

## Connection lifecycle

1. Client opens an authenticated same-origin SSE connection.
2. Server validates the Auth.js identity.
3. Server resolves the authenticated user's private deliveries.
4. Server rechecks current participation for every event batch.
5. Server publishes events only after database commit.
6. Client merges events into React Query caches.
7. On disconnect, client reconnects with exponential backoff and jitter.
8. After reconnect, client refetches authoritative HTTP data to cover missed
   events, resuming from the last event ID.

## Send path

Implemented approach:

- Keep `POST /messages` as the reliable command initially.
- Client inserts an optimistic message with `clientMessageId`.
- Service commits the message transaction.
- Server persists `message.created` and `conversation.updated` in the
  transaction.
- HTTP response and SSE event carry the same message DTO.
- Client deduplicates both paths.

Socket commands can be considered later, but they must call the same service
and idempotency rules.

## Delivery model

The implementation uses:

- one authenticated private user stream;
- durable per-user deliveries created from conversation participants;
- a current-participation check on every event query.

The client never supplies a conversation subscription ID, so it cannot request
another user's channel.

## Reconnection

- back off exponentially with jitter and a 30-second maximum;
- display offline/reconnecting state;
- do not clear cached useful messages;
- refetch inbox and active conversation after reconnect;
- resume after the last event ID, while HTTP refetch remains authoritative;
- tolerate out-of-order events using server timestamps and stable ordering.

## Read state

Opening a route is not necessarily reading every message. The implementation:

- client reports the latest visible/read message;
- service validates that message belongs to the conversation;
- participation stores `lastReadMessageId` and `lastReadAt`;
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

Core definition-of-done items are implemented. Focused tests cover delivery
authorization/cursors, duplicate cache delivery, optimistic/event convergence,
and monotonic read markers. Two-session browser expansion remains useful as a
future regression layer.
