# 02 - Database Design

# Introduction

The database is designed to support a modern messaging application while remaining scalable and easy to extend.

Although the current application only supports direct conversations, the schema was intentionally designed to support group conversations without requiring major structural changes.

Every model exists for a specific reason. This document explains not only **what** each model contains, but **why** it exists.

---

# Database Overview

The application currently contains five main models.

```text
User

↓

Participation

↓

Conversation

↓

Message

↓

Block
```

Relationships:

```text
User
 │
 ├─────────────┐
 │             │
 │             ▼
 │      Participation
 │             │
 │             ▼
 │      Conversation
 │             │
 │             ▼
 │          Message
 │
 ▼
Block
```

---

# User

Represents an account in the system.

A user can:

- send messages
- participate in conversations
- block other users

The User model does **not** store conversations directly.

Instead, conversations are connected through the Participation table.

---

## Important Fields

### id

Unique identifier.

Used throughout the entire application.

---

### username

Public unique username.

Used for searching users.

---

### displayName

The name shown inside the application.

Unlike username, this may change.

Example:

```text
Username:
john_smith

Display Name:
John Smith
```

---

### avatarUrl

Optional profile image.

Displayed in:

- search
- conversation header
- message list

---

# Why don't users contain conversations?

A user can participate in:

- one conversation
- hundreds of conversations
- thousands of conversations

Storing conversation IDs inside User would become impossible to maintain.

Instead, we normalize the relationship using Participation.

---

# Conversation

Represents a chat room.

A conversation can be:

```text
DIRECT

or

GROUP
```

Every message belongs to one conversation.

---

## Important Fields

### id

Primary identifier.

Referenced by:

- Participation
- Message

---

### type

Current values:

```text
DIRECT

GROUP
```

This allows one table to support both conversation types.

---

### title

Used only for group conversations.

Example:

```text
Family

Work

Friends
```

Direct conversations compute the title dynamically using the other participant.

---

### participantKey

One of the most important fields.

Used only for DIRECT conversations.

Example:

Users

```text
Mohamed
John
```

IDs

```text
8

15
```

Sorted

```text
8:15
```

Stored

```text
participantKey = "8:15"
```

---

# Why does participantKey exist?

Without it:

Opening a conversation would require

- loading participants
- sorting them
- comparing arrays

Instead we simply query

```text
WHERE participantKey = ...
```

which is extremely fast.

---

# Why is participantKey unique?

Imagine:

Mohamed opens chat with John.

At the exact same moment

John opens chat with Mohamed.

Without a unique participantKey:

Conversation A

Conversation B

Both would be created.

The unique constraint guarantees this can never happen.

---

### lastMessageId

Points to the newest message.

This allows the sidebar to display:

```text
John

Hey!
2 minutes ago
```

without searching every message.

---

### lastMessageAt

Stores when the latest message was sent.

Used for ordering conversations.

Example:

Newest conversation first.

Instead of

```text
ORDER BY messages.createdAt
```

we simply use

```text
ORDER BY lastMessageAt DESC
```

Much faster.

---

# Participation

Participation is a junction table.

It connects

Users

and

Conversations.

---

Why?

A conversation has many users.

A user has many conversations.

This is a many-to-many relationship.

Databases represent this using a junction table.

---

Example

```text
Conversation A

Mohamed

John
```

Stored as

```text
Participation

Mohamed -> Conversation A

John -> Conversation A
```

---

# Why not store participants inside Conversation?

Example

```text
participants = [1,5,8]
```

Bad idea.

Problems:

- difficult to query
- impossible to index efficiently
- difficult to enforce integrity

Normalization solves this.

---

# Composite Primary Key

Participation uses

```text
(userId, conversationId)
```

instead of its own id.

Reason:

The same user should never join the same conversation twice.

The database guarantees this automatically.

---

# Message

Represents one message.

Every message belongs to:

one sender

and

one conversation.

---

Important fields

### senderId

Who sent the message.

---

### conversationId

Where the message belongs.

---

### content

The text of the message.

---

### createdAt

When it was sent.

Used for pagination.

---

# Why don't we store message order?

Time already provides ordering.

We order using

```text
createdAt DESC

id DESC
```

The ID acts as a tie-breaker when timestamps are identical.

This guarantees deterministic pagination.

---

# Block

Represents one user blocking another.

Example

```text
Mohamed blocks John
```

Stored as

```text
blockerId

blockedId
```

---

Why a separate table?

Because blocking is another many-to-many relationship.

Every user may block

0

10

100

or

1000

users.

---

# Composite Primary Key

```text
(blockerId, blockedId)
```

Guarantees

Mohamed cannot block John twice.

---

# Relationships

## User

has many

Participation

---

## Conversation

has many

Participation

---

## Conversation

has many

Messages

---

## User

has many

Messages

---

## User

has many

Blocks

---

# Indexes

Indexes are created for fields that are queried frequently.

Current indexes include:

Conversation

```text
lastMessageAt
```

Used for ordering the sidebar.

---

Participation

```text
conversationId
```

Used when loading participants.

---

Message

```text
conversationId
```

Used every time messages are loaded.

Without this index every conversation would require scanning the entire Message table.

---

# Database Philosophy

The schema is fully normalized.

Every table represents exactly one concept.

- Users represent people.
- Conversations represent chat rooms.
- Participation represents membership.
- Messages represent communication.
- Blocks represent permissions.

No table stores duplicated information.

This keeps the database consistent and scalable.

---

# Scalability

Although the current application only supports direct conversations, the schema already supports future features.

Examples:

- Group conversations
- Conversation avatars
- Conversation titles
- Read receipts
- Unread counts
- Message reactions
- Attachments
- Typing indicators

Most of these features can be added without redesigning the database.

---

# Design Decisions

## Why Participation instead of userIds array?

Normalized database

Faster queries

Better indexing

Stronger constraints

---

## Why participantKey?

Fast lookup

Race-condition protection

Simple unique constraint

---

## Why lastMessageId?

Avoid querying the newest message every time the sidebar loads.

---

## Why lastMessageAt?

Efficient conversation ordering.

---

## Why Block table?

Allows many-to-many blocking while keeping the User model clean.

---

# Summary

The database is designed around normalization and scalability.

Each table has a single responsibility.

Relationships are explicit.

Indexes support the most common queries.

The schema already supports the future evolution of the application while remaining simple enough to understand and maintain.
