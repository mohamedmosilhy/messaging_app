# Service Layer

## Purpose

I use services as the application boundary between HTTP/UI code and Prisma.
They contain rules that must remain true even if the interface or transport
changes.

## Authentication services

### `register`

- normalizes email and username;
- checks both unique values in parallel;
- hashes the password;
- creates the user;
- translates Prisma unique races into the correct email/username conflict;
- enforces registration limits with a hashed client/email identity.

### `verifyCredentials`

- normalizes email;
- finds the account;
- compares the password hash;
- returns the identity/profile fields needed by Auth.js;
- uses the same invalid-credentials result for a missing user or bad password.
- runs a dummy bcrypt comparison when the user is absent;
- enforces a hashed client/email authentication limit.

## User services

### `getCurrentUser`

Requires an authenticated ID and returns the private current-user selection.

### `getUserProfile`

Normalizes the path username and returns the public profile selection. The
service does not itself authenticate, so profile visibility needs an explicit
product decision.

### `searchUsers`

- requires current-user identity;
- trims/lowercases the query;
- clamps the limit;
- rejects an empty query;
- excludes the caller;
- excludes either block direction;
- matches username/display-name prefixes;
- returns one extra result to calculate `nextCursor`.
- enforces a per-user search limit.

### `editProfile`

- requires authentication;
- rejects a request without changes;
- verifies the user exists;
- updates selected editable fields;
- returns the updated profile.

## Blocking services

### `getBlockedUsers`

- requires authentication;
- returns only blocks owned by the current user;
- selects public profile fields and an ISO block timestamp;
- orders newest blocks first.

### `getBlockStatus`

- rejects self and missing targets;
- evaluates both block directions;
- exposes whether the current user owns a block and a combined interaction
  flag without disclosing the reverse direction.

### `blockUser` and `unblockUser`

- require authentication and enforce a per-user mutation limit;
- reject self and missing targets;
- use idempotent upsert/delete behavior;
- mutate only the current user's direction;
- preserve conversation and message history;
- return the authoritative relationship status after the command.

## Messaging services

### `openConversation`

- requires identity;
- rejects self-conversation;
- verifies the target exists;
- rejects either block direction;
- calculates the deterministic pair key;
- returns an existing conversation when found;
- otherwise transactionally creates the conversation and participations;
- recovers from a unique-key race.
- enforces a per-user conversation-open limit.

### `getConversations`

- requires authentication;
- retrieves the caller's participations;
- includes latest message and participants;
- sorts by `lastMessageAt`, null last;
- maps a direct conversation to the other user's name/avatar;
- includes the participation unread count.

This currently loads the complete inbox and will eventually need pagination or
virtualization.

### `requireConversationParticipant`

- loads the conversation and public participant profiles;
- returns not-found if the conversation is absent;
- returns the same not-found if the caller is not a participant.

This avoids resource enumeration.

### `getConversation`

- requires identity and participation;
- resets the caller's unread count;
- returns the other participant for direct-message presentation.

Group behavior is not complete because title calculation assumes the direct
conversation model.

### `getMessages`

- requires identity and participation;
- clamps page size;
- applies the stable two-field cursor;
- requests one extra message;
- generates the next cursor;
- returns chronological rows.
- enforces a per-user history-read limit.

### `sendMessage`

- requires identity;
- trims and validates text;
- requires participation;
- returns an existing message for the same sender/client ID;
- rejects either block direction before writing;
- creates the message in a transaction;
- updates the conversation latest-message metadata;
- increments unread counts for other participants;
- recovers from a concurrent unique-key race by reading the committed message.
- enforces a per-user send limit.

## Service design rules

- A route may parse transport input, but the service owns business validation.
- Authorization is never delegated only to the UI.
- Multi-write invariants use transactions.
- Public selections do not expose passwords or email.
- Expected domain errors use `AppError` subclasses.
- Services remain reusable for HTTP and future real-time commands.

## Test priority

The service layer should receive the first automated integration tests because
it contains the most important rules with the least UI coupling.
