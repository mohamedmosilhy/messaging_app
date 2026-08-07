# Standalone Blocking Feature Report

Completed on August 7, 2026.

## Outcome

Blocking is now a complete standalone feature rather than schema preparation
and scattered messaging checks. Users can block from a profile or conversation,
review their blocked accounts, unblock at any time, and see messaging become
unavailable immediately. Existing history remains visible.

## Architecture

`app/features/blocking` owns:

- directional block, unblock, list, and status services;
- request/response types and strict target validation;
- browser request actions and React Query keys/hooks;
- reusable block controls and blocked-account list presentation;
- the feature public export surface.

Thin routes under `app/api/blocks` expose list, status, block, and unblock.
Users and messaging consume the feature without owning its business workflow.

## Business rules

- authentication is required;
- self-block and missing targets are rejected;
- block creation uses composite-key upsert and is safe to repeat;
- unblock uses caller-scoped deletion and is safe to repeat;
- users mutate only their own block direction;
- either direction disables discovery, opening, and sending;
- status exposes the caller-owned direction and combined interaction state,
  not the identity/direction of another user's block;
- unblocking does not restore interaction while a reverse block remains;
- conversation and message history is never deleted by blocking.

## Product surfaces

- Full block/unblock action on another user's profile.
- Compact block/unblock action in the conversation header.
- Composer availability driven by shared relationship state.
- Dedicated `/settings/blocked` page with loading, empty, error, list, profile,
  and unblock states.
- Sidebar and account-menu navigation.

The block action asks for confirmation and explains the effect before changing
state. Mutation errors remain attached to the relevant control.

## Client reconciliation

React Query uses list and per-target status keys. Blocking optimistically makes
interaction unavailable and rolls back on error. Unblocking waits for the
authoritative response because a reverse block may remain. Successful
mutations replace status and invalidate blocked-account and discovery queries.
Profile refresh keeps server-rendered actions consistent, while the active
conversation consumes the shared status cache to disable or restore its
composer.

## Security and abuse controls

Block targets are validated at the HTTP and service boundaries. Mutations use
a PostgreSQL-backed per-user limit of 30 operations per minute. Services select
only public profile fields, and reverse-direction ownership is not exposed.

## Verification

Six new service tests cover:

- blocked-list public mapping and timestamps;
- privacy-safe reverse-direction status;
- idempotent block creation;
- self-block rejection;
- idempotent unblock with restored interaction;
- reverse-block behavior after unblocking.

At implementation time, TypeScript passed and the full Vitest suite passed with
16 tests across four files. The final repository quality gate also includes
formatting, lint, production build, and diff checks.
