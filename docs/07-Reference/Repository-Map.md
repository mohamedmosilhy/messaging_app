# Repository Map

```text
messaging_app/
├── app/
│   ├── (pages)/
│   │   ├── (public)/
│   │   └── (protected)/
│   ├── api/
│   ├── components/
│   │   ├── layout/
│   │   ├── shared/
│   │   └── ui/
│   ├── features/
│   │   ├── auth/
│   │   ├── messaging/
│   │   └── users/
│   ├── hooks/
│   ├── lib/
│   ├── providers/
│   ├── utils/
│   └── icon.svg
├── docs/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
├── auth.ts
├── next.config.ts
├── package.json
└── tsconfig.json
```

## Entry points

- `app/layout.tsx`: root providers, document shell, and global design setup.
- `app/(pages)/(protected)/layout.tsx`: authentication and product shell.
- `auth.ts`: Auth.js configuration and callbacks.
- `app/page.tsx`: premium public Relay landing page.
- `app/api`: HTTP boundary.
- `app/features/*/index.ts`: feature exports.
- `app/lib/prisma.ts`: Prisma client.

## Authentication feature

- `components`: shared auth shell, login, registration, password field, logout.
- `actions`: registration client request.
- `schemas`: login/register Zod schemas.
- `services`: registration and credential verification.
- `types`: Auth.js augmentation and contracts.

## Users feature

- profile and search services;
- profile edit validation and request;
- current/public/edit/search response types;
- profile form, paginated search results, and open-conversation actions.

## Messaging feature

- conversation/message services;
- request functions for list, detail, open, history, send;
- React Query hooks;
- participant authorization helper;
- responsive inbox, conversation header, message timeline, bubbles, composer,
  and designed state components;
- message/date presentation formatters;
- messaging response/cursor types.

## Shared code

- `app/components/ui`: shadcn/ui primitives styled through Tailwind.
- `app/components/shared`: reusable page states, page structure, and avatars.
- `app/components/layout`: application navigation, header, and account shell.
- `app/lib/errors`: typed application errors.
- `app/lib/utils.ts`: UI class-name composition.
- `app/hooks`: debounce, search query, and responsive viewport hooks.
- `app/providers`: Auth.js and React Query providers.
- `app/utils`: session user helper, URLs, Zod formatting.
- `app/icon.svg`: original Relay browser and metadata icon.

`components.json` points shadcn/ui aliases into `app`, so the repository does
not create competing root-level `components`, `hooks`, or `lib` directories.

## Persistence

- Prisma schema is the data-model source.
- Migrations are the database history.
- Seed creates manual-development scenarios.
- Generated Prisma output is ignored and recreated.
