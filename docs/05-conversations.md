# 05 - Conversations

# Introduction

The Conversations feature is responsible for creating and opening chats between users.

Although the current application only supports direct conversations, the implementation was intentionally designed so that group conversations can be added later with minimal changes.

This feature introduces several important backend concepts:

- Business validation
- Authorization
- Transactions
- Race condition handling
- Database constraints
- Conversation ownership
- Reusable authorization utilities

---

# Feature Responsibilities

The Conversations feature currently supports:

- Open a conversation
- Re-open an existing conversation
- Prevent duplicate conversations
- Prevent conversations with blocked users
- Load conversation information
- Verify conversation membership

---

# Feature Flow

Opening a conversation follows this sequence.

```text
User clicks another user

↓

POST /api/conversations

↓

openConversation()

↓

Validation

↓

Authorization

↓

Business Rules

↓

Transaction

↓

Conversation ID

↓

Redirect

↓

GET Conversation Details

↓

Conversation Screen
```

---

# Opening a Conversation

The application never blindly creates a conversation.

Instead it asks:

> Does this conversation already exist?

If yes

↓

Return existing conversation.

If no

↓

Create a new one.

---

# Validation

Before touching the database, several validations happen.

## Cannot message yourself

Example

```text
Mohamed

↓

Open conversation with Mohamed
```

Rejected.

Reason

A user should never create a direct conversation with themselves.

---

## Target user exists

The application verifies

```text
Target User ID

↓

User exists?
```

If not

↓

404 Not Found

---

## Block Validation

The application checks both directions.

```text
Current User

↓

Blocked Target?

OR

↓

Target blocked Current User?
```

If either exists

↓

Conversation cannot be opened.

This prevents blocked users from contacting each other.

---

# participantKey

One of the most important design decisions.

Imagine

```text
Mohamed

John
```

IDs

```text
25

8
```

We sort them.

```text
8

25
```

Then join them.

```text
8:25
```

Stored as

```text
participantKey
```

---

# Why Sort?

Without sorting

Mohamed → John

creates

```text
25:8
```

John → Mohamed

creates

```text
8:25
```

Those look different even though they represent the same users.

Sorting guarantees both users always generate the exact same key.

---

# Existing Conversation Check

The service first performs

```text
Find Conversation

WHERE participantKey = ...
```

If found

↓

Return its ID immediately.

No transaction.

No inserts.

No duplicated conversations.

---

# Race Condition

Imagine this situation.

Mohamed presses

Start Conversation

at exactly the same time as John.

Without protection

Both requests execute.

Both find

"No conversation exists."

Both insert.

Result

```text
Conversation A

Conversation B
```

Two conversations between the same users.

---

# Database Protection

participantKey has

```text
UNIQUE
```

inside the database.

Only one insert succeeds.

The other throws

```text
P2002
```

Unique Constraint Violation.

---

# Race Condition Recovery

Instead of failing

we catch

```text
P2002
```

Then immediately load

```text
Conversation

WHERE participantKey = ...
```

and return its ID.

To the client

everything appears successful.

This is a common production pattern.

---

# Transaction

Creating a conversation actually performs multiple writes.

```text
Conversation

+

Participation

+

Participation
```

All three operations must succeed.

Otherwise

nothing should be created.

Therefore we use

```text
prisma.$transaction()
```

---

# Why Transactions?

Imagine

Conversation created

↓

First participant inserted

↓

Database crashes

Second participant never inserted.

Now the database contains an invalid conversation.

Transactions prevent this.

Either

Everything succeeds.

or

Everything rolls back.

---

# Participation

After creating the conversation

two Participation records are inserted.

Example

```text
Mohamed

↓

Conversation A

John

↓

Conversation A
```

The conversation itself never stores user IDs.

Participation owns that relationship.

---

# Loading Conversation

After redirecting

the application loads conversation information.

Flow

```text
Conversation ID

↓

getConversation()

↓

Load Participants

↓

Verify Membership

↓

Return DTO
```

---

# Authorization

This is one of the most important security checks.

Before returning conversation information

we verify

```text
Current User

↓

Participation Exists?
```

If not

↓

404

---

# Why 404 Instead of 403?

Imagine

Someone guesses

```text
conversationId
```

If we return

```text
403
```

they learn

"This conversation exists."

That's information leakage.

Instead we return

```text
404
```

Now attackers cannot distinguish between

- conversation doesn't exist

and

- conversation exists but isn't yours.

This is called **resource hiding** and is commonly used in secure applications.

---

# Conversation Title

Direct conversations don't store a title.

Instead

the server finds

the other participant.

Example

Current User

```text
Mohamed
```

Other participant

```text
John
```

Returned title

```text
John Smith
```

For group conversations

the stored title will be returned instead.

---

# Avatar

Current implementation

Direct Conversation

↓

Other participant avatar

Future

Group Conversation

↓

Conversation avatar

This is why the response already contains

```text
avatarUrl
```

even though group conversations don't exist yet.

---

# Reusable Authorization

Instead of repeating

```text
Find Conversation

↓

Check Participation
```

inside every service

we extracted

```text
requireConversationParticipant()
```

---

Responsibilities

- verify conversation exists
- verify membership
- return conversation

Now every service simply writes

```ts
await requireConversationParticipant(...)
```

This keeps the code consistent and reusable.

---

# Current Conversation Flow

```text
Open Conversation

↓

Validation

↓

Block Check

↓

participantKey

↓

Existing Conversation?

↓

Yes

↓

Return ID

──────────────

No

↓

Transaction

↓

Create Conversation

↓

Insert Participants

↓

Return ID
```

---

# Security Decisions

## Never trust IDs from the client

Identity comes from

```text
JWT
```

Never request body.

---

## Block users

Prevent unwanted conversations.

---

## Membership verification

Every conversation request verifies participation.

---

## Hide resources

Unauthorized users receive

404

instead of

403.

---

## Database constraints

The database prevents duplicate conversations even if the application fails.

---

# Design Decisions

## Why participantKey?

Fast lookup.

Duplicate prevention.

Simple uniqueness.

---

## Why transaction?

Multiple writes must succeed together.

---

## Why Participation?

Supports many-to-many relationships.

Allows group conversations later.

---

## Why reusable authorization utility?

Avoid duplicated security code.

Guarantees every service behaves consistently.

---

# Lessons Learned

This feature introduced several advanced backend concepts.

- Transactions
- Race conditions
- Unique constraints
- Authorization
- Resource hiding
- Business validation
- Reusable security utilities
- Database-driven guarantees

These are patterns commonly found in production systems and form the foundation for implementing the remaining messaging features.

---

# Summary

The Conversations feature ensures that users can safely and securely start conversations without creating duplicates or exposing information they should not access.

It combines application-level validation with database constraints, transactions, and reusable authorization utilities to produce a robust, scalable implementation that will naturally support future group conversations and additional messaging features.
