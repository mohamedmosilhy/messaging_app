# Messaging App Documentation

Last reviewed against the repository: July 29, 2026

I built this messaging application from scratch as a full-stack learning
project. I focused first on the layers below the final UI: data modeling,
authentication, services, API routes, React Query, pagination, unread state,
and optimistic sending. The current pages and components are test interfaces.
My next milestone is a complete responsive presentation inspired by familiar
messaging products, followed by real-time delivery.

These documents explain what I have made, why I made the main decisions, what
is incomplete, and how I plan to continue. Review findings are explicitly
labeled as recommendations so they are not confused with implemented features.

## Recommended reading order

### 1. Product

- [Requirements](./01-Product/Requirements.md) — goals, current requirements,
  non-functional requirements, and boundaries.
- [Features](./01-Product/Features.md) — completed, partial, and future
  features.
- [User Stories](./01-Product/User-Stories.md) — user-centered behavior and
  acceptance criteria.
- [Roadmap](./01-Product/Roadmap.md) — phased delivery plan and definitions of
  done.

### 2. Architecture

- [Application Architecture](./02-Architecture/Architecture.md) — layers,
  feature organization, and boundaries.
- [Architecture Decisions](./02-Architecture/Decisions.md) — why important
  technical choices were made.
- [Domain Model](./02-Architecture/Domain-Model.md) — users, conversations,
  participations, messages, and blocks.
- [Database Design](./02-Architecture/Database.md) — schema, constraints,
  indexes, transactions, and migrations.
- [Data Flow](./02-Architecture/Data-Flow.md) — end-to-end flow for every major
  operation.

### 3. Backend

- [API Reference](./03-Backend/API.md) — endpoints, inputs, responses, and
  status behavior.
- [Services](./03-Backend/Services.md) — application rules implemented by each
  service.
- [Authentication](./03-Backend/Authentication.md) — registration, login,
  Auth.js JWT/session, and protection.
- [Error Handling](./03-Backend/Error-Handling.md) — domain errors, HTTP
  mapping, client behavior, and recommendations.

### 4. Frontend

- [UI Architecture](./04-Frontend/UI-Architecture.md) — current presentation
  status and proposed responsive shell.
- [State Management](./04-Frontend/State-Management.md) — ownership of server,
  session, URL, local, draft, and mutation state.
- [React Query Strategy](./04-Frontend/React-Query-Strategy.md) — query keys,
  infinite history, search, and cache policy.
- [Optimistic Updates](./04-Frontend/Optimistic-Updates.md) — the exact send
  workflow, strengths, and edge cases.
- [Components](./04-Frontend/Components.md) — current components and the
  recommended UI component system.

### 5. Real-time

- [Real-Time Plan](./05-Realtime/Realtime-Plan.md) — prerequisites,
  connection lifecycle, authorization, reconnection, and completion criteria.
- [Events](./05-Realtime/Events.md) — proposed event envelope and contracts.

### 6. Engineering

- [Coding Standards](./06-Engineering/Coding-Standards.md) — conventions for
  TypeScript, React, services, routes, and documentation.
- [Testing](./06-Engineering/Testing.md) — unit, integration, component, E2E,
  and CI strategy.
- [Security](./06-Engineering/Security.md) — existing controls and production
  recommendations.
- [Deployment](./06-Engineering/Deployment.md) — build gate, migrations,
  release, observability, and rollback.

### 7. Reference

I added this section because onboarding and current-state facts do not fit
cleanly into the other categories.

- [Current Status](./07-Reference/Current-Status.md) — precise implementation
  and verification status.
- [Local Setup](./07-Reference/Local-Setup.md) — environment, commands, seed,
  and test accounts.
- [Repository Map](./07-Reference/Repository-Map.md) — where the code lives.
- [Glossary](./07-Reference/Glossary.md) — shared product and engineering
  terminology.

## Documentation map

```text
docs/
├── 01-Product/
├── 02-Architecture/
├── 03-Backend/
├── 04-Frontend/
├── 05-Realtime/
├── 06-Engineering/
├── 07-Reference/
└── README.md
```

## Current project summary

The core architecture and HTTP messaging foundation are real and established.
The strongest completed areas are service separation, participant
authorization, direct-conversation uniqueness, stable message pagination,
transactional send metadata, seeded edge cases, and the first optimistic cache
workflow.

The main unfinished areas are the production presentation layer, automated
tests, concurrency-safe retry/idempotency, complete block behavior, multi-client
read state, and real-time delivery. The roadmap intentionally handles those in
that order.
