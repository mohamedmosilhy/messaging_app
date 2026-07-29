# Error Handling

## Domain error hierarchy

`AppError` extends `Error` and carries:

- a user-safe message;
- an HTTP status code;
- optional field errors.

Current subclasses:

| Error               | Status | Use                                      |
| ------------------- | -----: | ---------------------------------------- |
| `ValidationError`   |    400 | Invalid business input                   |
| `UnauthorizedError` |    401 | Missing authentication                   |
| `ForbiddenError`    |    403 | Authenticated but disallowed action      |
| `NotFoundError`     |    404 | Missing or intentionally hidden resource |
| `ConflictError`     |    409 | Unique or state conflict                 |

## Route handling

Each route catches `AppError` and serializes its safe information. Unexpected
exceptions become:

```json
{
  "success": false,
  "message": "Internal server error."
}
```

This prevents raw database or stack information from reaching the client.

## Field errors

Zod errors are converted with `formatZodErrors`. Registration and profile edit
routes can return field-specific feedback.

The current system uses `Record<string, string>`, which is simple for forms.
Nested or repeated fields would need a richer representation later.

## Client behavior

Some request functions check `res.ok` and throw only a generic message. That
means useful backend error details can be lost before reaching the component.
Other form requests parse and return the backend error body.

## Recommended shared contract

```ts
type ApiError = {
  success: false;
  code: string;
  message: string;
  fields?: Record<string, string>;
  requestId?: string;
};
```

Benefits:

- components can branch on stable codes without matching prose;
- field errors remain available;
- logs can be connected to a user-visible request ID;
- all client fetch helpers can share one parser.

## Edge cases

- Invalid JSON should return `400`, not `500`.
- Invalid cursor dates should return `400`.
- Prisma unique conflicts should map to the correct field.
- Aborted client requests should not show alarming toasts.
- An expired session should trigger one consistent login flow.
- Failed optimistic sends should keep actionable UI state.
- Non-participant access should remain indistinguishable from a missing thread.

## Logging recommendations

- Log unexpected server errors with structured context and request ID.
- Never log passwords, auth tokens, or full sensitive bodies.
- Avoid routine `console.log` in route handlers.
- Separate validation noise from operational failures.
- Add production error monitoring only after defining data-redaction rules.
