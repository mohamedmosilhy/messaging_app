# Local Setup

## Prerequisites

- Node.js 24.11.1 is the repository recommendation in `.nvmrc`;
- the supported engine range is Node.js 20.9.x, 22.x, or 24.x and newer;
- pnpm 11.17.0;
- PostgreSQL.

`package.json` records the engine range and package-manager version.

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

Secondary account:

```text
Email: layla.hassan@example.com
Password: Test12345
```

Useful scenarios:

- `mohamed` has realistic conversations;
- the Layla thread is long enough for multiple message pages;
- a pair of messages shares one timestamp;
- searching `alex` returns more than one result page;
- Farah has no existing conversation with the primary user;
- Dina has an empty conversation;
- Rami has a 1,000-character message;
- Nour, Karim, and Adam have unread badges of 1, 2, and 3;
- some profiles have no avatar/bio;
- seeded block and unread states are available.

## Commands

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm typecheck
pnpm test
pnpm test:watch
pnpm test:e2e
pnpm test:e2e:seeded
pnpm test:e2e:ui
pnpm screenshots
pnpm db:generate
pnpm db:deploy
pnpm db:seed
```

The post-install script generates Prisma Client automatically. TypeScript is
pinned to `6.0.3`, which satisfies the installed lint tooling.

Playwright runs Chromium at desktop and Pixel 7 sizes. The seeded E2E command
resets the configured database first and must target disposable data.
