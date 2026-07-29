# Current Implementation Status

Reviewed against the repository on July 29, 2026.

## Complete enough for the current MVP foundation

- Prisma schema and migrations.
- Realistic seed data.
- Credentials authentication and JWT session.
- Registration and login validation.
- Current/public profile reads.
- Profile edit service and form.
- Debounced user search service/API/UI.
- Direct conversation open/create with race protection.
- Participant authorization.
- Inbox retrieval.
- Message history cursor pagination.
- Transactional message sending.
- Unread count persistence.
- React Query caches and infinite history.
- First optimistic message workflow.
- Direct inbox cache update after successful send.

## Presentation status

Phases 1 and 2 are complete. The application now has a semantic Tailwind design
system, shadcn/ui primitives, authenticated shell, responsive inbox, grouped
message bubbles, conversation states, anchored pagination, optimistic sending,
and an auto-growing composer.

The application also has an original Relay favicon. Authentication, discovery,
profile, and settings receive their final redesign in Phase 3.

## Partial areas

- block model/filtering without block commands or send-time enforcement;
- unread counters without real-time/multi-device read markers;
- search backend cursor without frontend pagination;
- group enum without group behavior;
- organizational protected route group without shared enforcement;
- optimistic single-send flow without concurrency-safe targeted rollback or
  persistent failed bubbles;
- final auth, discovery, profile, and settings presentation.

## Known correctness/tooling items

- Profile edits do not refresh JWT session fields.
- Arbitrary avatar URL storage conflicts with restricted Next Image hosts.
- Conversation detail GET performs an unread-state write.
- Route validation is inconsistent.
- No message idempotency exists.
- PostgreSQL integration and browser tests are not added yet.

## Verification performed

- TypeScript was pinned to compatible version `6.0.3`.
- `pnpm lint`: passed with zero warnings.
- `pnpm typecheck`: passed.
- `pnpm test`: six tests passed.
- `pnpm peers check`: passed.
- `pnpm build`: passed and generated all application routes.
- responsive browser checks passed at 360 px and 1440 px without horizontal
  overflow.
- the mobile navigation drawer and desktop conversation split pane were checked
  in Chromium.
- message pagination preserved its visual anchor exactly.
- optimistic, success, send-failure, multiline, length-limit, and draft
  preservation behavior were checked in Chromium.
- the Relay favicon returned successfully through Next.js metadata routing.
- The registration email-conflict field mapping was fixed and tested.
- Node and pnpm expectations, environment template, and Prisma generation are
  now reproducible.

## Next recommended action

Phase 2 is complete. Review its
[implementation report](../06-Engineering/Phase-2-Report.md), then begin Phase
3 with authentication, discovery, profile, and settings presentation. Do not
begin WebSocket work until the Phase 4 idempotency and concurrent optimistic
behavior are complete.
