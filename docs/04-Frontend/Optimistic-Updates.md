# Optimistic Updates

## Implemented send model

Every logical send starts with a browser-generated UUID. That `clientId`
travels through the optimistic message, HTTP request, stored row, response, and
future real-time event. It is the stable identity used while the database ID is
not known.

```text
draft
  -> sending(clientId, temporary UI id)
     -> sent(clientId, server id)
     -> failed(clientId)
        -> retry(same clientId)
        -> remove from local cache
```

## Mutation start

1. The composer trims and validates the draft.
2. `useSendMessage` creates a UUID and submits `{ clientId, content }`.
3. The active message query is cancelled to avoid an older response
   overwriting the insertion.
4. A temporary message is appended to the newest infinite-query page.
5. The bubble has `deliveryStatus: "sending"` and uses the active session
   profile.
6. The composer clears immediately, so another message can be sent without
   waiting.

Retry uses the same path, but finds the existing failed bubble by `clientId`
and changes only that bubble back to `sending`.

## Success

The hook replaces the matching client ID with the authoritative server DTO. It
also removes an already-present copy with the same server ID, which prepares
the cache for HTTP/socket arrival in either order.

The matching inbox preview is updated only when the returned message is not
older than its current preview. The conversation is moved to the top and the
inbox is invalidated after settlement for authoritative reconciliation.

## Failure

A failure does not restore a snapshot of the entire messages cache. Only the
message with the failed mutation's `clientId` changes to:

```ts
{
  deliveryStatus: "failed";
  deliveryError: string;
}
```

The bubble remains in chronological context and exposes Retry and Remove.
Retry reuses the original client ID. Remove deletes only that failed local
bubble.

## Why concurrent sends are safe

Whole-cache rollback is unsafe when two sends overlap: an older failed
mutation can restore a snapshot that predates a later successful mutation.
Phase 4 uses targeted updates, so completion order does not affect unrelated
messages.

The database adds a second safety boundary:

```prisma
@@unique([senderId, clientId])
```

If the browser retries after the first request committed but its response was
lost, the service returns the stored message. If two requests race, the unique
constraint chooses one row and the losing request reads that row.

## Draft behavior

Drafts are browser-owned state, not server state. `useConversationDraft` stores
one value under `relay:draft:<conversationId>`. Navigating between threads
therefore restores the correct text. A submitted draft clears immediately; a
failed message remains recoverable through its persistent bubble.

## Remaining real-time integration

A future `message.created` event must merge by `clientId` and server `id` using
the same cache path. Reconnect still refetches message history as the
authoritative recovery mechanism.

## Verified rules

- a bubble appears before the response;
- several messages may remain pending together;
- one failure does not erase another mutation;
- a failed bubble is retryable or removable;
- retry uses the same stable client ID;
- the database cannot store two rows for one sender/client ID;
- the inbox is reconciled after settlement.
