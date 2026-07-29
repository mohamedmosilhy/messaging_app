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

### Presentation

- Semantic Tailwind design system and shadcn/ui primitives.
- Shared authenticated application shell.
- Collapsible desktop navigation and mobile drawer.
- Responsive inbox and conversation split pane.
- Valid conversation-list semantics and designed inbox states.
- Conversation participant header and profile link.
- Incoming/outgoing grouped message bubbles.
- Localized timestamps and date separators.
- Initial, empty, loading, pagination, and error states.
- Scroll-to-latest and older-page anchor preservation.
- Optimistic sending and sent indicators.
- Failed-send feedback that preserves the draft.
- Auto-growing multiline composer with keyboard behavior and length limit.
- Original Relay website icon.
- Global and protected route boundaries.
- Premium dark-only Relay theme across public and protected surfaces.
- Complete landing, login, registration, discovery, public profile, and
  profile-settings presentation.
- Frontend cursor pagination for user search.
- Immediate Auth.js session refresh after profile edits.

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

### Group preparation

The schema includes `ConversationType.GROUP` and an optional title. Current
services and UI should be treated as direct-message behavior only.

## Not implemented yet

- WebSocket or Server-Sent Events.
- Polling.
- Message delivery/read receipts.
- Presence and typing.
- Conversation-list pagination.
- Message idempotency.
- Persistent failed-message bubble with idempotent retry/remove actions.
- Per-conversation drafts.
- Block/unblock product controls.
- Message editing, deletion, or reactions.
- Attachments or uploads.
- Group-chat behavior.
- Notifications.
- Automated browser tests.

## Important wording

The message list is genuinely optimistic because a temporary bubble appears
before the HTTP response. The conversation list is updated directly after that
response succeeds. It is fast and avoids waiting for a refetch, but it is more
accurately described as an eager cache update after success rather than a
pre-response optimistic inbox update.

Also, opening a new user currently creates an empty conversation immediately.
The first message does not create that conversation. Any document or UI copy
should follow this actual behavior unless I later change the rule.
