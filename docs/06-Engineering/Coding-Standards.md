# Coding Standards

## General principles

- Keep responsibilities inside the correct layer.
- Prefer clear names over explanatory comments.
- Keep TypeScript strict and avoid `any`.
- Validate data at trust boundaries.
- Return only the fields a caller needs.
- Use transactions for multi-write invariants.
- Make expected failures explicit.
- Optimize measured hot paths, not every component.

## TypeScript

- Use domain request/response types.
- Infer from Zod or Prisma where it reduces duplication safely.
- Represent success and error responses as discriminated unions.
- Avoid non-null assertions unless protected by a checked invariant.
- Keep network timestamps typed as strings and convert intentionally.

## React

- Use server components by default.
- Add `"use client"` at the smallest interactive boundary.
- Keep query data in React Query.
- Keep temporary UI state local.
- Use stable entity IDs as keys.
- Keep components focused and composable.
- Avoid effects for values that can be derived during render.

## Services

- Authenticate before private work.
- Authorize the specific resource.
- Normalize input once.
- Keep business validation independent of the page.
- Select explicit public/private fields.
- Translate known database errors into domain errors.

## Routes

- Parse and validate input.
- Call feature services.
- Serialize one shared response/error contract.
- Do not contain Prisma business workflows.
- Do not log raw request bodies or secrets.

## Naming

- Components: `PascalCase`.
- Hooks: `useSomething`.
- Services: verb/noun names such as `sendMessage`.
- Schemas: descriptive validation names.
- Query keys: centralized factories.
- Boolean values: `is`, `has`, `can`, or `should`.

## Formatting and imports

- Use Prettier as the formatting authority.
- Keep ESLint clean.
- Prefer `@/` project aliases for cross-feature imports.
- Prefer relative imports within a small feature area when readable.
- Remove dead imports, debug logs, and stale comments.

## Documentation

- Describe current behavior separately from plans.
- Label review recommendations.
- Update affected docs in the same change as a contract/business-rule change.
- Never claim a feature from schema preparation alone.
- Include failure and authorization behavior, not only happy paths.

## Git changes

- Keep commits focused.
- Use descriptive conventional-style subjects where useful.
- Do not mix unrelated formatting with behavioral work.
- Include migrations with the code that depends on them.
- Record breaking API/event changes.
