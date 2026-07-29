# Architecture Decisions

This document records why the project works the way it does and which decisions
still need to be finalized.

## Feature-based organization

**Decision:** group code by `auth`, `users`, and `messaging`.

**Reason:** a feature can contain its service, types, validation, requests,
hooks, and UI. This is easier to navigate than separating the whole repository
into one global components folder, one services folder, and one types folder.

## Services own business rules

**Decision:** route handlers remain thin and delegate to services.

**Reason:** authentication, authorization, normalization, transactions, and
business errors can be tested without simulating the UI.

## PostgreSQL and Prisma

**Decision:** use a relational database and Prisma.

**Reason:** users, participations, conversations, messages, and blocks have
clear relational constraints. Transactions and unique keys are essential to
correct messaging behavior.

## JWT sessions

**Decision:** Auth.js uses JWT session strategy.

**Reason:** the application can retrieve identity without a database-backed
session model. Public profile fields are copied into the token for optimistic
message construction.

**Trade-off:** profile changes leave those token fields stale until the session
is explicitly refreshed or renewed.

## One direct conversation per pair

**Decision:** sort both user IDs and store them as a unique `participantKey`.

**Reason:** request order cannot produce two keys, and the database protects
against concurrent duplicate creation.

## Denormalized last-message metadata

**Decision:** store `lastMessageId` and `lastMessageAt` on `Conversation`.

**Reason:** inbox rows need the latest preview and sort order frequently.
Updating this metadata in the send transaction keeps it consistent with message
creation.

## Cursor pagination

**Decision:** message history uses `createdAt + id`, not page numbers.

**Reason:** new messages can arrive while older history is being read. The ID
acts as a tie-breaker when timestamps match.

## React Query for remote state

**Decision:** conversations and messages live in React Query rather than a
general global store.

**Reason:** React Query already handles caching, request lifecycle, pagination,
invalidation, and mutation reconciliation.

## Optimistic messages

**Decision:** insert a temporary message before send completion.

**Reason:** messaging feels unresponsive if every bubble waits for a network
round trip.

**Current implementation:** every send owns a client ID. Failure marks only its
matching bubble, retry reuses the ID, and the database enforces sender-scoped
idempotency.

## Participant authorization returns not-found

**Decision:** missing and unauthorized conversation access share the same
not-found behavior.

**Reason:** a caller should not learn that an inaccessible conversation exists.

## Empty conversation decision

**Current behavior:** opening a new conversation creates it before the first
message.

**Decision still required:** keep this behavior and design an empty thread, or
defer persistence until the first send. The earlier idea that conversations
never exist without messages does not match the current implementation.

## Unread decision

**Current behavior:** each participation stores a mutable count; fetching
conversation detail resets it.

**Decision still required:** before multi-device real-time behavior, consider
`lastReadMessageId` or `lastReadAt`. A read marker is easier to reconcile than
independent counters across clients.

## Recommendation labels

Items described as recommendations are review outcomes, not completed project
features. They should become explicit decisions only when implemented and
tested.

## Shared database-backed rate limits

**Decision:** store hashed fixed-window buckets in PostgreSQL.

**Reason:** in-memory counters do not converge across Vercel serverless
instances. The existing database provides one shared enforcement boundary
without another infrastructure dependency.

**Trade-off:** protected operations add a database write. At larger scale, the
same interface can move to a dedicated distributed rate-limit store.

## Explicit production migrations

**Decision:** run `prisma migrate deploy` separately from preview builds.

**Reason:** concurrent previews should not silently mutate a shared production
schema.

**Trade-off:** releases have one explicit operational step, but migrations stay
reviewable and recoverable.

## Baseline observability without a monitoring vendor

**Decision:** emit structured request-correlated logs, expose database health,
and use Vercel runtime metrics.

**Reason:** this creates an immediately functional baseline without pretending
an unconfigured third-party service is active.

**Trade-off:** dedicated alerting, trace retention, and security analytics are
still recommended as traffic and operational requirements grow.
