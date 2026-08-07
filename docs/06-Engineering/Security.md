# Security

## Existing controls

- Passwords are hashed with bcrypt.
- Login does not reveal whether email or password was wrong.
- Authenticated identity comes from Auth.js, not request body user IDs.
- Participant access is checked before conversation/message reads and sends.
- Inaccessible conversations return not-found.
- Public Prisma selections exclude password hash and email.
- Registration input is strict and normalized.
- Database uniqueness protects identity and conversation races.
- User text is currently rendered as React text.
- Missing-user login performs a dummy bcrypt comparison to reduce account
  enumeration through timing.
- Sensitive operations use hashed, database-backed rate-limit identifiers.
- API failures carry request IDs without exposing production internals.
- Production responses include CSP, HSTS, framing, MIME, referrer, and browser
  permissions policies.

## Authorization rules

- Page redirects are experience controls.
- Service/API checks are security controls.
- Every new real-time subscription must repeat participant authorization.
- Every future edit/delete/read command must verify the target belongs to the
  authorized conversation.
- Blocking is checked during discovery, conversation opening, and every send.
- Block/unblock commands authenticate the caller, mutate only the caller-owned
  direction, reject self/missing targets, and are rate limited.
- Relationship status does not disclose that the other account initiated a
  reverse-direction block.

## Input security

- Validate every request body and query/cursor.
- Limit message, bio, display-name, username, and search lengths.
- Validate avatar URLs or own the upload pipeline.
- Do not render user text through `dangerouslySetInnerHTML`.
- Reject malformed JSON with `400`.

## Abuse controls

Implemented database-backed limits:

- login;
- registration;
- user search;
- conversation opening;
- message sending;
- message-history reads.
- blocking mutations.

Real-time connection opens are authenticated and rate limited. Event batches
require both a current-user delivery and current conversation participation.
Future typing events will need their own rate limit.

Vercel function logs provide correlated unexpected-error events. A dedicated
security analytics product is still recommended for sustained brute-force,
spam, and abnormal-volume alerting.

## Browser and transport security

- HTTPS only in production.
- Secure Auth.js secrets and cookie configuration.
- Security headers and Content Security Policy are configured centrally.
- Restrict image and connection sources.
- Review CSRF behavior for state-changing HTTP endpoints.
- Avoid secrets in client bundles.

## Data and logs

- Never log passwords, tokens, or full sensitive bodies.
- Redact personal information in monitoring.
- Request IDs are attached at the proxy and returned with API errors.
- Define account deletion and data retention before implementing them.
- Back up the database and test restore.

## Real-time security

- The same-origin SSE connection uses the Auth.js session.
- Each event query verifies delivery ownership and current participation.
- Do not trust client sender IDs.
- Connection opens are database-rate-limited.
- Publish only committed, user-safe DTOs.
- Remove access when membership changes.
- Treat presence as privacy-sensitive.

## Recommended review before launch

- automated dependency and secret scanning;
- authorization integration tests;
- rate-limit tests;
- continued CSP and header verification when adding third-party resources;
- session-expiration review;
- SQL/query performance abuse review;
- privacy and retention documentation.
