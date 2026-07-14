# 09 - Project Architecture

# Introduction

One of the primary goals of this project is to build a messaging application that remains easy to understand and easy to extend even after it grows to tens of thousands of lines of code.

The architecture was intentionally designed to separate responsibilities into clear layers.

Each layer has exactly one job.

This makes the application:

- easier to understand
- easier to test
- easier to extend
- easier to maintain
- easier for multiple developers to work on simultaneously

---

# Overall Architecture

The application follows a layered architecture.

```text id="arch001"
React Components

↓

React Hooks

↓

Actions

↓

API Routes / Server Actions

↓

Services

↓

Prisma

↓

PostgreSQL
```

Each layer communicates only with the layer directly below it.

---

# Why Layers?

Imagine a React component directly writing SQL.

```text id="arch002"
Component

↓

SQL
```

Now the component is responsible for

- UI
- networking
- business logic
- database access

One file contains everything.

As the project grows this quickly becomes impossible to maintain.

Instead

every responsibility has its own layer.

---

# Feature-Based Structure

Instead of organizing files by type

```text id="arch003"
components/

hooks/

services/

actions/
```

we organize everything by feature.

Example

```text id="arch004"
features/

    users/

    messaging/

    auth/
```

Each feature owns everything related to itself.

---

# Messaging Feature

Example

```text id="arch005"
messaging/

    actions/

    components/

    hooks/

    routes/

    services/

    types/

    utils/
```

A developer working on messaging almost never needs to leave this folder.

---

# Components

Components are responsible for

- rendering UI
- displaying data
- handling user interaction

Components never

- call Prisma
- perform validation
- contain business logic

Example

```text id="arch006"
ConversationContent
```

Only displays conversation information.

---

# Hooks

Hooks connect components to server state.

Responsibilities

- React Query
- caching
- pagination
- reusable frontend logic

Example

```text id="arch007"
useConversationMessages()
```

The component simply consumes

```tsx id="arch008"
messages;
```

without caring how they were loaded.

---

# Actions

Actions are the networking layer.

Responsibilities

- build URLs
- perform fetch requests
- return JSON

Actions never contain business rules.

Example

```text id="arch009"
getConversationRequest()
```

---

# API Routes

Routes translate HTTP into application logic.

Responsibilities

- receive requests
- parse parameters
- call services
- return responses

Routes never contain business logic.

Example

```text id="arch010"
GET /api/conversations/:id
```

---

# Server Actions

Mutations generally use Server Actions.

Example

```text id="arch011"
sendMessage()
```

Server Actions reduce boilerplate while keeping business logic inside services.

---

# Services

Services are the heart of the application.

Every important decision happens here.

Responsibilities

- validation
- authorization
- business rules
- transactions
- Prisma calls

If someone asks

> "Where does the real work happen?"

The answer is

Services.

---

# Prisma

Prisma is the data access layer.

Responsibilities

- querying
- inserting
- updating
- deleting

Prisma never decides

whether an operation is allowed.

It simply performs database operations.

---

# PostgreSQL

The database stores application state.

Responsibilities

- persistence
- indexes
- constraints
- relationships

Business rules should not depend entirely on the database.

Instead

the service layer validates first,

then the database provides the final guarantee.

---

# Data Flow

Loading data

```text id="arch012"
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

Returning

```text id="arch013"
Database

↓

Prisma

↓

Service

↓

Route

↓

Action

↓

Hook

↓

Component
```

Every feature follows this exact flow.

---

# Why Services Never Return Prisma Models

Services return DTOs.

Example

Instead of

```text id="arch014"
User
```

they return

```text id="arch015"
PublicProfile
```

This prevents leaking

- password hashes
- internal fields
- future sensitive information

The client only receives what it actually needs.

---

# Authorization

Authorization is never handled inside React.

It always happens on the server.

Example

```text id="arch016"
JWT

↓

Current User

↓

Service

↓

Permission Check
```

The frontend should never decide whether an action is allowed.

---

# Validation

Every request passes through validation before reaching Prisma.

Typical flow

```text id="arch017"
Authentication

↓

Validation

↓

Authorization

↓

Business Rules

↓

Database
```

This ordering keeps the code predictable.

---

# Reusable Utilities

Some logic appears in many services.

Example

```text id="arch018"
requireConversationParticipant()
```

Instead of duplicating

conversation checks everywhere,

the logic lives in one place.

Benefits

- fewer bugs
- easier maintenance
- consistent security

---

# React Query

React Query owns all server state.

Examples

- search
- conversations
- messages

Components never manually manage server data.

---

# Client State

Client state still uses React.

Examples

```text id="arch019"
Current Input

Modal Open

Sidebar Expanded

Selected Tab
```

React Query is not used for these values.

---

# Error Handling

Errors originate inside services.

Example

```text id="arch020"
ValidationError

ForbiddenError

NotFoundError
```

Routes translate them into HTTP responses.

Components display user-friendly messages.

---

# Design Principles

Every layer should have

one responsibility.

---

## Components

Display.

---

## Hooks

Manage frontend data.

---

## Actions

Perform HTTP requests.

---

## Routes

Handle HTTP.

---

## Services

Business logic.

---

## Prisma

Database access.

---

## PostgreSQL

Persistence.

---

# Benefits

This architecture makes the project

Easy to read

↓

Easy to extend

↓

Easy to debug

↓

Easy to scale

↓

Easy for multiple developers to collaborate on

without stepping on each other's code.

---

# Future Features

Because the architecture is already established,

adding features like

- group conversations
- read receipts
- typing indicators
- reactions
- attachments
- notifications
- voice messages

requires creating new services and components rather than rewriting existing code.

The foundation remains unchanged.

---

# Lessons Learned

The biggest lesson from this project is that architecture is about separating responsibilities.

Every layer has exactly one purpose.

When responsibilities remain isolated,

features become much easier to reason about,

testing becomes simpler,

and the application continues to grow without becoming chaotic.

---

# Summary

This messaging application is built using a feature-based layered architecture.

Presentation, networking, business logic, and persistence are all isolated into dedicated layers.

This separation keeps the codebase clean, scalable, and maintainable while allowing new features to be added with minimal impact on existing functionality.

The same architecture can comfortably support applications far larger than this project, making it a strong foundation for professional software development.
