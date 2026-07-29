# Features

This document separates what I have completed, what is partially present, and
what I intentionally plan to build later.

## Completed foundation

### Authentication

- Credentials registration.
- Zod validation for registration and login.
- Lowercase normalization for email and username.
- bcrypt password hashing and comparison.
- Auth.js credentials provider.
- JWT-backed sessions.
- Server-side session access.
- Client-side session provider.
- Logout flow.

### Users

- Current authenticated user retrieval.
- Public profile retrieval by username.
- Profile editing for display name, bio, and avatar URL.
- Debounced user search.
- Case-insensitive prefix matching.
- Search result limiting and service-level cursor response.
- Block-aware search filtering.

### Direct conversations

- Open an existing direct conversation.
- Create a direct conversation when it does not exist.
- Deterministic sorted `participantKey`.
- Database uniqueness for one conversation per pair.
- Duplicate-creation race recovery.
- Participant authorization.
- Conversation detail retrieval.
- Inbox retrieval ordered by latest activity.

### Messages

- Message history retrieval.
- Stable cursor pagination using `createdAt` and `id`.
- Bounded page sizes.
- Message content validation in the service.
- Transactional message creation.
- Denormalized latest-message reference and timestamp.
- Recipient unread-count increment.
- Current-participant unread reset on conversation detail access.

### Client server-state

- React Query provider.
- Query caching for conversation list and details.
- Infinite-query caching for message history.
- Mutation for sending.
- Optimistic temporary message insertion.
- Temporary-to-server message replacement.
- Rollback on send failure.
- Direct inbox preview and order update after successful send.
- Authoritative inbox invalidation after mutation settlement.

### Development data

- Multiple realistic users.
- A long message thread crossing pagination boundaries.
- Two messages sharing a timestamp.
- More than 20 matching search users.
- Missing avatars and bios.
- A user without an existing conversation.
- Blocked relationships.
- Unread-count scenarios.

## Partially implemented features

### Blocking

The `Block` model exists. Search and new-conversation opening respect both
directions of a block. There is no block/unblock command or UI, and sending to
an already existing thread does not currently recheck the block.

### Unread state

Unread counts are persisted, incremented transactionally, returned in the
inbox, and reset on conversation-detail retrieval. The React Query inbox cache
is not immediately changed to zero when opening a conversation. A simple
counter will also need more design for multi-device reads.

### Search pagination

The backend response contains `nextCursor`, but the current search hook uses a
normal query and the test page renders only the first result set.

### Group preparation

The schema includes `ConversationType.GROUP` and an optional title. Current
services and UI should be treated as direct-message behavior only.

### Protected routing

APIs and services authenticate sensitive operations. Some pages redirect
manually. The `(protected)` folder is organizational and does not itself
enforce authentication.

## Not implemented yet

- WebSocket or Server-Sent Events.
- Polling.
- Message delivery/read receipts.
- Presence and typing.
- Conversation-list pagination.
- Message idempotency.
- Failed-message retry UI.
- Per-conversation drafts.
- Block/unblock product controls.
- Message editing, deletion, or reactions.
- Attachments or uploads.
- Group-chat behavior.
- Notifications.
- Automated tests.
- Production UI and design system.

## Important wording

The message list is genuinely optimistic because a temporary bubble appears
before the HTTP response. The conversation list is updated directly after that
response succeeds. It is fast and avoids waiting for a refetch, but it is more
accurately described as an eager cache update after success rather than a
pre-response optimistic inbox update.

Also, opening a new user currently creates an empty conversation immediately.
The first message does not create that conversation. Any document or UI copy
should follow this actual behavior unless I later change the rule.
