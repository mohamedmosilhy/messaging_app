# 06 - Messages

# Introduction

The Messages feature is responsible for loading conversation messages efficiently while remaining scalable as conversations grow.

Unlike a normal CRUD list, a chat application may eventually contain:

- thousands of messages
- hundreds of thousands of messages
- millions of messages

Because of this, loading messages requires a completely different approach.

This feature introduces several production-level concepts:

- Cursor Pagination
- Infinite Queries
- Stable Ordering
- Server State
- React Query
- Authorization
- DTOs

---

# Feature Responsibilities

The Messages feature currently supports:

- Load conversation messages
- Cursor pagination
- Infinite scrolling ("Load More")
- Authorization
- Efficient database queries

Future responsibilities will include:

- Sending messages
- Real-time updates
- Read receipts
- Typing indicators

---

# Complete Flow

```text id="msg001"
Conversation Page

↓

useConversationMessages()

↓

React Query

↓

getMessagesRequest()

↓

GET /api/conversations/:id/messages

↓

getMessages()

↓

Authorization

↓

Prisma

↓

Database

↓

JSON

↓

React Query Cache

↓

UI
```

---

# Why We Don't Load Every Message

Imagine a conversation with

```text id="msg002"
500,000 messages
```

Loading every message would:

- take several seconds
- consume huge amounts of memory
- freeze the browser
- waste bandwidth

Instead

we only load a small page.

Example

```text id="msg003"
20 messages
```

---

# Why Chats Use Pagination

Users almost always care about

the newest messages.

Not the oldest ones.

Therefore

the application initially loads

```text id="msg004"
Latest 20 Messages
```

Only when the user requests older messages do we load another page.

---

# Why We Chose Cursor Pagination

There are two common pagination strategies.

---

## Offset Pagination

Example

```sql id="msg005"
OFFSET 100

LIMIT 20
```

The database skips

100 rows

then returns

20.

This works well for small datasets.

---

Problems

Imagine

```text id="msg006"
5,000,000 messages
```

The database still has to walk through

five million rows

before returning data.

Performance becomes worse as data grows.

---

## Cursor Pagination

Instead of saying

Skip 100

we say

Continue after this message.

Example

```text id="msg007"
Last loaded message

↓

Load everything older
```

This scales extremely well.

---

# Cursor

Our cursor contains

```text id="msg008"
createdAt

id
```

Example

```json id="msg009"
{
  "createdAt": "...",
  "id": "abc123"
}
```

This uniquely identifies the last loaded message.

---

# Why Not Use Only ID?

Our IDs are generated using

```text id="msg010"
cuid()
```

They are unique

but

they are **not chronological**.

Sorting by ID would produce incorrect message order.

---

# Why Not Use Only createdAt?

Imagine

two messages are created within the same millisecond.

Example

```text id="msg011"
12:30:15.123

Message A

Message B
```

They have identical timestamps.

The database no longer knows which one comes first.

Pagination becomes unstable.

---

# Stable Ordering

To solve this

we order by

```text id="msg012"
createdAt DESC

id DESC
```

The ID acts as a tie-breaker.

Now every message has a deterministic position.

This guarantees consistent pagination.

---

# Query

The database query works like this.

Newest first

```text id="msg013"
35

34

33

...

16
```

Load

```text id="msg014"
limit + 1
```

Example

Limit

```text id="msg015"
20
```

Database loads

```text id="msg016"
21
```

messages.

---

# Why Load One Extra?

We need to know

whether another page exists.

Suppose

Database returns

```text id="msg017"
20
```

messages.

Did the conversation end?

Maybe.

Maybe not.

We don't know.

---

Instead

we request

```text id="msg018"
21
```

messages.

If

21

exist

↓

There must be another page.

We remove the extra message before returning.

---

# nextCursor

The extra message is never shown.

Instead

we use it to calculate

```text id="msg019"
nextCursor
```

Example

```text id="msg020"
Message 15

↓

nextCursor
```

When the next request arrives

the server loads

everything older than Message 15.

---

# Authorization

Before loading any messages

the service executes

```ts id="msg021"
requireConversationParticipant();
```

Responsibilities

- conversation exists
- current user participates

If either check fails

↓

404

No database query executes.

---

# DTO

The client never receives

the entire Message model.

Instead

we return

```text id="msg022"
id

content

createdAt

sender
```

Sender contains

```text id="msg023"
displayName

username

avatarUrl
```

Sensitive information never leaves the server.

---

# React Query

Messages use

```text id="msg024"
useInfiniteQuery()
```

instead of

```text id="msg025"
useQuery()
```

because multiple pages exist.

---

# Why Infinite Query?

Normal Query

```text id="msg026"
One request

↓

One response
```

Infinite Query

```text id="msg027"
Page 1

↓

Page 2

↓

Page 3

↓

...
```

React Query automatically stores every page.

---

# Query Key

Messages are cached using

```ts id="msg028"
["messages", conversationId];
```

Every conversation has its own cache.

Example

```text id="msg029"
Conversation A

↓

Own Cache

Conversation B

↓

Different Cache
```

---

# Flattening Pages

React Query stores

```text id="msg030"
Page 1

Page 2

Page 3
```

Our UI needs

```text id="msg031"
Message

Message

Message
```

Therefore

we flatten the pages.

Example

```ts id="msg032"
pages

↓

flatMap()

↓

messages[]
```

Now rendering becomes simple.

---

# Why Reverse Pages?

The database returns

Newest

↓

Oldest

Each page individually is reversed before returning so messages inside the page display chronologically.

React Query stores pages in the order they were fetched:

```text id="msg033"
Newest Page

↓

Older Page

↓

Oldest Page
```

To display a normal chat history

we reverse the page order before flattening.

Result

```text id="msg034"
Oldest

↓

Newest
```

The UI now renders naturally from top to bottom.

---

# Responsibilities

## Component

Displays messages.

---

## Hook

Owns React Query.

---

## Action

Performs fetch.

---

## Route

HTTP only.

---

## Service

Authorization

Business Rules

Pagination

Database

---

## Prisma

Loads messages efficiently.

---

# Security

Every request verifies

conversation membership.

Users cannot load messages from conversations they don't belong to.

Even if they know the conversation ID.

---

# Design Decisions

## Cursor Pagination

Chosen because it scales.

---

## createdAt + id

Guarantees stable ordering.

---

## Infinite Query

Automatically caches pages.

---

## DTO

Prevents exposing internal database fields.

---

## requireConversationParticipant()

Guarantees authorization consistency.

---

# Lessons Learned

This feature introduced several important production concepts.

- Cursor pagination
- Stable ordering
- Infinite queries
- Server state
- Efficient database access
- Authorization
- Page flattening
- Scalable chat loading

These concepts are used by most modern messaging applications because they remain efficient even when conversations become extremely large.

---

# Summary

The Messages feature loads conversations efficiently using cursor pagination and React Query's infinite queries.

Only a small portion of messages is loaded at a time, authorization is verified before every request, and stable ordering ensures pagination remains correct even when multiple messages share the same timestamp.

This architecture provides a scalable foundation for adding message sending, real-time updates, typing indicators, and read receipts without redesigning the message loading system.
