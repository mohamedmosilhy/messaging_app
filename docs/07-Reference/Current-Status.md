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

- Existing email conflict is mapped to the wrong field key.
- Profile edits do not refresh JWT session fields.
- Arbitrary avatar URL storage conflicts with restricted Next Image hosts.
- Conversation detail GET performs an unread-state write.
- Conversation detail route contains a debug log.
- Route validation is inconsistent.
- No message idempotency exists.
- No automated tests exist.
- TypeScript 7 is incompatible with installed lint/build tooling.

## Verification performed

- `pnpm exec tsc --noEmit`: passed.
- `pnpm lint`: crashed in TypeScript ESLint dependency code.
- `pnpm peers check`: reported unsupported TypeScript peer version.
- `pnpm build`: compiled, then failed during Next.js type handling.
- Documentation formatting/diff checks: passed at the previous review.

## Next recommended action

Complete Roadmap Phase 0, then build the protected responsive shell and the
inbox/conversation workspace. Do not begin WebSocket work until idempotency and
concurrent optimistic behavior are designed.
