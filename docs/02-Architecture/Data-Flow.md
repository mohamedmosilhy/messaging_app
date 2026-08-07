# Data Flow

## Registration

```text
RegisterForm
  -> register client request
  -> POST /api/auth/register
  -> RegisterValidation
  -> register service
  -> normalize email/username
  -> check conflicts
  -> bcrypt hash
  -> Prisma User.create
```

The unique database constraints remain the final protection if two requests
race after the preliminary conflict checks.

## Login and session

```text
LoginForm
  -> Auth.js signIn("credentials")
  -> credentials authorize callback
  -> LoginValidation
  -> verifyCredentials
  -> Prisma User.findUnique
  -> bcrypt.compare
  -> JWT callback
  -> session callback
```

The session exposes ID and public profile fields used throughout the client.

## Search

```text
Search input
  -> 300 ms debounce
  -> useSearchQuery
  -> GET /api/users/search
  -> searchUsers service
  -> authenticated-user exclusion
  -> block filters
  -> case-insensitive prefix query
  -> limited result + nextCursor
```

The current page consumes only the first result page.

## Open direct conversation

```text
Search result action
  -> POST /api/conversations
  -> openConversation
  -> authenticate
  -> reject self
  -> verify target
  -> check either block direction
  -> compute sorted participantKey
  -> return existing conversation
     or transactionally create conversation + participations
  -> recover unique race if needed
  -> navigate to thread
```

## Block and unblock

```text
Profile/thread/settings control
  -> blocking React Query mutation
  -> POST /api/blocks or DELETE /api/blocks/:targetUserId
  -> validate target and authenticate
  -> enforce mutation rate limit
  -> reject self or missing target
  -> idempotently upsert/delete caller-owned Block
  -> return privacy-safe relationship status
  -> reconcile status, blocked-list, and discovery queries
  -> disable/enable the active composer when interaction state changes
```

Existing history remains readable. After unblocking, interaction becomes
available only when the reverse block direction is also absent.

## Read conversation

```text
ConversationContent
  -> conversation query
  -> GET /api/conversations/:id
  -> getConversation
  -> authenticate and require participation
  -> return other participant summary
```

Conversation detail reads are side-effect free. The visible latest-message
marker issues the explicit read command described below.

## Read messages

```text
useConversationMessages
  -> useInfiniteQuery
  -> GET /api/conversations/:id/messages?limit&cursor...
  -> authenticate and require participation
  -> stable cursor query
  -> chronological page + nextCursor
  -> reverse page collection for full chronological UI
```

## Send a message

```text
Composer
  -> useSendMessage.onMutate
  -> cancel message refetch
  -> append temporary message with client ID
  -> POST message
  -> sendMessage service
  -> trim and validate
  -> require participation
  -> return existing sender/client ID when already committed
  -> reject either block direction
  -> transaction:
       create message
       update conversation latest metadata
       increment other unread counts
       advance the sender read marker
       persist durable message/conversation events
  -> replace matching client ID
  -> update inbox preview/order
  -> invalidate inbox
```

On error, only the matching client ID becomes a persistent failed bubble with
retry/remove actions.

## Real-time delivery flow

```text
Committed send transaction
  -> committed message.created + conversation.updated events
  -> authenticated /api/realtime SSE stream
  -> current-participant delivery filter
  -> deduplicate by server and client message IDs
  -> merge into message cache
  -> update inbox cache
```

HTTP remains the source-of-truth fallback for initial loads, reconnection, and
missed events.

## Mark conversation read

```text
Latest committed message becomes visible
  -> POST /api/conversations/:id/read
  -> authenticate and authorize participation
  -> validate the message belongs to the conversation
  -> serializable transaction advances lastReadMessageId only
  -> derive unread messages after the marker
  -> persist conversation.read event
  -> all current-user tabs reconcile the inbox
```
