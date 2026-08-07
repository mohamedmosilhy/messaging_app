# Product Requirements

## Purpose

I built this project to learn how a real messaging product is designed across
all application layers. My goal was not to copy every WhatsApp or Messenger
feature. I wanted to build a reliable direct-messaging foundation first, keep
the responsibilities separated, and use the first UI only as a way to test the
system.

The next product milestone is to replace that test UI with a polished,
responsive experience inspired by familiar messaging applications. Real-time
delivery will follow after the HTTP and optimistic workflows are reliable.

## Product goals

- A user can create an account and authenticate securely.
- A user can maintain a small public profile.
- A user can find another user and start a direct conversation.
- Only participants can access a conversation or its messages.
- Messages remain ordered and can be loaded in stable pages.
- The inbox shows the latest message and unread count.
- Sending feels immediate through optimistic UI.
- The application remains understandable and maintainable as it grows.
- The same business rules are enforced regardless of the UI or future
  WebSocket transport.

## Current functional requirements

### Accounts

- Registration accepts a username, email, and password.
- Email and username are normalized before storage.
- Usernames and emails are unique.
- Passwords are hashed and never returned to the client.
- Login uses email and password.
- Authenticated identity is available in server and client code.
- A user can sign out.

### Profiles and discovery

- A user has a display name, username, email, optional bio, and optional avatar.
- A user can edit display name, bio, and avatar URL.
- Public profiles can be retrieved by username.
- Search matches username or display-name prefixes without case sensitivity.
- Search excludes the current user.
- Search excludes users involved in either side of a block relationship.
- Search results support a cursor at the service/API layer.

### Conversations

- The product currently supports direct conversations.
- A direct conversation is unique for a pair of users.
- Opening the same user from two requests must not create duplicate threads.
- A user cannot start a conversation with themselves.
- A blocked relationship prevents opening a new conversation.
- Only a participant can retrieve a conversation.
- The inbox is ordered by latest-message time.

### Blocking

- A user can block another user from a profile or existing conversation.
- A user can review and unblock accounts from a dedicated settings page.
- Blocking and unblocking are safe to repeat.
- A user cannot block themselves or a missing account.
- Either block direction prevents discovery, opening a conversation, and
  sending new messages.
- Existing conversation history remains readable after a block.
- The interface does not reveal whether the other account initiated a block.

### Messages

- Only a participant can retrieve or send messages.
- Content is trimmed before storage.
- Empty content is rejected.
- Stored content is limited to 1,000 characters.
- Message history uses cursor pagination.
- Messages with identical timestamps remain stably ordered.
- Creating a message, updating the latest-message metadata, and incrementing
  recipient unread counts happen in one transaction.
- Opening conversation detail resets the current participant's unread count.

## Experience requirements for the next UI

- Desktop uses an inbox sidebar and conversation pane.
- Mobile uses separate inbox and full-screen conversation views.
- Every data surface supports loading, empty, error, and success states.
- Sending exposes pending, failed, retry, and sent states.
- Older-message loading preserves the reader's scroll position.
- Forms show persistent field and general errors.
- The interface works with keyboard navigation and visible focus.
- Long names, missing avatars, empty bios, and long messages do not break the
  layout.
- No control is displayed unless its behavior exists.

## Non-functional requirements

- Authorization remains in services/APIs, not only in page redirects.
- Database mutations that belong together use transactions.
- API failures use predictable, user-safe contracts.
- TypeScript remains strict.
- The production build, lint, typecheck, and automated tests must pass.
- User content is rendered as text, never trusted HTML.
- The application must remain usable on slow networks and after reconnection.
- Future socket events must be deduplicated with HTTP and optimistic results.

## Current non-goals

- Group chat behavior.
- Attachments and uploads.
- Voice messages.
- Reactions, editing, and deleting messages.
- Calls.
- End-to-end encryption.
- Push notifications.
- Typing and presence before core real-time delivery is stable.

## Success criteria

The MVP is successful when two accounts can discover each other, open one
direct thread, exchange messages, load history, and see correct inbox metadata
without data leaks or duplicate messages. The polish milestone is successful
when the same flow feels complete on mobile and desktop under loading, failure,
retry, and empty states.

## Review recommendations

Completed review recommendations:

- message idempotency before automatic retry or WebSockets;
- send-time block enforcement for existing conversations;
- message-specific optimistic failure handling.

Remaining recommendations:

- decide whether an opened conversation may exist before its first message;
- evolve unread state for multi-device real-time behavior;
- add automated coverage for the critical business rules.
