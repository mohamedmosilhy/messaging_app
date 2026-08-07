# Messaging App Documentation

Last reviewed against the repository: August 7, 2026

I built this messaging application from scratch as a full-stack learning
project. I focused first on data modeling, authentication, services, API
routes, React Query, pagination, unread state, and optimistic sending. I then
built the complete premium dark presentation across the public, authentication,
inbox, conversation, discovery, profile, and settings experiences. I then
hardened the HTTP message workflow with idempotency, concurrent optimistic
sends, retryable failures, drafts, route validation, and send-time block
checks. I then completed production readiness with security controls,
observability, deterministic test data, browser/accessibility coverage, and a
Vercel deployment. I then completed blocking as a standalone feature with
commands, APIs, relationship state, profile/thread controls, and blocked-account
management. I intentionally reserved real-time delivery for my own
WebSocket practice.

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
- [Phase 0 Report](./06-Engineering/Phase-0-Report.md) — completed baseline
  changes, tests, verification results, and review checklist.
- [Phase 1 Report](./06-Engineering/Phase-1-Report.md) — completed design
  system, application shell, responsive validation, and Phase 2 handoff.
- [Phase 2 Report](./06-Engineering/Phase-2-Report.md) — completed conversation
  presentation, composer, scroll behavior, favicon, and Phase 3 handoff.
- [Phase 3 Report](./06-Engineering/Phase-3-Report.md) — completed premium dark
  system, remaining pages, search pagination, and session refresh behavior.
- [Phase 4 Report](./06-Engineering/Phase-4-Report.md) — completed idempotent
  send path, concurrent optimistic behavior, drafts, validation, and database
  hardening.
- [Phase 6 Report](./06-Engineering/Phase-6-Report.md) — completed production
  security, testing, performance, cleanup, seed, and deployment work.
- [Blocking Feature Report](./06-Engineering/Blocking-Feature-Report.md) —
  completed standalone block/unblock services, APIs, client state, controls,
  management UI, and tests.

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

The core architecture, hardened HTTP messaging workflow, complete presentation,
and production-readiness controls are real and established.
The strongest completed areas are service separation, participant
authorization, direct-conversation uniqueness, stable message pagination,
transactional send metadata, sender-scoped idempotency, stable cursor indexes,
seeded edge cases, and concurrency-safe optimistic cache behavior.

The main unfinished product areas are multi-client read markers and real-time
delivery. Phase 5 is intentionally owned by the project author as a WebSocket
learning exercise.
