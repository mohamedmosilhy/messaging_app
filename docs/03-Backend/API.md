# API Reference

## Response approach

Successful application responses use:

```json
{
  "success": true,
  "data": {}
}
```

Registration returns a success message instead of a data object. Expected
domain errors use:

```json
{
  "success": false,
  "message": "User-safe explanation",
  "errors": {
    "field": "Optional field error"
  }
}
```

The message-send client preserves the server's user-safe error message.
Machine-readable error codes remain a future improvement.

## Authentication

### `POST /api/auth/register`

Creates a new credentials account.

Body:

```json
{
  "username": "mohamed",
  "email": "mohamed@example.com",
  "password": "Test12345"
}
```

Behavior:

- rejects already authenticated callers;
- validates the strict body with Zod;
- normalizes username and email;
- rejects conflicts;
- hashes the password;
- returns `201` on success.

### `/api/auth/[...nextauth]`

Handled by Auth.js for credentials login and session operations.

## Users

### `GET /api/users/me`

Returns the authenticated user:

```json
{
  "success": true,
  "data": {
    "id": "...",
    "email": "...",
    "username": "...",
    "displayName": "...",
    "bio": null,
    "avatarUrl": null
  }
}
```

### `PATCH /api/users/me`

Strict optional fields:

```json
{
  "displayName": "Mohamed Mosilhy",
  "bio": "Full-stack developer",
  "avatarUrl": "https://..."
}
```

The body must contain at least one meaningful field at the service boundary.

### `GET /api/users/search`

Query parameters:

- `query`: required non-empty prefix;
- `limit`: validated as an integer from 1–50;
- `cursor`: optional user ID.

Returns public profiles and `nextCursor`.

## Conversations

### `GET /api/conversations`

Returns all current-user conversation rows ordered by latest activity.

Current response row:

```json
{
  "conversationId": "...",
  "title": "Layla Hassan",
  "unreadCount": 2,
  "avatarUrl": "https://...",
  "lastMessage": "See you tomorrow",
  "lastMessageAt": "2026-07-29T..."
}
```

The endpoint is not currently paginated.

### `POST /api/conversations`

Body:

```json
{
  "targetUserId": "..."
}
```

Returns an existing or newly created direct conversation ID. The route uses a
strict Zod transport schema.

### `GET /api/conversations/:conversationId`

Verifies participation, resets the caller's unread count, and returns the
conversation summary and other participants.

The conversation ID path parameter is validated before the service runs.

## Messages

### `GET /api/conversations/:conversationId/messages`

Query parameters:

- `limit`;
- `cursorId`;
- `cursorCreatedAt`.

Returns:

```json
{
  "success": true,
  "data": {
    "messages": [],
    "nextCursor": {
      "id": "...",
      "createdAt": "..."
    }
  }
}
```

The route requires both cursor fields together and validates the cursor
timestamp before the service runs.

### `POST /api/conversations/:conversationId/messages`

Body:

```json
{
  "clientId": "5e917563-b1db-43df-bfd7-c5cc3f2ff488",
  "content": "Hello"
}
```

The service trims content, rejects empty text, limits stored text to 1,000
characters, verifies participation, rejects blocked pairs, and runs the send
transaction. Repeating the same `clientId` for the same sender returns the
existing message instead of inserting a duplicate.

## Status mapping

`AppError` subclasses provide:

- `400` validation;
- `401` unauthenticated;
- `403` forbidden;
- `404` missing/inaccessible;
- `409` conflict.

Unexpected failures return a generic `500`.

## Recommended API contract work

- add a stable machine-readable error `code`;
- add request correlation IDs and structured server logging;
- add rate limits before public deployment;
