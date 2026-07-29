# Phase 3 Implementation Report

Completed on July 29, 2026.

## Outcome

I completed the remaining presentation layer and replaced the previous
light/dark token pair with a premium dark-only Relay design system. The public
landing page, authentication, new-chat discovery, public profiles, profile
settings, inbox, and conversation workspace now read as one product.

I also completed the behavior that the Phase 3 presentation depends on:
frontend search cursor pagination and immediate Auth.js session refresh after
profile edits.

## Premium dark design system

### Visual direction

- Deep blue-black background and surface hierarchy.
- Emerald primary action color with cyan gradient highlights.
- Violet-tinted selected and accent states.
- Translucent card and shell surfaces with restrained backdrop blur.
- Fine white-alpha borders instead of heavy separators.
- Larger radius scale and controlled depth shadows.
- Consistent bright focus rings and destructive states.
- Original Relay mark and favicon retained.

The root document has a permanent `dark` class and `color-scheme: dark`. This
is intentional: Phase 3 delivers one authored theme rather than an unfinished
toggle between two systems.

Component appearance remains Tailwind-based. `globals.css` contains theme
tokens and the Tailwind/shadcn base layer; page and component visual decisions
stay in utility classes.

## Public landing page

- Replaced the test entry page with an original Relay product page.
- Added responsive navigation and authentication calls to action.
- Added a focused messaging value proposition.
- Added three concise product principles.
- Added subtle grid and glow depth using Tailwind arbitrary utilities.
- Verified desktop and mobile dark rendering.

## Authentication

### Shared auth shell

`AuthShell` gives login and registration one responsive composition:

- Relay brand and product value panel on desktop;
- compact brand treatment on mobile;
- reusable title, description, form, and footer areas;
- dark glass card and accessible links.

### Login

- Shared shadcn Field and Input Group primitives.
- Email and current-password autocomplete.
- Client Zod validation before the request.
- Persistent field/general errors.
- Generic credential failure copy.
- Password visibility control.
- Designed pending state.
- Redirect to the inbox after success.
- Existing sessions redirect away from the public auth route.

### Registration

- Shared field architecture and password control.
- Client schema feedback without discarding typed values.
- Username and password requirement descriptions.
- Server error mapping remains authoritative.
- Success redirects to login with an account-ready status.

## New-chat discovery

- Replaced the test search card with a complete discovery workspace.
- Added debounced search with explicit searching state.
- Added initial, empty, failure, result, and next-page states.
- Added compact profile and message actions per result.
- Added per-result open-conversation pending and error state.
- Added bios where available.
- Kept own account and blocked relationships out through existing services.

### Cursor pagination

`useSearchQuery` now uses `useInfiniteQuery` with:

- key `["users", "search", debouncedQuery]`;
- ten users per request;
- API `nextCursor` as `pageParam`;
- flattened typed result pages;
- separate initial and next-page loading states.

The browser test loaded all 22 seeded `alex` profiles over three pages. All 22
usernames were unique.

## Public profiles

- Added a premium profile hero with safe avatar fallback.
- Added display name, username, bio, and privacy context.
- Other profiles expose a real message action.
- The current user's profile exposes an edit action instead.
- Conversation opening uses the existing service and route contracts.

## Profile settings

- Added live avatar, name, and username preview.
- Added account email context.
- Added display-name, bio, and avatar fields using shared primitives.
- Added 160-character bio counter.
- Added HTTP/HTTPS avatar URL validation.
- Empty avatar URLs use initials and broken images fall back safely.
- Added dirty-state tracking.
- Added reset behavior.
- Save remains unavailable when no values changed.
- Successful server values stay in the form.
- Success is announced in place instead of redirecting away.

## Auth.js session refresh

The old behavior updated PostgreSQL but left JWT profile fields stale.

The completed flow is:

```text
PATCH /api/users/me
  -> updated public profile response
  -> keep returned values in the form
  -> session.update(profile fields)
  -> Auth.js jwt callback with trigger="update"
  -> update token displayName/bio/avatarUrl
  -> router.refresh()
  -> protected server layout receives the new profile
```

The browser test confirmed the changed display name immediately appeared in
the session response and account navigation.

## Existing workspace refresh

The new design system was applied to the earlier Phase 1 and 2 UI:

- premium inset protected shell;
- darker translucent app header and sidebar;
- gradient Relay brand mark;
- refined active navigation state;
- rounded conversation selection;
- translucent conversation header and composer;
- updated card, border, focus, and action hierarchy.

A 360 px intrinsic-width issue in the inbox was found during browser testing.
The messaging grid and panes now use `min-w-0` and overflow containment, so
timestamps and previews remain inside the viewport.

## New shadcn/ui source

Phase 3 added:

- `Field`;
- `Label`;
- `InputGroup`.

The existing Input, Textarea, Button, Card, Avatar, Sidebar, Alert, Skeleton,
and Dropdown Menu components remain the base primitives.

All generated source stays under `app/components/ui`.

## Browser verification

| Scenario                   | Result                                             |
| -------------------------- | -------------------------------------------------- |
| Landing desktop            | Premium dark hero and cards rendered correctly     |
| Registration validation    | Field errors appeared without losing values        |
| Registration success state | Login displayed account-ready feedback             |
| Login                      | Authenticated and redirected to the inbox          |
| Search                     | Debounced results rendered                         |
| Search pagination          | 10 → 20 → 22 unique users                          |
| Profile settings           | Returned values remained after success             |
| Session refresh            | Updated display name appeared immediately          |
| Public profile             | Profile information and message action rendered    |
| Desktop inbox              | Premium shell rendered without overflow            |
| 360 px inbox               | Full timestamps stayed within the viewport         |
| Theme                      | Root dark class and dark color scheme were present |

Profile PATCH requests used for browser session-refresh verification were
intercepted, so the test did not change the database.

## Accessibility

- Auth fields have explicit labels and autocomplete attributes.
- Password visibility has a changing accessible name.
- Errors use alert semantics and success uses status semantics.
- Search has a persistent label and named results list.
- Icon-only profile/message actions include the person's name.
- Forms retain user input on validation and server failure.
- Focus styles remain visible across dark surfaces.
- Color is supported by icons, text, and state copy.
- Mobile layouts contain no horizontal page overflow.

## Quality gate

The final implementation is required to pass:

```text
pnpm exec prettier --check "app/**/*.{ts,tsx,css}" docs auth.ts components.json package.json
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm install --frozen-lockfile --offline
git diff --check
```

## Phase 4 handoff

Presentation is no longer the main blocker. Phase 4 can focus on behavior:

1. add client message IDs and a database idempotency constraint;
2. support concurrent pending sends with targeted rollback;
3. add persistent failed bubbles with safe retry/remove;
4. preserve drafts per conversation;
5. reconcile unread state immediately and across clients;
6. enforce block state during send;
7. validate route inputs consistently;
8. add the composite history index.

## Review checklist

- Review the new color tokens and permanent dark-theme decision.
- Open landing, login, and registration at desktop and mobile widths.
- Check client and server auth errors while values remain.
- Search `alex` and load all three pages.
- Open a result profile and start a conversation.
- Edit the display name and confirm the sidebar identity changes.
- Test blank, valid, and broken avatar URLs.
- Review public self-profile and other-profile actions.
- Check inbox timestamps at exactly 360 px.
- Confirm new shadcn/ui files remain under `app/components/ui`.
