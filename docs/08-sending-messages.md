# 08 - Sending Messages

# Introduction

Loading messages is only half of a messaging application.

The second half is creating new messages safely and efficiently.

Sending a message seems simple:

```text
User types

↓

Click Send

↓

Message appears
```

In reality, many things happen behind the scenes.

This feature introduces several important concepts:

- Mutations
- Server Actions
- Transactions
- Cache Invalidation
- Optimistic Updates
- Conversation Metadata
- Database Consistency

---

# Feature Responsibilities

Sending a message is responsible for:

- Validate input
- Verify conversation membership
- Save the message
- Update conversation metadata
- Refresh cached data
- (Future) Broadcast the message in real time

---

# Complete Flow

```text
User types message

↓

Click Send

↓

Server Action

↓

sendMessage()

↓

Validation

↓

Authorization

↓

Transaction

↓

Create Message

↓

Update Conversation

↓

Success

↓

Invalidate Cache

↓

Messages Refresh
```

---

# Why Sending Is Different

Loading data is a **Query**.

Sending data is a **Mutation**.

Queries

```text
Read
```

Mutations

```text
Create

Update

Delete
```

React Query treats them differently because mutations change server state.

---

# Why We Use Server Actions

In this project we decided that most mutations use Server Actions.

Instead of

```text
POST /api/messages
```

the client directly calls

```ts
sendMessage();
```

through a Server Action.

Advantages

- less boilerplate
- automatic authentication
- simpler code
- better type safety

---

# Validation

Before writing anything to the database

the service validates:

## User authenticated

```text
JWT

↓

Current User
```

---

## Conversation exists

```text
Conversation ID

↓

Database
```

---

## User participates

Using

```ts
requireConversationParticipant();
```

Only participants may send messages.

---

## Message length

Example

```text
Empty

↓

Reject

5000 characters

↓

Reject
```

Only valid messages reach the database.

---

# Why We Use Transactions

Sending a message actually changes multiple tables.

Not only

```text
Message
```

but also

```text
Conversation
```

because conversations store

```text
lastMessageId

lastMessageAt
```

Both updates must succeed together.

---

# Transaction

Inside one transaction

```text
Create Message

↓

Update Conversation

↓

Commit
```

If anything fails

↓

Rollback.

---

# Conversation Metadata

Every new message updates

```text
lastMessageId

lastMessageAt
```

Example

Conversation

```text
Last Message

↓

Message 35
```

New message arrives

↓

Conversation becomes

```text
Last Message

↓

Message 36
```

This allows conversation lists to sort efficiently.

---

# Why Store lastMessage?

Without it

every conversation list would need

```sql
MAX(createdAt)
```

across every message.

Imagine

```text
500 conversations

↓

Thousands of messages
```

That becomes expensive.

Instead

the conversation already knows

its newest message.

Conversation lists become extremely fast.

---

# Returning Data

After insertion

the server returns

the created message.

Example

```text
id

content

createdAt

sender
```

The frontend can immediately display it.

---

# Cache Problem

Suppose

Conversation is already open.

React Query has cached

```text
Messages
```

User sends a message.

Database updates.

React Query still shows

old messages.

The cache is stale.

---

# Cache Invalidation

After success

we invalidate

```ts
["messages", conversationId];
```

React Query understands

this cache is outdated.

It automatically refetches.

The UI updates.

---

# Why Not Manually Update?

Imagine manually updating

Conversation

Conversation List

Unread Count

Search

Pinned Chats

Messages

The complexity grows quickly.

Invalidation keeps everything consistent.

---

# Optimistic Updates

Current implementation

```text
Send

↓

Wait

↓

Server

↓

Show Message
```

Future implementation

```text
Send

↓

Immediately Show Message

↓

Server Confirms

↓

Done
```

This is called an **Optimistic Update**.

Applications like

- WhatsApp
- Messenger
- Discord

behave this way.

The interface feels instant.

---

# Failure

Suppose

Network fails.

Optimistic update

↓

Rollback.

The temporary message disappears.

The user can retry.

React Query supports this pattern naturally.

---

# Real-Time Integration

Future flow

```text
Create Message

↓

Database

↓

WebSocket

↓

Other Users

↓

Message Appears
```

Notice

The database is updated **before** broadcasting.

The database is always the source of truth.

---

# Responsibilities

## Component

Displays messages.

Collects input.

---

## Server Action

Calls service.

---

## Service

Validation

Authorization

Transaction

Business Rules

---

## Prisma

Creates message.

Updates conversation.

---

## Database

Stores data permanently.

---

# Security

Every send operation verifies

conversation participation.

Users cannot send messages to conversations they don't belong to.

Authentication always comes from

```text
JWT
```

Never from the request body.

---

# Design Decisions

## Server Actions

Chosen for mutations.

Simpler than REST endpoints.

---

## Transaction

Guarantees consistency.

---

## Cache Invalidation

Simpler and safer than manually synchronizing every cached query.

---

## lastMessage

Stored inside Conversation for fast conversation lists.

---

## Optimistic Updates

Delayed until after the core messaging system is complete.

They improve user experience without changing backend architecture.

---

# Lessons Learned

Sending a message is much more than inserting one row.

A complete implementation must also:

- validate input
- authorize users
- maintain conversation metadata
- preserve database consistency
- synchronize frontend caches
- prepare for real-time delivery

These responsibilities make message sending one of the central operations in any messaging application.

---

# Summary

The Sending Messages feature combines validation, authorization, transactions, and cache management to safely create new messages while keeping the application consistent.

Its architecture provides a solid foundation for adding optimistic updates and real-time messaging without requiring major structural changes later.
