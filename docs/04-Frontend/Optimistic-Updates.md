# Optimistic Updates

## What I implemented

The current send hook makes a message appear before the server responds.

### Mutation start

1. Cancel the active messages query.
2. Save the previous infinite-query cache.
3. Require available cached pages and session user.
4. Generate `temp-${crypto.randomUUID()}`.
5. Build a temporary message using the draft and session profile.
6. Append it to the newest page.

### Success

1. Find the temporary message from mutation context.
2. Replace it with the returned database message.
3. Update the matching inbox preview.
4. Move that conversation to the top.
5. Invalidate the inbox after settlement.

### Failure

The previous full message cache snapshot is restored.

## What works well

- The sender sees immediate feedback.
- Server IDs and timestamps replace temporary values.
- The inbox does not wait for a second fetch after success.
- A final invalidation reconciles the inbox.
- The implementation understands that infinite-query data has nested pages.

## Important distinction

The message bubble is pre-response optimistic. The inbox change currently
happens in `onSuccess`, so it is an eager direct cache update after success.
Moving the preview in `onMutate` would make the inbox itself fully optimistic.

## Edge cases to handle

### Local validation

The temporary content currently uses the raw draft while the service stores
trimmed content. Validate and trim before the optimistic insertion so the
bubble never temporarily shows a value the server rejects or changes.

### Draft behavior

The current input clears on success. A better messaging experience:

- clears immediately;
- stores the submitted draft in mutation context;
- restores it only when appropriate after failure.

### Concurrent sends

Restoring a full snapshot for one failure can remove another send that
succeeded later. Rollback should remove or mark only the failed temporary ID.

### Failed bubble

Silent disappearance leaves the user uncertain. Keep the bubble with a failed
status and retry/remove actions.

### Missing temporary item

If refetching or another cache update removes the temporary record, success
should merge the server message if it is not already present.

### Duplicate delivery

The same message may later arrive through:

- optimistic insertion;
- HTTP response;
- WebSocket event;
- reconnect refetch.

Add a client-generated message ID stored by the server, then deduplicate on
both client and database.

### Session profile

The temporary sender uses session profile fields. Refresh the Auth.js session
after profile edits to avoid old display names or avatars.

## Target state machine

```text
draft
  -> sending(temp/client ID)
     -> sent(server ID)
     -> failed(retry/remove)
```

Retry reuses the client ID. The server returns the existing stored message if
that ID was already committed.

## Acceptance tests

- Bubble appears before the response.
- Server response replaces it once.
- Failed send remains actionable.
- Two pending messages may resolve out of order.
- One failure does not erase another success.
- Retry cannot create a duplicate.
- Inbox preview and message list converge after refetch/socket delivery.
