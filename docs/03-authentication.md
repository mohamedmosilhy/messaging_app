# 03 - Authentication

# Introduction

Authentication answers one question:

> **Who is making this request?**

Before any protected operation is executed, the application must identify the current user.

Examples:

- Search users
- Open conversations
- Load conversations
- Load messages
- Send messages

All of these operations require a logged-in user.

Authentication is responsible for identifying the user.

Authorization (covered later) is responsible for checking whether that user is allowed to perform a specific action.

---

# Authentication Flow

The authentication flow looks like this:

```text
User enters email & password

↓

POST /api/auth/login

↓

Validate credentials

↓

Generate JWT

↓

Store JWT inside HTTP-only cookie

↓

Browser automatically sends cookie

↓

Protected API Route

↓

requireCurrentUserId()

↓

Business Logic
```

---

# Login Flow

## Step 1

The user submits

```text
Email

Password
```

---

## Step 2

The login service

- validates input
- finds the user
- compares passwords

using

```ts
bcrypt.compare();
```

The password stored in the database is **never** plain text.

Only the hash is stored.

---

## Step 3

If the password is correct

A JWT is generated.

Example payload

```json
{
  "userId": "cmabc123..."
}
```

The JWT becomes the user's identity.

---

## Step 4

The JWT is stored inside an HTTP-only cookie.

Example

```text
Set-Cookie

token=xxxxx
```

The browser stores it automatically.

JavaScript cannot read this cookie.

---

# Why HTTP-only Cookies?

This is one of the most important security decisions.

Advantages

- JavaScript cannot access the token.
- XSS attacks cannot steal it.
- Browser automatically sends it.
- Safer than localStorage.

Because of this

The frontend never manually stores authentication tokens.

---

# Subsequent Requests

Every protected request automatically includes

```text
Cookie

↓

JWT

↓

API
```

The frontend does nothing special.

The browser handles it automatically.

---

# Protected Route Flow

Example

```text
GET /api/conversations
```

The browser sends

```text
Cookie

↓

JWT

↓

Route Handler
```

The route calls

```ts
requireCurrentUserId();
```

---

# requireCurrentUserId()

This utility is used throughout the project.

Responsibilities

- Read cookie
- Verify JWT
- Extract userId
- Return current user

Example

```text
Cookie

↓

JWT

↓

Verify Signature

↓

Extract userId

↓

Return userId
```

Every protected service starts here.

---

# Why Every Service Calls It

Example

Instead of trusting

```json
{
  "userId": "abc123"
}
```

coming from the frontend

we completely ignore it.

Instead

we determine

```text
Current User

↓

JWT

↓

Cookie
```

The client never tells us who they are.

The server decides.

---

# Why This Is Important

Imagine someone sends

```json
{
  "userId": "john"
}
```

without authentication.

If we trusted that request

they could become John.

Instead

the server ignores all user IDs coming from the client.

Only the JWT determines identity.

---

# Authentication vs Authorization

These two concepts are often confused.

Authentication

asks

```text
Who are you?
```

Authorization

asks

```text
Are you allowed?
```

Example

Loading messages

Authentication

```text
Is the user logged in?
```

Authorization

```text
Does the user participate
in this conversation?
```

Both checks are required.

---

# Unauthorized Requests

If no valid JWT exists

the request immediately fails.

Example

```text
requireCurrentUserId()

↓

No Cookie

↓

UnauthorizedError

↓

401
```

No business logic executes.

---

# Why We Throw Errors

Instead of returning

```ts
return null;
```

we throw

```ts
UnauthorizedError;
```

Advantages

- Cleaner code
- Consistent responses
- Centralized error handling

Every protected service behaves the same.

---

# Route Handler Responsibilities

Routes never verify authentication manually.

Instead

they call

```ts
requireCurrentUserId();
```

or a service that calls it.

The route remains extremely small.

---

# Authentication Pattern

Every protected service follows the same structure.

```text
Authentication

↓

Validation

↓

Authorization

↓

Business Rules

↓

Database

↓

Return Response
```

Notice

Authentication always comes first.

---

# Current Authentication Utilities

Currently the project uses

```text
Login

Logout

JWT

HTTP-only Cookies

requireCurrentUserId()
```

These utilities provide everything required for the application's protected endpoints.

---

# Security Decisions

## Passwords

Never stored directly.

Stored using

```text
bcrypt hash
```

---

## Identity

Never taken from the client.

Always extracted from JWT.

---

## Cookies

Stored as

HTTP-only

to prevent JavaScript access.

---

## Authentication

Performed inside every protected service.

Never skipped.

---

# Authentication Philosophy

Authentication should be invisible to the rest of the application.

Components do not know about JWTs.

Hooks do not know about cookies.

Services simply ask

```ts
const currentUserId = await requireCurrentUserId();
```

Everything else is handled internally.

This makes authentication reusable, consistent, and easy to maintain.

---

# Summary

Authentication identifies the current user using a JWT stored in an HTTP-only cookie.

Every protected request automatically includes the cookie.

Every protected service retrieves the current user's identity using `requireCurrentUserId()` before executing any business logic.

Identity is always determined by the server—not by client-provided data—making the system significantly more secure and ensuring a single, consistent authentication flow throughout the application.
