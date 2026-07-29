# State Management

## State categories

I separate state by ownership instead of placing everything in one global
store.

### Server state

Owned by React Query:

- conversation list;
- conversation detail;
- message pages;
- user search results;
- send mutation state.

### Session state

Owned by Auth.js:

- current identity;
- session lifecycle;
- public profile fields used by the client.

### Local UI state

Owned by the nearest component or focused hook:

- input values;
- open menus/dialogs;
- selected filters;
- composer draft;
- scroll-near-bottom state;
- temporary disclosure state.

### URL state

Owned by Next.js routing:

- active conversation ID;
- current page/screen;
- shareable search/filter values when useful.

## Current local state

Forms use `useState` for values, submitting flags, and field errors.
`useConversationDraft` owns a browser-storage value keyed by conversation ID,
while `MessageTimeline` owns only the jump-to-latest visibility state. Search
keeps the raw query locally, derives a debounced value, and leaves result pages
in React Query. Profile settings keep an editable snapshot and the last
server-confirmed snapshot for dirty/reset behavior.

After profile success, Auth.js `session.update` replaces the JWT-owned public
profile fields. The protected server layout then receives the refreshed
identity through `router.refresh`.

## Draft model

Drafts use `localStorage` keys shaped as `relay:draft:<conversationId>`.
`useSyncExternalStore` keeps React subscribed to local and cross-tab changes
without moving unsaved text into React Query. Submission clears the draft
immediately because the optimistic/failed bubble becomes the recoverable
record.

## Mutation state

Each temporary message expresses:

- `sending`;
- `failed`;
- `sent` through the real server model.

`sending` and `failed` are UI-only extensions around cached message data.
Persisted rows have no delivery-status column.

## Unread state

The server is authoritative. Opening a conversation immediately changes the
matching inbox cache row to zero while the conversation GET performs the
persistent reset. Future real-time reads should use a stable read marker rather
than allowing independent clients to guess at counts.

## State rules

- Do not duplicate query data into component state unless editing a snapshot.
- Do not use a global store for data React Query already owns.
- Put active resource identity in the URL.
- Keep ephemeral UI state near its consumer.
- Make optimistic state reconcilable by stable IDs.
- Reset cached private data on logout/session change where required.
