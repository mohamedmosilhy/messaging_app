# Database Design

## Schema

The PostgreSQL schema is defined in `prisma/schema.prisma` and currently
contains:

- `User`;
- `Conversation`;
- `Participation`;
- `Message`;
- `Block`;
- `RateLimitBucket`;
- `ConversationType`.

Prisma Client is generated into `generated/prisma`, and the application uses
the PostgreSQL driver adapter.

## Constraints

### Unique constraints

- `User.email`;
- `User.username`;
- `Conversation.participantKey`;
- `Conversation.lastMessageId`;
- participation composite key;
- block composite key;
- `Message(senderId, clientId)`;
- `RateLimitBucket.key`.

The `participantKey` constraint is especially important because service-level
checks alone cannot prevent two simultaneous requests from creating duplicates.

### Current indexes

- `Conversation.lastMessageAt`;
- `Participation.conversationId`;
- `Message(conversationId, createdAt, id)`;
- `RateLimitBucket.expiresAt`.

The participation primary key begins with `userId`, which supports retrieving a
user's participations.

The history query filters by conversation and orders/cursors by creation time
and ID. Its implemented index matches that access path:

```prisma
@@index([conversationId, createdAt, id])
```

The seeded three-page history query was measured with `EXPLAIN ANALYZE`.
PostgreSQL selected an index-only backward scan, returned 21 rows with zero
heap fetches, and completed in approximately 0.05 ms locally. Production-scale
query insights should still be monitored.

## Transaction boundaries

### Open conversation

Creating a direct thread and its two participations happens in one transaction.
If the unique key loses a race, the service retrieves the winner.

### Send message

One transaction:

1. creates the message;
2. updates `lastMessageAt` and `lastMessageId`;
3. increments unread counts for other participants.

This avoids a stored message with a stale inbox preview or missing unread
increment.

## Cursor behavior

Message queries order by:

```text
createdAt DESC
id DESC
```

The next page requests values lower than the cursor timestamp, or the same
timestamp with a lower ID. The service requests `limit + 1`, removes the extra
record, creates the next cursor from the last retained message, and reverses
the returned page into chronological display order.

## Seed strategy

`prisma/seed.ts` creates realistic development scenarios rather than only
minimal rows. It includes long conversations, equal timestamps, missing
profile values, blocks, unread counts, and enough search matches for pagination.

The seed deletes existing application data. It is development/test tooling and
must not run against valuable data.

## Migration notes

The Phase 4 migration adds `Message.clientId`, backfills existing messages from
their unique server IDs, creates the sender/client unique key, and replaces the
single-column history index with the stable cursor index. Future read markers
must also be introduced through migrations, not manual production schema edits.

The Phase 6 migration adds shared fixed-window rate-limit buckets. Identifiers
are hashed before storage, new windows clean expired rows, and the expiry index
supports bounded cleanup.

## Recommendations

- decide foreign-key deletion behavior before implementing deletion;
- consider `lastReadMessageId` on participation;
- validate database constraints against group-chat plans;
- continue measuring high-volume queries with production-like data.
