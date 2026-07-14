# 04 - User Search

# Introduction

User Search is the first complete feature implemented in the application.

It demonstrates how every layer of the architecture works together:

- React Components
- React Query
- Actions
- API Routes
- Services
- Prisma
- PostgreSQL

Understanding this feature means understanding the architecture of the entire application.

---

# Feature Goal

Allow a logged-in user to search for other users by:

- username
- display name

while providing:

- fast responses
- minimal database load
- cached results
- debounced requests

---

# User Experience

When the user types

```text
j
jo
joh
john
```

the application should **not** send four HTTP requests.

Instead, it waits briefly before searching.

This creates a much smoother experience and greatly reduces server load.

---

# Complete Flow

The complete request lifecycle is:

```text
User types

↓

Search Input

↓

Debounce

↓

React Query

↓

searchUsersRequest()

↓

GET /api/users/search

↓

searchUsers()

↓

Prisma

↓

Database

↓

JSON Response

↓

React Query Cache

↓

Component Re-renders
```

This exact architecture is reused throughout the project.

---

# Component

The Search component is responsible only for:

- rendering the input
- displaying results
- handling typing

It does **not** know anything about:

- HTTP
- Prisma
- SQL
- caching

Its job is only presentation.

---

# Debouncing

Without debouncing:

Typing

```text
john
```

would generate

```text
j

jo

joh

john
```

↓

Four API requests

↓

Four database queries

This wastes resources.

---

Instead

the application waits for the user to stop typing.

Example

```text
Type

↓

Wait 300ms

↓

Send one request
```

Only the final query is executed.

---

# Why Debouncing Matters

Benefits:

- fewer HTTP requests
- fewer database queries
- smoother typing
- lower server load

Nearly every search feature on modern websites behaves this way.

---

# React Query

React Query manages the server state.

Instead of manually writing:

- loading state
- error state
- cache
- retries

React Query handles them automatically.

Example

```text
Search

↓

React Query

↓

Cache
```

---

# Query Key

The search feature uses a query key similar to:

```ts
["users", searchTerm];
```

This uniquely identifies cached data.

Example

Searching

```text
john
```

creates

```text
["users", "john"]
```

Searching

```text
ali
```

creates

```text
["users", "ali"]
```

Each search has its own cache.

---

# Cache

Suppose the user searches

```text
john
```

↓

Results load

↓

Later searches

```text
john
```

again.

React Query immediately returns the cached result.

No network request is necessary.

This makes repeated searches nearly instant.

---

# Action Layer

The component never calls fetch directly.

Instead it calls

```ts
searchUsersRequest();
```

Responsibilities:

- build URL
- append query parameters
- execute fetch
- return JSON

Actions contain no business logic.

---

# API Route

The request reaches

```text
GET /api/users/search
```

Responsibilities:

- read query parameters
- validate request
- call service
- return JSON

Routes never access Prisma directly.

---

# Service

The service performs the real work.

Typical flow:

```text
Authentication

↓

Validation

↓

Business Rules

↓

Prisma

↓

Return DTO
```

---

# Validation

The service validates:

- search term
- limit
- cursor (future)

before querying the database.

Invalid requests never reach Prisma.

---

# Database Query

The service searches

Users

using

- username
- displayName

Only the required fields are selected.

Sensitive information like

```text
passwordHash
```

is never returned.

---

# Public Profile

Instead of exposing the full User model,

the application returns

PublicProfile.

Example

```text
id

username

displayName

avatarUrl
```

Nothing more.

This prevents accidentally leaking sensitive fields.

---

# Why We Don't Return User

Returning

```ts
User;
```

would expose:

- passwordHash
- internal fields
- future sensitive data

Instead we define exactly what the client receives.

This is called a DTO (Data Transfer Object).

---

# Pagination

Although the UI currently displays only a limited number of users,

the endpoint already supports pagination.

Example

```text
limit = 10
```

This prevents loading thousands of users into memory.

---

# Security

The feature is protected.

Anonymous users cannot search.

Authentication happens before the database query executes.

---

# Responsibilities by Layer

## Component

Displays data.

---

## Hook

Manages React Query.

---

## Action

Performs fetch request.

---

## Route

Connects HTTP to service.

---

## Service

Business logic.

---

## Prisma

Database access.

---

## PostgreSQL

Stores users.

---

# Design Decisions

## Why React Query?

Server state belongs in React Query.

It provides:

- cache
- retries
- loading state
- deduplication

without additional code.

---

## Why Debounce?

Reduce unnecessary requests.

Improve user experience.

---

## Why DTO?

Prevent leaking internal database fields.

---

## Why Feature-Based Architecture?

Keeps everything related to search inside

```text
features/users
```

instead of scattering files across the project.

---

# Lessons Learned

This feature introduced several core concepts used throughout the application:

- Feature-based architecture
- Separation of concerns
- React Query
- Query Keys
- Debouncing
- DTOs
- Protected routes
- Service layer
- API layer
- Database abstraction

Every feature built after this one follows the same overall architecture.

---

# Summary

User Search is the first complete feature in the project and serves as the blueprint for future development.

It demonstrates how data flows from the UI to the database and back while maintaining clear separation between presentation, networking, business logic, and persistence.

Understanding this feature provides the foundation for understanding conversations, messages, and every future feature in the application.
