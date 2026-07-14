# 07 - React Query

# Introduction

One of the biggest architectural decisions in this project is using **React Query** to manage server state.

Many beginners think React Query is simply a library for making HTTP requests.

It is not.

React Query is a **server state management library**.

Understanding the difference between **client state** and **server state** is the key to understanding why React Query exists.

---

# What Is Server State?

Server state is data that lives somewhere outside your React application.

Example

```text id="rq001"
Database

↓

API

↓

React Application
```

Examples in this project

- Search results
- Conversation information
- Messages
- Future notifications
- Future conversation list

All of these live inside PostgreSQL.

React only displays them.

---

# What Is Client State?

Client state exists only inside the browser.

Examples

```text id="rq002"
Current Theme

Sidebar Open

Selected Conversation

Modal Open

Current Input

Current Tab
```

These values belong only to the current browser session.

They are not stored in the database.

---

# Why Not Store Everything in React State?

Imagine

```tsx id="rq003"
const [messages, setMessages] = useState([]);
```

Now you must manually handle

- loading
- errors
- retries
- caching
- duplicate requests
- background refetching
- pagination

The amount of code grows very quickly.

---

# React Query Solves This

Instead of managing server state manually

we write

```tsx id="rq004"
useQuery(...)
```

or

```tsx id="rq005"
useInfiniteQuery(...)
```

React Query manages everything automatically.

---

# What React Query Provides

Automatically

- caching
- loading state
- error state
- retries
- deduplication
- background updates
- pagination support
- invalidation

without additional code.

---

# Why We Didn't Use React Query Everywhere

A question we discussed during development was:

> Why use React Query for search and messages but not for everything?

The answer depends on **how data is used**.

---

# Good Candidates

React Query is excellent for

```text id="rq006"
GET Requests

↓

Read Data
```

Examples

- Search Users
- Conversation Details
- Messages
- Future Conversation List

These are read-heavy operations.

---

# Poor Candidates

Creating

Updating

Deleting

usually happen through

```text id="rq007"
Server Actions

or

POST

PATCH

DELETE
```

Those operations are mutations.

They change server state instead of reading it.

---

# Query

A Query means

> Read data from the server.

Example

```tsx id="rq008"
useQuery(...)
```

No data changes.

Only reading.

---

# Mutation

A Mutation means

> Change data on the server.

Examples

```text id="rq009"
Send Message

Create Conversation

Update Profile

Delete Message
```

Mutations are handled differently.

---

# Query Key

Every query has a unique identity.

Example

```tsx id="rq010"
["conversation", conversationId];
```

or

```tsx id="rq011"
["messages", conversationId];
```

Think of the Query Key as the cache address.

---

# Cache

Suppose we open

Conversation A

↓

React Query downloads it.

Later

we return.

Instead of requesting it again

React Query immediately returns

the cached version.

The UI feels instant.

---

# Example

Without cache

```text id="rq012"
Open Conversation

↓

Loading

↓

Network

↓

Render
```

Every single time.

---

With cache

```text id="rq013"
Open Conversation

↓

Immediate Data

↓

Background Refresh
```

Much faster.

---

# Deduplication

Imagine

three components request

the same conversation.

Without React Query

```text id="rq014"
GET

GET

GET
```

Three HTTP requests.

---

With React Query

```text id="rq015"
GET

↓

Shared Cache

↓

All Components
```

Only one request.

---

# Loading State

React Query automatically provides

```tsx id="rq016"
isLoading;
```

Instead of writing

```tsx id="rq017"
const [loading, setLoading];
```

for every request.

---

# Error State

Likewise

```tsx id="rq018"
isError;
```

is already provided.

---

# Background Refetching

Suppose

Conversation information

is already cached.

React Query immediately displays it.

At the same time

it silently requests

fresh data.

If anything changed

the UI updates automatically.

The user rarely notices.

---

# Infinite Query

Normal Query

```text id="rq019"
One Page
```

Infinite Query

```text id="rq020"
Page 1

↓

Page 2

↓

Page 3
```

Perfect for chats.

---

# Why We Used Infinite Query

Messages never end.

Loading all messages would be impossible.

Instead

React Query stores

```text id="rq021"
Page

Page

Page
```

Then we flatten them for rendering.

---

# Cache Per Conversation

Messages use

```tsx id="rq022"
["messages", conversationId];
```

Conversation A

has one cache.

Conversation B

has another.

They never interfere.

---

# Invalidating Queries

Suppose

we send a new message.

The cache becomes outdated.

React Query allows

```tsx id="rq023"
invalidateQueries(...)
```

The next request automatically refreshes the cache.

We'll use this heavily when implementing message sending.

---

# React Query In This Project

Current usage

Search Users

```text id="rq024"
useQuery
```

Conversation Details

```text id="rq025"
useQuery
```

Messages

```text id="rq026"
useInfiniteQuery
```

Future

Conversation List

Unread Count

Notifications

Profile

will also use React Query.

---

# Why This Architecture Scales

The UI never owns server data.

Instead

```text id="rq027"
Database

↓

API

↓

React Query

↓

Components
```

Components become much simpler.

---

# Design Philosophy

Components should focus on

displaying data.

React Query focuses on

fetching

caching

refreshing

sharing

that data.

The responsibilities stay clearly separated.

---

# Lessons Learned

React Query is not an HTTP library.

It is not a replacement for fetch.

It is a server state manager.

Its purpose is to make remote data behave naturally inside React applications while handling all of the difficult problems automatically.

---

# Summary

React Query is responsible for managing every piece of server state in the application.

It provides caching, deduplication, loading states, retries, pagination, and background synchronization while allowing components to remain focused solely on rendering the UI.

As the messaging application grows, React Query will become one of the central building blocks of the frontend architecture.
