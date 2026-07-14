# 01 - Folder Structure

# Introduction

This project follows a **feature-based architecture**.

Instead of grouping files by their type (components, hooks, services, etc.), everything related to one feature is grouped together.

For example:

```text
features/
│
├── authentication/
├── messaging/
└── users/
```

Each feature owns everything required to implement itself.

This keeps the project modular, scalable, and easier to maintain.

---

# Why Feature-Based Architecture?

Imagine the application grows to hundreds of files.

Instead of searching inside many folders:

```text
components/
hooks/
services/
routes/
types/
utils/
```

we simply open one feature.

Example:

```text
features/
└── messaging/
```

Everything related to messaging exists there.

This makes it easy to:

- develop
- debug
- refactor
- remove features

without affecting unrelated code.

---

# Overall Project Structure

```text
app/
│
├── (pages)/
├── api/
├── features/
├── lib/
├── utils/
└── middleware.ts
```

Each folder has a specific responsibility.

---

# app/(pages)

Contains the application's pages.

Example:

```text
dashboard/

search/

conversations/
```

Pages should remain very small.

Their job is only to:

- receive route parameters
- render components
- compose the UI

Pages should not contain business logic.

---

# app/api

Contains Route Handlers.

Example:

```text
api/

users/

conversations/

messages/
```

A Route Handler is the bridge between HTTP and the application.

Its responsibilities are:

- read request data
- call a service
- return JSON
- convert AppErrors into HTTP responses

Routes should **never** contain business logic.

Example:

```text
Client

↓

Route

↓

Service

↓

Database
```

---

# features

This is the heart of the application.

Each folder represents one business feature.

Example:

```text
features/

authentication/

messaging/

users/
```

Each feature owns everything it needs.

---

# Typical Feature Structure

```text
messaging/

actions/

components/

hooks/

routes/

services/

types/

utils/

index.ts
```

Each folder has a single responsibility.

---

# actions

Actions are responsible for talking to the backend.

Examples:

```text
searchUsersRequest()

getConversationRequest()

getMessagesRequest()
```

Responsibilities:

- perform fetch requests
- build query parameters
- return JSON

Actions do NOT:

- store state
- cache data
- manipulate UI

Think of them as HTTP clients.

---

# components

Contains React components.

Example:

```text
ConversationContent

SearchBar

ConversationSidebar
```

Responsibilities:

- render UI
- call hooks
- handle user interactions

Components should avoid business logic whenever possible.

---

# hooks

Contains reusable React hooks.

Example:

```text
useUserSearch()

useConversationMessages()
```

Responsibilities:

- React Query
- state composition
- reusable frontend logic

Hooks usually combine:

```text
React Query

+

Actions

+

UI state
```

This keeps components simple.

---

# services

The most important folder.

Services contain the application's business logic.

Examples:

```text
searchUsers()

openConversation()

getConversation()

getMessages()
```

A service usually follows this structure:

```text
Validation

↓

Authorization

↓

Business Rules

↓

Database

↓

Return DTO
```

Services are the only place where Prisma queries should normally exist.

---

# routes

Contains Route Handler definitions for a feature.

These files connect HTTP endpoints to services.

Responsibilities:

- parse request
- call service
- return response

Routes should remain very small.

---

# types

Contains shared TypeScript definitions.

Examples:

```text
SearchUsersRequest

SearchUsersResponse

PublicProfile

MessageResponse
```

Types help define the contract between layers.

---

# utils

Contains reusable helper functions specific to the feature.

Example:

```text
requireConversationParticipant()

buildParticipantKey()
```

Utilities should be:

- reusable
- stateless
- focused

If logic becomes business logic, it belongs in a service instead.

---

# index.ts

Each feature exports its public API.

Example:

```ts
export { searchUsers } from "./services/searchUsers";
export { openConversation } from "./services/openConversation";
export { getConversation } from "./services/getConversation";
```

Instead of importing deep paths:

```ts
import { openConversation } from "@/app/features/messaging/services/openConversation";
```

we simply write:

```ts
import { openConversation } from "@/app/features/messaging";
```

This hides the internal folder structure from the rest of the application.

---

# lib

Contains shared infrastructure.

Examples:

```text
Prisma Client

JWT

Error Classes

Authentication

Validation helpers
```

These are not tied to one feature.

---

# utils

The global `utils` folder contains helpers used by multiple features.

Example:

```text
requireCurrentUserId()

formatDate()

pagination helpers
```

If a utility is used by only one feature, it should stay inside that feature.

---

# Data Flow

The project follows a predictable flow.

```text
Component

↓

Hook

↓

Action

↓

Route

↓

Service

↓

Prisma

↓

Database
```

Each layer has one responsibility.

This separation keeps the project easy to reason about.

---

# Folder Responsibility Summary

| Folder     | Responsibility            |
| ---------- | ------------------------- |
| pages      | Render screens            |
| api        | HTTP entry point          |
| features   | Business features         |
| actions    | HTTP requests             |
| hooks      | React logic + React Query |
| components | UI                        |
| services   | Business logic            |
| routes     | Connect HTTP to services  |
| types      | Shared contracts          |
| utils      | Reusable helpers          |
| lib        | Shared infrastructure     |

---

# Rules We Follow

## Pages

✔ Render UI

❌ Business logic

---

## Components

✔ Display data

✔ Handle user interaction

❌ Database queries

---

## Hooks

✔ React Query

✔ Shared frontend logic

❌ Business rules

---

## Actions

✔ Fetch requests

✔ Build query strings

❌ Cache management

---

## Routes

✔ Parse request

✔ Return response

❌ Business logic

---

## Services

✔ Validation

✔ Authorization

✔ Business rules

✔ Prisma

✔ Transactions

---

## Types

✔ Shared interfaces

✔ Request DTOs

✔ Response DTOs

---

## Utils

✔ Small reusable functions

❌ Complex business workflows

---

# Philosophy

Every file should answer one question:

> **What is my responsibility?**

If a file starts doing work that belongs to another layer, it should be moved.

Following this rule keeps the architecture clean as the project grows and makes every feature easier to understand, test, and maintain.
