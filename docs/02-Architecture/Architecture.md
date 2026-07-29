# Application Architecture

## Why I structured it this way

I wanted the application to have boundaries that remain useful as the product
grows. Pages should not contain database queries, route handlers
should not own business rules, and components should not manually synchronize
server state.

The project therefore uses a feature-based structure with a layered request
flow.

```text
Page or component
        |
        v
React Query hook / client request
        |
        v
Next.js route handler
        |
        v
Feature service
        |
        v
Prisma query or transaction
        |
        v
PostgreSQL
```

## Layers

### Presentation

Locations:

- `app/(pages)`
- `app/features/*/components`
- `app/globals.css`

Responsibility:

- route composition;
- rendering;
- form interactions;
- responsive layout;
- accessibility;
- visual states.

The current presentation is the complete premium dark Relay interface and is
covered on desktop and mobile.

### Client server-state

Locations:

- `app/features/messaging/hooks`
- `app/hooks`
- `app/providers/QueryProvider.tsx`

Responsibility:

- fetching and caching;
- pagination;
- mutation state;
- optimistic updates;
- invalidation and reconciliation.

React Query is used because conversations and messages are server state, not
global client-owned state.

### Client transport

Location:

- `app/features/*/actions`

Responsibility:

- construct fetch requests;
- encode query parameters and JSON;
- interpret HTTP success/failure;
- return typed response payloads.

These files are called actions in the current project, but most are client
request functions rather than Next.js Server Actions.

### HTTP boundary

Location:

- `app/api`
- `proxy.ts`

Responsibility:

- read route params, search params, and request bodies;
- validate transport input;
- call one feature service;
- map domain errors to HTTP responses.
- correlate requests and attach defensive response headers.

### Application/domain services

Location:

- `app/features/*/services`

Responsibility:

- authenticate;
- validate business input;
- authorize access;
- enforce business rules;
- coordinate Prisma queries and transactions;
- return stable application responses.

### Persistence

Locations:

- `app/lib/prisma.ts`
- `app/lib/rate-limit.ts`
- `prisma/schema.prisma`
- `prisma/migrations`

Responsibility:

- relational integrity;
- unique constraints;
- indexes;
- transactions;
- durable application state.
- shared abuse limits across serverless instances.

## Feature boundaries

```text
features/
  auth/
    actions/
    components/
    schemas/
    services/
    types/
  users/
    actions/
    components/
    schemas/
    services/
    types/
  messaging/
    actions/
    components/
    hooks/
    services/
    types/
    utils/
```

The feature directory exports its intended public surface through `index.ts`
where used. Shared errors, providers, and cross-feature utilities stay outside
individual features.

## Server and client components

Server components are useful for session-aware page entry and direct service
reads. Client components are introduced where forms, React Query, local state,
or browser APIs are required.

The next UI should keep this boundary deliberate:

- verify protected layouts on the server;
- use client components only around interactive workspaces and forms;
- do not mark whole page trees as client components without need.

## Security boundary

Page redirects improve experience but are not authorization. Services and API
handlers must continue to enforce authentication and participation. Returning
not-found for a non-participant avoids confirming whether another person's
conversation ID exists.

## Recommendation

Keep the architecture. Improve consistency rather than rewriting it:

- add shared API error serialization;
- add Zod schemas for every route input;
- use query-key factories;
- introduce a development-safe Prisma singleton;
- centralize the protected page layout;
- add tests at service boundaries.
