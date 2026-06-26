# Messaging App

> A full-stack messaging application built as a learning project to practice designing and building scalable web applications from scratch.

---

# Overview

This project is a simplified messaging application inspired by apps such as WhatsApp, Telegram, Messenger, and Discord. The goal is **not** to clone every feature of these applications, but to learn how experienced engineers design and build a real-world full-stack application.

Instead of jumping directly into coding, the project follows an engineering-first approach where the architecture, database, API contracts, and business rules are designed before implementation begins.

The project is intentionally built as an **MVP (Minimum Viable Product)**. Features that are not essential for the first version are postponed until the core application is complete.

---

# Goals

The primary goals of this project are:

- Learn how to design a backend before writing code.
- Practice building a feature-based architecture.
- Understand the difference between client state and server state.
- Learn how to design REST APIs.
- Practice database modeling and relationships.
- Build a modern full-stack application using Next.js.
- Gain experience with React Query, Prisma, PostgreSQL, and authentication.
- Learn how to think about software architecture rather than only implementation.

---

# MVP Features

## Authentication

- Register
- Login
- Logout
- Get current authenticated user

---

## User Management

- Search users
- View user profiles
- Edit profile
- Block users
- Unblock users

---

## Messaging

- View conversation list
- View conversation messages
- Send messages
- Automatically create a conversation when the first message is sent
- Cursor-based pagination for conversations and messages
- Polling for new messages

---

# Features Not Included in MVP

The following features are intentionally postponed until after the MVP is complete:

- Group chats
- Avatar uploads
- Message deletion
- Message editing UI
- Read receipts
- Online status
- Typing indicators
- Notifications
- Real-time messaging using WebSockets
- File sharing
- Voice messages
- Emoji reactions

---

# Technology Stack

| Technology  | Purpose                               |
| ----------- | ------------------------------------- |
| Next.js     | Full-stack React framework            |
| TypeScript  | Static typing                         |
| PostgreSQL  | Relational database                   |
| Prisma      | ORM                                   |
| React Query | Server state management and caching   |
| Zod         | Request validation                    |
| Auth.js     | Authentication and session management |

---

# Why This Stack?

### Next.js

Provides both frontend and backend capabilities in a single project through Route Handlers. This keeps the application simple while still allowing it to scale.

### PostgreSQL

A relational database fits the application's highly connected data model, including users, conversations, participants, messages, and blocks.

### Prisma

Simplifies database access while providing excellent TypeScript support and migrations.

### React Query

Handles server state such as users, conversations, and messages. It provides caching, background refetching, loading states, and cache invalidation without requiring manual state management.

### Zod

Ensures incoming request data is validated before reaching the business logic.

### Auth.js

Provides session management and authentication while allowing future expansion to additional authentication providers.

---

# Project Architecture

The application follows a **feature-based architecture**.

```
app/
features/
shared/
prisma/
```

Each feature contains everything related to itself.

Example:

```
features/
    auth/
        api/
        services/
        components/

    users/
        api/
        services/
        components/

    messaging/
        api/
        services/
        components/
```

Shared code is placed inside the `shared` directory instead of being duplicated across features.

---

# Request Flow

Every request follows the same architecture.

```
UI
    ↓
React Query
    ↓
API Layer
    ↓
Service Layer
    ↓
Prisma
    ↓
PostgreSQL
```

Each layer has a single responsibility.

- UI renders data.
- React Query fetches and caches server state.
- API routes validate requests and authentication.
- Services contain business logic.
- Prisma communicates with the database.

---

# Core Business Rules

Some important decisions made during planning include:

- Conversations never exist without at least one message.
- The first message automatically creates a conversation if one does not already exist.
- Direct conversations are unique between two users.
- Blocking prevents sending future messages but does not delete existing conversations or messages.
- Usernames are unique and case-insensitive.
- Display names are separate from usernames.
- Search is case-insensitive and supports partial matching.
- Conversations are ordered by the time of the latest message.
- Pagination uses cursors instead of page numbers.
- React Query manages server state.
- Client state is kept local unless shared globally.

---

# Development Roadmap

The project will be implemented in the following order:

1. Project setup
2. Database schema
3. Authentication
4. Users feature
5. Messaging backend
6. Frontend pages
7. React Query integration
8. Testing
9. UI polish

Each phase depends on the previous one to reduce rework and keep the implementation incremental.

---

# Learning Objectives

This project focuses on learning software engineering concepts rather than simply building a messaging application.

Topics covered include:

- Feature-based architecture
- Database design
- API design
- REST principles
- Authentication
- Authorization
- React Query
- Transactions
- Idempotency
- Pagination
- Polling
- Business logic organization
- Separation of concerns
- Backend architecture
- Frontend architecture

---

# Current Status

**Planning Phase:** ✅ Completed

Completed during planning:

- Product requirements
- Database design
- API contracts
- Folder structure
- Technology selection
- Authentication design
- User feature design
- Messaging feature design
- Development roadmap

The next phase is implementation.

---

# Future Improvements

After completing the MVP, possible enhancements include:

- Group conversations
- Real-time messaging using WebSockets
- Read receipts
- Online presence
- Typing indicators
- Message editing
- Message deletion
- File uploads
- Notifications
- Avatar uploads
- Better profile customization

---

# Final Notes

The purpose of this repository is not only to build a messaging application, but also to document the thought process behind designing a real-world software system.

Every architectural decision in this project was made after considering trade-offs, simplicity, and future extensibility. The emphasis throughout the project is on understanding **why** a design is chosen, not only **how** to implement it.

This repository serves as both a working application and a learning resource for modern full-stack application development.
