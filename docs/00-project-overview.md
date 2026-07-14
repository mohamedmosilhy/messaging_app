# 00 - Project Overview

# Messaging App

## Introduction

This project is a modern full-stack messaging application built to learn how production-ready applications are designed and implemented.

The goal of this project is **not simply to build a chat application**, but to understand how large applications are architected, how data flows between layers, and how scalable patterns are implemented.

The project intentionally follows feature-based architecture, strong separation of concerns, and modern React/Next.js practices.

---

# Main Goals

The project focuses on learning:

- Designing scalable database schemas
- Building feature-based architecture
- Separating business logic from HTTP logic
- Authentication and authorization
- Cursor pagination
- React Query
- Infinite loading
- Transactions
- Security best practices
- Real-world application architecture

The application should resemble how production messaging applications are implemented rather than only producing the final UI.

---

# Tech Stack

## Frontend

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- React Query (TanStack Query)

---

## Backend

- Next.js Route Handlers
- TypeScript
- Prisma ORM

---

## Database

- PostgreSQL

---

## Authentication

- JWT stored in HTTP-only cookies

---

## ORM

- Prisma

---

# High-Level Architecture

The project follows a layered architecture.

```
Browser

↓

React Components

↓

Custom Hooks

↓

React Query

↓

API Requests

↓

Route Handlers

↓

Services

↓

Prisma

↓

PostgreSQL
```

Each layer has one responsibility.

---

# Project Philosophy

Several important decisions guide this project.

## 1. Business logic never lives inside routes.

Routes only:

- receive requests
- call services
- return responses

All application logic lives inside services.

---

## 2. Database access happens inside services.

Components never know Prisma exists.

Routes never write database queries.

Only services communicate with the database.

---

## 3. React Query manages server state.

Server data is never duplicated inside React state.

React Query becomes the single source of truth for fetched data.

---

## 4. Feature-based organization

Instead of grouping files by type, the project groups everything by feature.

Example:

```
features/

users/

messaging/

authentication/
```

Each feature owns its:

- services
- components
- hooks
- actions
- routes
- types
- utilities

This makes features independent and easier to scale.

---

# Current Features

At the time of writing this document the project supports:

## Authentication

- Login
- Logout
- JWT Authentication
- Protected Routes

---

## User Search

Users can search for other users.

Features include:

- Debounced searching
- React Query caching
- Pagination support
- Validation

---

## Conversations

Users can:

- Open direct conversations
- Reopen existing conversations
- Prevent duplicate conversations
- Prevent conversations with blocked users

The application guarantees that only one direct conversation can exist between two users.

---

## Messages

Implemented:

- Loading conversation messages
- Cursor pagination
- Infinite loading
- Stable ordering
- Conversation authorization

Upcoming:

- Sending messages
- Optimistic updates
- Real-time messaging

---

# Database Overview

The application currently contains the following core entities:

```
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

These models are designed to support both direct and group conversations without changing the overall architecture.

---

# Request Flow

Most requests follow the exact same lifecycle.

```
User Action

↓

React Component

↓

Custom Hook

↓

React Query

↓

HTTP Request

↓

API Route

↓

Service

↓

Prisma

↓

Database

↓

Service Response

↓

JSON Response

↓

React Query Cache

↓

UI Update
```

Understanding this flow is one of the most important concepts in the project.

---

# Design Principles

Throughout the project we follow several principles.

## Single Responsibility

Every function should have one responsibility.

---

## Thin Routes

Route handlers should remain very small.

---

## Fat Services

Business rules belong inside services.

---

## Type Safety

Every request and response has explicit TypeScript types.

---

## Reusable Utilities

Shared logic should be extracted into reusable utilities whenever appropriate.

---

## Secure by Default

Every service validates:

- authentication
- authorization
- business rules

before accessing or modifying data.

---

# Learning Objectives

This project is intentionally built as a learning platform.

Instead of using shortcuts, every feature is implemented in a way that teaches production-level concepts.

Examples include:

- feature architecture
- transactions
- race condition handling
- cursor pagination
- React Query
- cache management
- authorization
- scalable database design

The objective is not only to finish the application, but to understand why each architectural decision was made.

---

# Roadmap

Core backend features remaining:

- Send messages
- Conversation sidebar
- Group conversations
- Optimistic updates
- Infinite scrolling
- Real-time messaging
- Read receipts
- Unread message counts

After the backend is complete, the focus will shift toward:

- Professional UI
- Responsive layouts
- Animations
- UX improvements
- Accessibility
- AI-assisted frontend development

The backend architecture should remain stable while the frontend evolves independently.
