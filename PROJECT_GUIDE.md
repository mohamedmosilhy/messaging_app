# PROJECT_GUIDE.md

# Messaging App - Project Guide

> This document summarizes every important design decision made before implementation. It explains not only **what** was chosen, but **why** it was chosen. It serves as the project's blueprint and learning reference.

---

# Table of Contents

1. Project Goals
2. Design Philosophy
3. System Architecture
4. Database Design
5. Business Rules
6. API Design
7. Frontend Architecture
8. Backend Architecture
9. React Query Strategy
10. Authentication
11. Development Roadmap
12. Testing Checklist
13. Future Improvements
14. Lessons Learned

---

# 1. Project Goals

The objective of this project is to learn how to design and implement a modern full-stack application using engineering principles rather than jumping directly into coding.

The focus is on:

- Planning before implementation
- Clean architecture
- Separation of concerns
- Good database design
- REST API design
- State management
- Scalability
- Maintainability

The project intentionally targets an MVP instead of a production-ready messaging platform.

---

# 2. Design Philosophy

Throughout the planning phase, several principles guided every decision.

## Simplicity over complexity

The application should solve today's requirements without introducing unnecessary abstractions.

Examples:

- No repository layer until it becomes valuable.
- No WebSockets in the MVP.
- No microservices.
- No premature optimization.

---

## Build for extension

Although the MVP remains simple, the architecture should allow future features such as:

- Group chats
- Read receipts
- Online status
- Notifications
- Avatar uploads

without requiring a complete redesign.

---

## Server state belongs to React Query

Whenever data is owned by the server, React Query manages it.

Examples:

- Current user
- Conversations
- Messages
- Search results

Client-only UI state remains local unless shared globally.

---

## Business logic belongs in services

Responsibilities are separated as follows:

UI

- Displays data
- Handles user interaction

React Query

- Fetches and caches data

API Layer

- Validates requests
- Checks authentication
- Calls services

Service Layer

- Business rules
- Authorization
- Database transactions

Prisma

- Database communication

---

# 3. System Architecture

Every request follows the same flow.

UI

↓

React Query

↓

API Route

↓

Service

↓

Prisma

↓

PostgreSQL

Each layer has one responsibility.

---

# 4. Database Design

## User

Fields

- id
- email
- username
- displayName
- passwordHash
- bio
- avatarUrl
- createdAt
- updatedAt

Rules

- Email is unique.
- Username is unique.
- Username is stored in lowercase.
- Display name preserves capitalization.
- Display name defaults to username.
- Bio is optional.
- Avatar is optional.

Indexes

- email
- username

---

## Conversation

Fields

- id
- type
- title
- participantKey
- lastMessageId
- lastMessageAt
- createdAt
- updatedAt

Rules

- Direct conversations have no title.
- Group conversations require a title.
- Conversations never exist without a message.
- Direct conversations are unique using participantKey.
- Conversations are ordered by lastMessageAt.

---

## Participation

Fields

- userId
- conversationId
- createdAt

Rules

- Composite primary key.
- Prevents duplicate participants.

---

## Message

Fields

- id
- conversationId
- senderId
- content
- createdAt
- updatedAt

Rules

- Messages cannot be empty.
- Maximum length is 1000 characters.
- Sender cannot be deleted.
- Messages belong to one conversation.

Indexes

- (conversationId, createdAt DESC)

---

## Block

Fields

- id
- blockerId
- blockedId
- createdAt

Rules

- One block record per user pair.
- Composite unique(blockerId, blockedId).

---

# 5. Business Rules

Authentication

- Sessions identify authenticated users.
- Protected endpoints require authentication.
- Logout is idempotent.

Users

- Search is case-insensitive.
- Search supports partial matching.
- Search excludes blocked users.
- Users may edit username, display name, bio and avatar.
- Username changes must remain unique.

Messaging

- First message creates the conversation.
- Existing conversations are reused.
- Duplicate direct conversations are prevented.
- Only participants may send messages.
- Blocked users cannot exchange new messages.
- Existing history remains visible.
- Conversations are sorted by the latest message.

Blocking

- Blocking is idempotent.
- Unblocking is idempotent.
- Blocking never deletes messages.

---

# 6. API Design

Authentication

POST /api/auth/register

POST /api/auth/login

POST /api/auth/logout

GET /api/auth/me

---

Users

GET /api/users/search

GET /api/users/:id

PATCH /api/users/me

POST /api/users/:id/block

DELETE /api/users/:id/block

---

Messaging

GET /api/conversations

GET /api/conversations/:id/messages

POST /api/messages

---

Response Format

Successful response

```json
{
  "success": true,
  "message": "Operation completed successfully."
}
```

Validation error

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": {}
}
```

---

# 7. Frontend Architecture

Pages

- Landing
- Login
- Register
- Dashboard
- Search
- Profile
- Conversation View

Feature structure

features/

auth/

users/

messaging/

Each feature contains:

- api
- services
- components

---

# 8. Backend Architecture

Responsibilities

API Routes

- Authentication
- Validation
- Call services

Services

- Business rules
- Authorization
- Transactions

Prisma

- Database operations

The API layer should remain thin while the service layer contains application logic.

---

# 9. React Query Strategy

Queries

- Current user
- Search users
- Conversations
- Messages

Mutations

- Register
- Login
- Logout
- Edit profile
- Block
- Unblock
- Send message

Cache updates

- Append newly sent messages.
- Update conversation previews.
- Invalidate affected queries only.

Polling

The MVP uses polling instead of WebSockets for new messages.

---

# 10. Authentication

Authentication uses Auth.js sessions.

Security considerations

- Password hashing
- Generic login errors
- Rate limiting
- Protected routes
- Session-based authentication

The current authenticated user is stored in React Query instead of Zustand.

---

# 11. Development Roadmap

Implementation order

1. Project setup
2. Prisma schema
3. Authentication
4. Users
5. Messaging backend
6. Frontend
7. React Query
8. Testing
9. Polish

Each phase depends on the previous one.

---

# 12. Testing Checklist

Authentication

- Register
- Login
- Logout
- Current user

Users

- Search
- View profile
- Edit profile
- Block
- Unblock

Messaging

- Conversation creation
- Send message
- Pagination
- Duplicate prevention
- Block restrictions

---

# 13. Future Improvements

- Group chats
- WebSockets
- Read receipts
- Typing indicators
- Online presence
- Notifications
- Avatar uploads
- File sharing
- Message deletion
- Message editing
- Push notifications

---

# 14. Lessons Learned

The planning phase was intentionally completed before implementation. Several important software engineering concepts were learned during this process.

## Architecture

- Plan before coding.
- Every layer should have a single responsibility.
- Business rules belong in services.
- APIs should expose resources instead of implementation details.

## Database

- Relationships are designed before writing queries.
- Constraints enforce business rules.
- Indexes are created for common queries rather than every column.

## Frontend

- React Query manages server state.
- Local UI state should remain local.
- Avoid multiple sources of truth.

## Backend

- Validate every request.
- Use transactions when multiple operations must succeed together.
- Design idempotent endpoints when possible.
- Return consistent API responses.

## General

The biggest lesson from this project is that good software is designed before it is implemented.

By investing time in planning, implementation becomes significantly simpler because the difficult architectural decisions have already been made.
