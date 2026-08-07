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

### Blocking

- Directional block and unblock commands.
- Idempotent block creation and removal.
- Self-block and missing-target validation.
- Privacy-safe relationship status.
- Blocked-account list and management page.
- Profile and conversation-header block controls.
- Immediate composer disabling when either block direction exists.
- Existing conversation history remains visible after blocking.
- React Query reconciliation for status, blocked lists, and discovery.
- Rate-limited blocking mutations.

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
- Client-generated message identity stored by the server.
- Sender-scoped idempotent retry and duplicate-race recovery.
- Send-time enforcement of both block directions.

### Client server-state

- React Query provider.
- Query caching for conversation list and details.
- Infinite-query caching for message history.
- Mutation for sending.
- Optimistic temporary message insertion.
- Temporary-to-server message replacement.
- Message-specific failure handling safe for concurrent mutations.
- Persistent failed-message retry and remove actions.
- Per-conversation drafts in browser storage.
- Immediate unread-cache reconciliation when a thread opens.
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
- Session-aware landing actions that replace authentication links with the
  signed-in identity and dashboard access.
- Frontend cursor pagination for user search.
- Immediate Auth.js session refresh after profile edits.
- Request-correlated API errors and a database health endpoint.
- Shared rate limits for authentication, registration, discovery,
  conversation opening, message sending, and history reads.
- Content Security Policy and defensive browser headers.
- Automated desktop/mobile browser and accessibility checks.
- Real seeded screenshots and a Vercel deployment.

### Development data

- Multiple realistic users.
- A long message thread crossing pagination boundaries.
- Two messages sharing a timestamp.
- More than 20 matching search users.
- Missing avatars and bios.
- A user without an existing conversation.
- Blocked relationships.
- Unread-count scenarios.
- Empty-thread, maximum-message-length, and numbered unread-badge scenarios.

## Partially implemented features

### Unread state

Unread counts are persisted, incremented transactionally, returned in the
inbox, reset on conversation-detail retrieval, and immediately reconciled to
zero in the React Query inbox cache. A simple counter still needs a stable
read-marker design for multi-device reads.

### Group preparation

The schema includes `ConversationType.GROUP` and an optional title. Current
services and UI should be treated as direct-message behavior only.

## Not implemented yet

- WebSocket or Server-Sent Events.
- Polling.
- Message delivery/read receipts.
- Presence and typing.
- Conversation-list pagination.
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
