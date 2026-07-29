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

All pages/components should be considered test UI. They expose functionality but
do not yet form a production design system or unified messaging workspace.

## Partial areas

- block model/filtering without block commands or send-time enforcement;
- unread counters without real-time/multi-device read markers;
- search backend cursor without frontend pagination;
- group enum without group behavior;
- organizational protected route group without shared enforcement;
- optimistic single-send flow without concurrency-safe rollback or retry UI.

## Known correctness/tooling items

- Profile edits do not refresh JWT session fields.
- Arbitrary avatar URL storage conflicts with restricted Next Image hosts.
- Conversation detail GET performs an unread-state write.
- Conversation detail route contains a debug log.
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
- The registration email-conflict field mapping was fixed and tested.
- Node and pnpm expectations, environment template, and Prisma generation are
  now reproducible.

## Next recommended action

Phase 0 is complete. Next, review its
[implementation report](../06-Engineering/Phase-0-Report.md), then begin the
protected responsive shell and inbox/conversation workspace. Do not begin
WebSocket work until idempotency and concurrent optimistic behavior are
designed.
