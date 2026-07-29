# React Query Strategy

## Provider

`QueryProvider` creates one `QueryClient` per browser provider instance and
nests it inside `SessionProvider`.

## Current query keys

- `["conversations"]`;
- `["conversation", conversationId]`;
- `["messages", conversationId]`;
- `["users", "search", debouncedQuery]`.

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
server data.

## Recommended defaults

Define defaults deliberately rather than relying on library behavior:

- small retry count for safe reads;
- no automatic blind retry for non-idempotent message POST until an idempotency
  key exists;
- stale times based on data volatility;
- refetch on reconnect;
- useful garbage-collection time for recently visited threads;
- global handling for authentication expiration.

## Future socket integration

Socket events should update the same React Query caches:

- merge `message.created` by stable IDs;
- update or invalidate inbox metadata;
- update unread/read data;
- refetch relevant queries after reconnect.

Do not create a separate socket-only message store that can disagree with HTTP.
