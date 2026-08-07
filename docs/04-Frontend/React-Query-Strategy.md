# React Query Strategy

## Provider

`QueryProvider` creates one `QueryClient` per browser provider instance and
nests it inside `SessionProvider`.

## Current query keys

- `["conversations"]`;
- `["conversation", conversationId]`;
- `["messages", conversationId]`;
- `["users", "search", debouncedQuery]`.
- `["blocking", "list"]`;
- `["blocking", "status", targetUserId]`.

These are understandable, but query-key factory helpers will prevent small key
differences as filters and pagination grow.

## Conversation list

`useConversations` uses a normal query and returns an empty array before data is
available. The component distinguishes loading and error before rendering.

Recommended policy decisions:

- choose an intentional `staleTime`;
- decide refetch-on-focus behavior;
- paginate or virtualize at scale;
- keep previous useful data during background refresh;
- show stale/offline state separately from initial loading.

## Message history

`useConversationMessages` uses `useInfiniteQuery`.

- The first page contains recent messages in chronological order.
- `getNextPageParam` reads the service cursor.
- The hook reverses the page array, then flattens it so older pages appear
  before newer pages.

The UI must preserve viewport position when a new older page is prepended.

## Search

`useSearchQuery` waits 300 ms and is disabled for an empty trimmed query.

The hook uses `useInfiniteQuery`, passes each `nextCursor` back to the API, and
flattens pages for the discovery UI. A changed debounced query creates a new
cache entry and restarts pagination. The interface distinguishes debouncing,
initial loading, next-page loading, empty results, and request failure.

## Mutations

`useSendMessage` handles optimistic cache work. It also invalidates the inbox
after settlement so direct cache changes are checked against authoritative
server data. Each mutation owns a client message ID, marks only its matching
bubble on failure, and can coexist with other pending sends.

Blocking optimistically marks interaction unavailable and rolls back on error;
unblocking waits for the server because a reverse block may remain. Both
mutations replace the target status with the response, then invalidate the
caller's blocked-account list and all cached discovery pages. Conversation and
profile consumers share the same status key.

## Recommended defaults

Define defaults deliberately rather than relying on library behavior:

- small retry count for safe reads;
- retry message POSTs only with their original client ID;
- stale times based on data volatility;
- refetch on reconnect;
- useful garbage-collection time for recently visited threads;
- global handling for authentication expiration.

## Real-time integration

SSE events update the same React Query caches:

- merge `message.created` by stable IDs;
- update and invalidate inbox metadata;
- reconcile current-user unread/read data;
- refetch relevant queries after reconnect.

The provider keeps a bounded event-ID deduplication set, while extracted cache
utilities also deduplicate by server and client message IDs. There is no
separate real-time-only message store.
