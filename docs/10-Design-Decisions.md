# 10 - Design Decisions

# Introduction

During development, many implementation choices had multiple possible solutions.

This document explains **why each important decision was made**, what alternatives were considered, and the trade-offs involved.

The goal is not simply to remember _what_ the code does, but _why_ it was written that way.

---

# Why Feature-Based Architecture?

Instead of organizing by technology

```text id="dd001"
components/

hooks/

services/
```

we organized by feature

```text id="dd002"
auth/

users/

messaging/
```

### Why?

Because developers usually work on one feature at a time.

Everything related to Messaging stays inside the Messaging folder.

Benefits

- easier navigation
- smaller mental context
- better scalability
- fewer merge conflicts

---

# Why Layered Architecture?

Every layer has exactly one responsibility.

```text id="dd003"
UI

↓

Networking

↓

Business Logic

↓

Database
```

Without layers

business logic quickly spreads into

- components
- routes
- hooks

making the application harder to maintain.

---

# Why Services Own Business Logic?

Business rules should exist only once.

Instead of

```text id="dd004"
Component

↓

Validation
```

or

```text id="dd005"
Route

↓

Validation
```

we chose

```text id="dd006"
Service

↓

Validation
```

Now

every client

- Web
- Mobile
- Admin
- API

shares exactly the same business rules.

---

# Why Prisma Instead of Raw SQL?

Advantages

- type safety
- autocomplete
- migrations
- easier maintenance
- database portability

Raw SQL still has its place

for very complex queries,

but most operations become much simpler with Prisma.

---

# Why PostgreSQL?

Reasons

- mature
- reliable
- ACID compliant
- excellent indexing
- strong relational support

Messaging applications depend heavily on relationships.

PostgreSQL is an excellent fit.

---

# Why Cursor Pagination?

Alternative

Offset

```sql id="dd007"
OFFSET 5000
```

Problem

Performance decreases as tables grow.

Cursor Pagination

```text id="dd008"
Continue after this message
```

Performance remains consistent regardless of table size.

---

# Why createdAt + id?

Sorting only by

```text id="dd009"
createdAt
```

fails when multiple messages share the same timestamp.

Sorting only by

```text id="dd010"
id
```

fails because CUIDs are not chronological.

Combining both produces deterministic ordering.

---

# Why participantKey?

Alternative

Always search

Participation

↓

Conversation

↓

Participation

Problem

More joins.

More queries.

Instead

```text id="dd011"
userA:userB
```

creates a deterministic lookup key.

Benefits

- one lookup
- uniqueness
- duplicate prevention

---

# Why Unique Constraint?

Application validation alone is not enough.

Two simultaneous requests can bypass application logic.

The database becomes the final protection.

```text id="dd012"
UNIQUE(participantKey)
```

guarantees correctness.

---

# Why Catch P2002?

Suppose

two users start a conversation simultaneously.

One succeeds.

One fails.

Instead of returning an error,

we simply load

the already-created conversation.

The user experiences

success,

not failure.

---

# Why Transactions?

Sending messages

or

creating conversations

changes multiple tables.

Without transactions

partial writes become possible.

Transactions guarantee

```text id="dd013"
Everything

or

Nothing
```

---

# Why Participation Table?

Instead of

```text id="dd014"
Conversation

user1

user2
```

we created

Participation.

Benefits

- unlimited participants
- group conversations
- future roles
- future permissions

The schema scales naturally.

---

# Why DTOs?

Returning Prisma models directly exposes

internal database structure.

Instead

services return DTOs.

Benefits

- hides sensitive fields
- stable API
- backend independence
- easier frontend development

---

# Why React Query?

Server state behaves differently from client state.

React Query solves

- caching
- retries
- loading
- pagination
- deduplication

without custom code.

---

# Why Server Actions?

Mutations use Server Actions.

Reasons

- fewer API routes
- type safety
- simpler code
- automatic authentication

GET requests still use API routes because they integrate naturally with React Query.

---

# Why Resource Hiding?

Unauthorized users receive

```text id="dd015"
404
```

instead of

```text id="dd016"
403
```

Attackers cannot determine whether the resource exists.

This is a common production security practice.

---

# Why requireConversationParticipant()?

Instead of repeating

```text id="dd017"
Find Conversation

↓

Check Participation
```

inside every service,

we extracted reusable logic.

Benefits

- consistency
- security
- less duplication

---

# Why lastMessageAt?

Conversation lists should be sortable.

Without

```text id="dd018"
lastMessageAt
```

every query would need

```sql id="dd019"
MAX(createdAt)
```

across all messages.

That becomes expensive.

Updating one timestamp during every send is much cheaper.

---

# Why lastMessageId?

Conversation previews need

the newest message.

Without

```text id="dd020"
lastMessageId
```

every conversation requires another query.

Storing the reference avoids unnecessary work.

---

# Why Authorization Happens in Services?

Components can be modified.

API requests can be forged.

Only the server can be trusted.

Authorization always belongs to the backend.

---

# Why Authentication Uses JWT Identity?

The client never sends

```text id="dd021"
senderId
```

The backend derives identity from authentication.

This prevents impersonation.

---

# Why Separate Hooks?

Instead of writing

React Query

inside every component,

hooks encapsulate

fetching

pagination

caching

Components remain focused on rendering.

---

# Why Not Optimize Too Early?

Many features intentionally use simpler implementations.

Example

Conversation Details

One query

instead of

multiple optimized joins.

Premature optimization often increases complexity without measurable benefit.

The project optimizes only where necessary.

---

# General Philosophy

Throughout the project,

the following principles guided every decision.

- Keep responsibilities separated.
- Let the database enforce consistency.
- Prefer readability over cleverness.
- Optimize only when justified.
- Build for future scalability.
- Keep business logic centralized.
- Make security the default.

---

# Lessons Learned

A good architecture is not about using the newest technology.

It is about making decisions that continue to make sense as the application grows.

Every decision documented here aims to reduce future complexity rather than simply solve today's problem.

---

# Summary

The architecture and implementation choices in this project prioritize correctness, maintainability, scalability, and security.

Most decisions intentionally trade a small amount of additional code today for significantly easier development and maintenance as the application evolves.

Understanding **why** these decisions were made is more valuable than memorizing the implementation itself, because the reasoning can be applied to future projects regardless of the technology stack.
