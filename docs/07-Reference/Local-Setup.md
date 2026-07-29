# Local Setup

## Prerequisites

- Node.js compatible with the selected Next.js version;
- pnpm;
- PostgreSQL.

The exact supported Node/pnpm versions should be pinned in the repository.

## Environment

The application requires:

```text
DATABASE_URL=postgresql://...
```

Auth.js requires its normal secret configuration outside development defaults.
The current password hashing service reads `HASHING_SALT` as a cost value and
defaults to `10`.

Add a safe `.env.example`; do not commit `.env`.

## Install and database

```bash
pnpm install
npx prisma migrate dev
pnpm db:seed
pnpm dev
```

The seed deletes application data before creating its dataset. Use only with a
development/test database whose contents can be replaced.

## Seed login

```text
Email: mohamed@example.com
Password: Test12345
```

All seeded users use `Test12345`.

Useful scenarios:

- `mohamed` has realistic conversations;
- the Layla thread is long enough for multiple message pages;
- a pair of messages shares one timestamp;
- searching `alex` returns more than one result page;
- Farah has no existing conversation with the primary user;
- some profiles have no avatar/bio;
- seeded block and unread states are available.

## Commands

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm db:seed
pnpm exec tsc --noEmit
```

There is no test script yet.

## Tooling warning

The current TypeScript `7.0.2` dependency is outside installed ESLint peer
ranges and prevents clean lint/build verification. Pin a compatible version
and reinstall before normal development.
