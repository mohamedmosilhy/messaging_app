# Messaging App Architecture Documentation

## 1. Overall Architecture

Our application follows a layered architecture.

```text
                Browser
                    │
                    ▼
        React Components (Pages/UI)
                    │
                    ▼
          Client Actions (fetch)
                    │
                    ▼
            API Route (HTTP Layer)
                    │
                    ▼
         Service (Business Logic)
                    │
                    ▼
        Prisma ORM (Database Layer)
                    │
                    ▼
             PostgreSQL Database
```

Each layer has **one responsibility**.

---

# 2. Folder Philosophy

Instead of organizing by file type, we organize by **feature**.

```text
app/

features/
    auth/
    users/
    conversations/
    messages/

lib/
utils/
hooks/
```

This scales much better than putting all services together or all components together.

---

# 3. Request Flow

Every feature follows exactly the same flow.

```text
User clicks button

↓

React Component

↓

Client Action

↓

API Route

↓

Service

↓

Prisma

↓

Database

↓

Response

↓

React updates UI
```

The frontend **never** talks directly to Prisma.

---

# 4. Authentication Module

## Register

Flow:

```text
Register Form

↓

POST /api/auth/register

↓

registerUser()

↓

Validate with Zod

↓

Hash password

↓

Create User

↓

Return success
```

---

## Login

Flow:

```text
Login Form

↓

signIn("credentials")

↓

NextAuth authorize()

↓

verifyCredentials()

↓

Compare bcrypt password

↓

JWT callback

↓

Session callback

↓

Browser receives session cookie
```

---

## Every authenticated request

```text
Browser sends cookie

↓

auth()

↓

JWT decoded

↓

session.user.id

↓

requireCurrentUserId()

↓

Service
```

This means:

Every authenticated service starts with

```ts
const currentUserId = await requireCurrentUserId();
```

---

# 5. User Module

We built four services.

---

## Current User

Purpose

> Return the logged-in user's own profile.

Flow

```text
GET /api/auth/me

↓

getCurrentUser()

↓

requireCurrentUserId()

↓

Prisma

↓

Return DTO
```

---

## Public Profile

Purpose

> View another user's profile.

Flow

```text
/users/:username

↓

GET /api/users/:username

↓

getUserProfile(username)

↓

Prisma

↓

Return public data
```

---

## Edit Profile

Purpose

> Logged-in user edits themselves.

Flow

```text
Edit Form

↓

PATCH /api/auth/me

↓

Validation

↓

editProfile()

↓

Prisma.update()

↓

Return updated profile
```

---

## Search Users

Purpose

> Find other users.

Flow

```text
Search Input

↓

Debounce

↓

React Query

↓

GET /api/users/search

↓

searchUsers()

↓

Prisma

↓

Return users
```

Important business rules:

- Cannot search yourself.
- Cannot search blocked users.
- Blocked users cannot find you.
- Supports pagination.
- Supports cursor.
- Supports limit.

---

# 6. Error Handling

Every service throws exceptions.

Example

```ts
throw new ValidationError(...)
```

or

```ts
throw new UnauthorizedError();
```

Routes catch them.

```text
Service

↓

throws

↓

Route catches

↓

JSON response
```

Business logic never builds HTTP responses.

---

# 7. Validation

Every request is validated before business logic.

Example

```text
Request

↓

Zod

↓

Valid?

↓

Service
```

Never trust frontend input.

---

# 8. React Query

Purpose

Avoid manually managing

- loading
- caching
- refetching

Instead of

```text
useState

↓

fetch

↓

loading

↓

error
```

we now use

```text
useQuery

↓

queryKey

↓

queryFn

↓

cache
```

---

## queryKey

Example

```ts
["users", query];
```

Different query

↓

Different cache

```text
users/mo

users/jo

users/ah
```

All cached separately.

---

## queryFn

Responsible only for fetching.

Example

```ts
searchUsersRequest(...)
```

---

## enabled

Stops unnecessary requests.

Example

Don't search when

```text
query === ""
```

---

# 9. Debounce

Without debounce

```text
m

mo

moh

moha

moham

...
```

Six requests.

With debounce

Only one request.

---

# 10. Prisma Layer

Prisma is only used inside services.

Never inside

- Components
- API routes
- Hooks

Only services know about the database.

---

# 11. DTOs

Every service returns typed objects.

Example

```ts
CurrentUserResponse;
```

instead of

```ts
any;
```

The frontend knows exactly what it receives.

---

# 12. Current Project Structure

```text
Messaging App

Authentication
    Register
    Login
    JWT
    Session
    Logout
    Route Protection

Users
    Current User
    Public Profile
    Edit Profile
    Search

Infrastructure
    Prisma
    API Routes
    Services
    React Query
    Debounce
    Validation
    Error Handling
```

---

# 13. Patterns We Established

Every feature follows the same recipe.

```text
Types

↓

Validation

↓

Service

↓

Route

↓

Client Action

↓

Component

↓

Page
```

Whenever we build a new feature, we'll follow this order.

---

# 14. What's Next?

The next module is **Conversations**.

We'll build it exactly like we built Users.

```text
Conversation

↓

Types

↓

Validation

↓

Service

↓

Route

↓

Client Action

↓

React Query

↓

Component

↓

Page
```

The first service will be:

```text
Open or Create Conversation
```

because every message must belong to a conversation.

---

## One final piece of advice

Don't try to memorize function names or exact Prisma syntax.

Instead, memorize the questions you ask yourself when building a feature:

1. **What is the business rule?**
2. **What request does the frontend send?**
3. **What should the service validate?**
4. **What should Prisma query or update?**
5. **What response should the service return?**
6. **How does the frontend display that response?**

If you can answer those six questions, you can rebuild almost any feature—even if you've forgotten the exact code. That's the skill that scales as projects become larger.
