# Glossary

## Application terms

**Current user**  
The authenticated account making a request.

**Public profile**  
User ID, username, display name, bio, and avatar URL. It excludes email and
password hash.

**Direct conversation**  
A thread intended for exactly two users.

**Participant key**  
The two direct-user IDs sorted and joined. It uniquely identifies the pair.

**Participation**  
The membership record connecting a user and conversation. It also stores
per-user conversation state such as the current unread count.

**Latest-message metadata**  
`lastMessageId` and `lastMessageAt` stored on a conversation to make inbox
preview and ordering efficient.

**Cursor**  
An opaque position used to request the next result page. Message cursors use
timestamp and ID for stable ordering.

**Optimistic update**  
A client cache change performed before the server confirms success.

**Eager cache update**  
A direct cache update after success, avoiding a wait for refetched data. This
describes the current inbox update.

**Reconciliation**  
Making optimistic/cache state agree with authoritative server state.

**Idempotency**  
The property that retrying the same command does not create duplicate effects.

**Read marker**  
A stable record of the latest message a participant has read, proposed as an
alternative/foundation to mutable unread counters.

**Block direction**

One caller-owned `blockerId -> blockedId` relationship. Either direction makes
interaction unavailable, but a user can remove only the direction they own.

**Interaction status**

The privacy-safe blocking DTO: whether the current user owns a block plus a
combined indication of whether the pair can currently discover/message.

## Architecture terms

**Route handler**  
The Next.js HTTP entry that parses a request and serializes a response.

**Service**  
The application layer that owns authentication, authorization, rules, and
persistence orchestration.

**Server state**  
Data owned by the backend/database and cached in the browser through React
Query.

**Client state**  
Temporary browser-owned data such as drafts, open menus, and scroll state.

**DTO**  
The selected data shape transferred between server and client.

**Domain error**  
An expected application failure such as validation, unauthorized access, or
conflict.

**Source of truth**  
The authoritative state. For durable messages, this is PostgreSQL through the
service layer, not a socket or optimistic cache.
