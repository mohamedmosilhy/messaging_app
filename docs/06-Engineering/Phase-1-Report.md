# Phase 1 Implementation Report

Completed on July 29, 2026.

## Outcome

I completed the first presentation milestone without changing my existing
domain, service, API, or React Query architecture. The application now has a
responsive authenticated shell and an inbox-first workspace built from
Tailwind CSS and shadcn/ui source components.

This phase gives every implemented product feature a stable place while keeping
the detailed conversation redesign isolated for Phase 2.

## What I built

### Design system

- Added shadcn/ui with the Radix-based component set.
- Added semantic light and dark color tokens for background, foreground,
  surfaces, states, borders, focus rings, and the sidebar.
- Connected tokens to Tailwind utilities.
- Added Geist as the application font with a non-conflicting font variable.
- Standardized radius, focus, muted, primary, destructive, and selected states.
- Kept component styling in Tailwind classes. `globals.css` is limited to
  Tailwind/shadcn imports, theme variables, and the required base layer.

### UI primitives

I installed and kept the editable shadcn/ui source for:

- Alert;
- Avatar;
- Badge;
- Button;
- Card;
- Dropdown Menu;
- Input;
- Separator;
- Sheet;
- Sidebar;
- Skeleton;
- Tooltip.

These components provide established keyboard, focus, responsive, and
composition behavior without introducing another UI framework.

### Folder architecture

I moved all presentation infrastructure under `app`:

```text
app/
├── components/
│   ├── ui/
│   ├── shared/
│   └── layout/
├── features/
│   └── messaging/components/
├── hooks/
└── lib/
```

- `ui` owns low-level shadcn/ui primitives.
- `shared` owns reusable application presentation.
- `layout` owns the protected product shell.
- feature-specific components stay beside their feature.
- shared UI hooks and utilities stay under `app/hooks` and `app/lib`.

I updated `components.json` so future shadcn/ui commands generate files in this
structure. There are no competing root-level `components`, `hooks`, or `lib`
folders.

### Protected application shell

- Added one protected server layout that checks the session and redirects
  unauthenticated requests.
- Added collapsible desktop navigation and a mobile off-canvas drawer.
- Added active navigation for Inbox, New chat, and Profile settings.
- Added account details and sign-out actions in a reusable dropdown.
- Added a route-aware product header.
- Changed `/dashboard` to redirect to the inbox.

### Inbox workspace

- Added an inbox-first desktop split pane.
- Added full-screen mobile list and conversation navigation.
- Added a clear mobile back action on selected conversations.
- Added an intentional empty pane when no conversation is selected.
- Rebuilt conversation rows with valid list semantics, selected state, shared
  avatar fallbacks, previews, timestamps, and unread badges.
- Preserved the existing React Query conversation queries and message behavior.

### Shared states and remaining pages

- Added shared page container and heading components.
- Added reusable empty, error, skeleton, and avatar components.
- Added global and protected loading, error, and not-found boundaries.
- Placed search, settings, and public profile surfaces inside consistent cards
  and page structure.
- Removed the duplicate authentication check from the profile settings page
  because the protected layout now owns that responsibility.
- Replaced an internal Next.js router import with the public
  `next/navigation` API.

## Architecture boundaries preserved

I did not rewrite services, API routes, database behavior, query keys,
pagination, or optimistic sending. The new shell consumes the contracts that
already existed.

This is important because presentation changes can continue independently:

```text
shadcn/ui primitives
        ↓
shared application components
        ↓
layout and feature presentation
        ↓
existing React Query hooks
        ↓
existing API, service, and persistence layers
```

## Accessibility and responsive behavior

- Icon-only controls have accessible names.
- Navigation exposes visible selected states.
- List markup follows `ul > li > a`.
- Focus indication comes from the shared ring tokens.
- The sidebar supports mouse, touch, keyboard focus, and a documented keyboard
  shortcut.
- Mobile navigation uses an accessible dialog/sheet.
- Desktop and mobile panes hide inactive duplicate controls.
- Long names and previews truncate instead of expanding the viewport.

## Verification

I ran the complete quality gate:

```text
pnpm exec prettier --check "app/**/*.{ts,tsx,css}" docs components.json package.json
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

All commands passed. The existing six service tests passed, and Next.js built
all routes successfully.

I also tested the authenticated product in headless Chromium:

| View                | Result                                                 |
| ------------------- | ------------------------------------------------------ |
| 1440 × 960 inbox    | Desktop navigation and split pane rendered correctly   |
| 360 × 800 inbox     | Full-width conversation list rendered correctly        |
| Mobile drawer       | Opened as an opaque accessible navigation dialog       |
| Conversation route  | Desktop detail pane and mobile route navigation worked |
| Horizontal overflow | None at desktop or 360 px                              |
| Semantic CSS tokens | Present in computed browser styles                     |

## What Phase 1 intentionally does not include

The current `ConversationContent` still presents the original test interface.
Phase 2 will split and redesign it into:

- conversation header;
- message history;
- incoming and outgoing bubbles;
- grouped messages and day separators;
- pagination, loading, empty, and retry states;
- auto-growing composer;
- scroll anchoring and jump-to-latest behavior.

Authentication, discovery, profile, and settings receive their final visual
pass in Phase 3. Phase 1 only placed them in the new shell and gave them
consistent page structure.

## Recommended Phase 2 order

1. Extract data-state handling from `ConversationContent`.
2. Build the conversation header and message-history states.
3. Add message grouping, bubbles, dates, and optimistic/failed status.
4. Build the accessible auto-growing composer.
5. Implement initial scroll, older-page anchoring, and jump-to-latest.
6. Validate slow, empty, failed, long-content, and mobile-keyboard cases.

## Review checklist

- Open the inbox on desktop and collapse/expand the product navigation.
- Open the mobile navigation at 360 px.
- Open a conversation and verify the mobile back action.
- Review active navigation and focus rings using only the keyboard.
- Check the account dropdown and sign-out path.
- Confirm search, settings, and user profile routes stay inside the shell.
- Confirm new shadcn/ui additions are generated under `app/components/ui`.
- Confirm the unfinished thread body is accepted as the Phase 2 boundary.
