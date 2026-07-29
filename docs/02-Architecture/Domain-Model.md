# Domain Model

## Main concepts

```text
User
 ├── sends many Messages
 ├── has many Participations
 ├── blocks Users through Block
 └── is blocked by Users through Block

Conversation
 ├── has many Participations
 ├── has many Messages
 └── points to an optional latest Message

Participation
 └── connects one User to one Conversation and stores unread state

Message
 └── belongs to one sender and one conversation
```

## User

A user represents an account and public messaging identity.

Important fields:

- `id`: cuid primary key;
- `email`: unique credential identifier;
- `username`: unique normalized public identifier;
- `displayName`: user-facing name;
- `passwordHash`: bcrypt result;
- `bio`, `avatarUrl`: optional profile data;
- timestamps.

Email is private in the current user response and not part of the selected
public profile.

## Conversation

A conversation owns participants and messages.

Important fields:

- `type`: `DIRECT` or schema-prepared `GROUP`;
- `title`: optional and intended for groups;
- `participantKey`: unique direct-message pair key;
- `lastMessageId`: unique optional pointer;
- `lastMessageAt`: optional inbox sorting field.

Current product behavior supports direct conversations. The group enum does not
mean group rules are complete.

## Participation

Participation is the membership entity rather than a direct many-to-many table.
Its composite primary key is `(userId, conversationId)`.

It currently stores:

- membership creation time;
- unread count.

This entity is the correct place for future per-user conversation settings such
as read position, archive state, mute state, or role.

## Message

A message belongs to one sender and conversation.

Important fields:

- sender and conversation foreign keys;
- text content;
- created and updated timestamps.

The current model has no delivery state, edit/delete marker, reply relation, or
client-generated idempotency key.

## Block

A block is directional:

- `blockerId`: the user who initiated it;
- `blockedId`: the user who is restricted.

The composite primary key prevents duplicate rows for the same direction.
Product rules often treat either direction as preventing new contact, which is
how search and opening currently behave.

## Current invariants

- username and email are unique;
- a direct participant pair has one `participantKey`;
- one user has one participation per conversation;
- one block direction appears once;
- only participants access conversation history;
- message creation and conversation preview updates commit together;
- message pages are stably ordered.

## Invariants to add or clarify

- direct conversations contain exactly two distinct users;
- group conversations require a title and membership rules;
- blocked pairs cannot send in an existing thread;
- retried client sends create at most one message;
- latest-message metadata always references a message in the same conversation;
- the product either permits or forbids empty conversations consistently.
