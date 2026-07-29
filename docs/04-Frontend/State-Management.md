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

Forms use `useState` for values, submitting flags, and field errors. The
conversation component keeps the current message input locally. Search keeps
the raw query locally and derives a debounced value.

## Recommended draft model

The composer draft should clear immediately on optimistic send, but drafts must
also survive moving between conversations.

A small client store or reducer keyed by conversation ID is appropriate:

```ts
type Drafts = Record<string, string>;
```

This does not replace React Query because drafts are unsaved client-owned data.

## Mutation state

A single `isPending` flag is not enough for a mature composer. Each temporary
message should express:

- `sending`;
- `failed`;
- `sent` through the real server model.

This can live as a UI extension around cached message data or in a dedicated
outbox model, but server DTOs should not pretend temporary states are persisted.

## Unread state

The server is authoritative. Opening a conversation should immediately update
the inbox cache for responsiveness, then reconcile with the server. Future
real-time reads should use a stable read marker rather than allowing independent
clients to guess at counts.

## State rules

- Do not duplicate query data into component state unless editing a snapshot.
- Do not use a global store for data React Query already owns.
- Put active resource identity in the URL.
- Keep ephemeral UI state near its consumer.
- Make optimistic state reconcilable by stable IDs.
- Reset cached private data on logout/session change where required.
