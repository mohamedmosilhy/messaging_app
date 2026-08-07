# User Stories

## Visitor and account stories

### Register

As a visitor, I want to create an account with a username, email, and password
so that I can use the messaging application.

Acceptance criteria:

- invalid fields are explained next to the correct input;
- duplicate email and username are rejected;
- values are normalized consistently;
- a password hash, not the password, is stored;
- an authenticated user cannot register again from the API.

### Log in

As a registered user, I want to log in with my email and password so that I can
access my conversations.

Acceptance criteria:

- invalid credentials do not reveal which field was wrong;
- the session contains the user identity needed by the application;
- submitting twice is prevented;
- errors remain visible long enough to understand;
- success navigates to the inbox.

### Log out

As an authenticated user, I want to sign out so that my session is closed on
the current browser.

## Profile stories

### View my profile

As a user, I want to see my display name, username, email, avatar, and bio so
that I understand how my account appears.

### Edit my profile

As a user, I want to update my display name, bio, and avatar so that my public
identity stays current.

Additional acceptance criteria for the polished UI:

- the existing form values remain after a successful save;
- the avatar has preview and fallback behavior;
- optional empty values are handled consistently;
- the Auth.js session is refreshed after the update;
- I receive clear success or failure feedback.

### View another user

As a user, I want to view another person's public profile so that I know who I
am contacting.

Open decision: profiles must be deliberately classified as public or
authenticated-only. The current service itself does not require authentication.

## Discovery stories

### Search for a person

As a user, I want to search by the beginning of a username or display name so
that I can find someone quickly.

Acceptance criteria:

- my own account is excluded;
- blocked relationships are excluded;
- the request waits briefly while I type;
- an empty query does not send a request;
- loading, no-result, and error states are distinct;
- later pages can be loaded when `nextCursor` exists.

### Start a conversation

As a user, I want to select a search result and open a direct conversation so
that I can message that person.

Acceptance criteria:

- I cannot open myself;
- a blocked pair cannot open a new thread;
- an existing thread is reused;
- concurrent requests cannot create duplicates;
- the selected action is disabled while opening;
- success navigates to the correct thread.

## Blocking stories

### Block an account

As a user, I want to block another account so that neither of us can discover
or message the other while the block exists.

Acceptance criteria:

- block controls are available from profiles and existing conversations;
- blocking is confirmed and safe to repeat;
- the composer becomes unavailable immediately;
- new conversation opening and sending are also rejected on the server;
- existing history remains visible;
- the interface does not disclose who initiated the other block direction.

### Manage blocked accounts

As a user, I want to review and unblock accounts so that I can reverse my own
blocking decisions.

Acceptance criteria:

- the list includes only blocks created by the current user;
- unblocking is safe to repeat;
- discovery and relationship state are reconciled after unblocking;
- interaction remains unavailable if the other account still has a block.

## Inbox stories

### View conversations

As a user, I want an inbox ordered by recent activity so that I can return to
the most relevant conversation.

Acceptance criteria:

- every row shows identity, preview, time, and unread count;
- missing avatars use an intentional fallback;
- long content is truncated without layout overflow;
- the selected thread is visually and semantically clear;
- loading, empty, error, and stale states are represented.

### Understand unread messages

As a user, I want unread counts to update predictably so that I know which
threads need attention.

Current behavior resets the count when conversation detail is fetched. Future
behavior should distinguish opening a route from actually reading messages and
must converge across tabs/devices.

## Message stories

### Read a conversation

As a participant, I want to read messages in chronological order so that the
conversation makes sense.

Acceptance criteria:

- non-participants learn nothing about the conversation;
- recent messages load first;
- older pages do not duplicate or skip equal timestamps;
- loading older history preserves scroll position;
- sender grouping, timestamps, and date separators remain understandable.

### Send a message

As a participant, I want my message to appear immediately so that sending feels
fast.

Acceptance criteria:

- empty and over-limit messages are stopped before sending;
- the composer clears immediately;
- a temporary bubble shows a sending state;
- success replaces it with the server message exactly once;
- failure leaves a retryable failed bubble and can restore the draft;
- multiple pending sends do not corrupt each other;
- retries cannot create duplicate stored messages.

### Recover from a network failure

As a user on an unstable connection, I want to understand whether my message
was sent so that I do not resend it accidentally.

This story is implemented with per-message mutation state and a
client-generated idempotency key.

## Accessibility stories

- As a keyboard user, I can reach and operate all controls in a logical order.
- As a screen-reader user, icon buttons have useful names and status changes
  are announced.
- As a low-vision user, focus and state do not depend only on color.
- As a mobile user, the composer remains usable with the software keyboard and
  safe-area insets.
