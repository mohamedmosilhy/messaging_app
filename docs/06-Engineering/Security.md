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

## Authorization rules

- Page redirects are experience controls.
- Service/API checks are security controls.
- Every new real-time subscription must repeat participant authorization.
- Every future edit/delete/read command must verify the target belongs to the
  authorized conversation.
- Blocking must be checked at send time.

## Input security

- Validate every request body and query/cursor.
- Limit message, bio, display-name, username, and search lengths.
- Validate avatar URLs or own the upload pipeline.
- Do not render user text through `dangerouslySetInnerHTML`.
- Reject malformed JSON with `400`.

## Abuse controls

Before public deployment, rate limit:

- login;
- registration;
- user search;
- conversation opening;
- message sending;
- socket connection/subscription;
- typing events.

Add monitoring for brute-force attempts, spam, and abnormal connection volume.

## Browser and transport security

- HTTPS only in production.
- Secure Auth.js secrets and cookie configuration.
- Add security headers and Content Security Policy.
- Restrict image and connection sources.
- Review CSRF behavior for state-changing HTTP endpoints.
- Avoid secrets in client bundles.

## Data and logs

- Never log passwords, tokens, or full sensitive bodies.
- Redact personal information in monitoring.
- Add request IDs.
- Define account deletion and data retention before implementing them.
- Back up the database and test restore.

## Real-time security

- Authenticate the connection.
- Authorize each subscription.
- Do not trust client sender IDs.
- Apply payload size and event-rate limits.
- Publish only committed, user-safe DTOs.
- Remove access when membership changes.
- Treat presence as privacy-sensitive.

## Recommended review before launch

- dependency and secret scanning;
- authorization integration tests;
- rate-limit tests;
- CSP and header verification;
- session-expiration review;
- SQL/query performance abuse review;
- privacy and retention documentation.
