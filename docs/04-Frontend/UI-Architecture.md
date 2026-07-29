# UI Architecture

## Current state

I completed the public and protected presentation layer. Relay now has a
premium dark design system across the landing page, authentication, navigation,
inbox, conversations, discovery, profiles, and settings.

The UI remains above my existing service and persistence layers. Search
pagination and profile session refresh extend the existing client-state
boundary without moving business rules into components.

## Implemented application shell

### Desktop

```text
+-------------------------+------------------------------------------+
| Inbox sidebar           | Active conversation                      |
|-------------------------|------------------------------------------|
| Account and actions     | Conversation header                      |
| Search/filter           |------------------------------------------|
|-------------------------| Message history                          |
| Conversation rows       |                                          |
|                         |------------------------------------------|
|                         | Composer                                 |
+-------------------------+------------------------------------------+
```

- The product navigation can collapse to icons.
- The conversation list uses a 288–352 px responsive column.
- The shell uses dynamic viewport height.
- No selected conversation shows an intentional welcome state.
- The account and profile actions stay available in the shell footer.

### Mobile

- Inbox is the first full screen.
- Selecting a thread opens the thread full screen.
- Header includes a clear back action.
- Desktop and mobile layouts must not create duplicate focusable controls.

The open-thread shell removes the duplicated mobile application header. The
composer respects the mobile safe-area inset, grows with its content, and
supports Enter to send or Shift+Enter for a new line.

## Route composition

- `app/(pages)/(protected)/layout.tsx` authenticates once and composes the shell.
- `/dashboard` redirects to `/dashboard/conversations`.
- `/dashboard/conversations` renders the inbox and empty conversation pane.
- `/dashboard/conversations/[conversationId]` renders the selected thread in
  the content pane and a mobile back action.
- Settings, discovery, and profile pages render inside the same shell.
- Global and protected route groups have loading, error, and not-found
  boundaries.

## Component layers

```text
app/
├── components/
│   ├── ui/       # shadcn/ui primitives
│   ├── shared/   # reusable application presentation
│   └── layout/   # protected-shell composition
├── features/
│   └── */components/ # feature-specific presentation
├── hooks/        # application-wide UI hooks
└── lib/          # shared UI utilities and server infrastructure
```

I keep generated shadcn/ui source inside `app/components/ui`, not in a second
root-level component tree. `components.json` contains the same aliases, so
future shadcn additions will keep this structure.

## Semantic tokens

```text
--background
--foreground
--card
--popover
--muted
--accent
--primary
--border
--danger
--ring
--sidebar
--sidebar-accent
```

The tokens are exposed to Tailwind utilities such as `bg-background`,
`text-muted-foreground`, and `ring-ring`. `globals.css` only contains Tailwind
imports, the token definitions required by the design system, and base-layer
applications. Component appearance is implemented with Tailwind classes.

The root uses one intentional dark theme:

- blue-black background and layered surfaces;
- emerald primary actions;
- cyan and violet supporting accents;
- white-alpha borders;
- high-contrast text, focus, and destructive states;
- translucent panels and restrained depth effects.

WhatsApp inspires the interaction density and hierarchy, but I kept original
Relay branding, colors, assets, and values.

## Component boundaries

- The protected server layout owns authentication and static composition.
- Layout components compose shadcn/ui primitives without data fetching.
- Shared components provide page, avatar, empty, error, and loading patterns.
- Feature components own messaging-specific presentation.
- React Query hooks continue to own remote messaging state.
- The mobile viewport hook uses `useSyncExternalStore` and `matchMedia`.
- `ConversationContent` coordinates queries and mutation state.
- `MessageTimeline` owns scroll and pagination anchoring behavior.
- `MessageBubble`, `DateSeparator`, `ConversationHeader`, and
  `MessageComposer` stay presentational and reusable.
- `AuthShell` composes public authentication presentation.
- `useSearchQuery` owns typed infinite search state.
- `EditProfileForm` owns its editable snapshot while Auth.js owns the updated
  authenticated identity.

Avoid:

- one enormous conversation component;
- database/service calls inside presentational components;
- copying response objects into unnecessary local state;
- global client state for values owned by React Query;
- controls with placeholder behavior.

## Accessibility baseline

- valid list semantics;
- descriptive button names;
- visible focus;
- logical heading structure;
- status announcements for send failures and saves;
- adequate contrast;
- states that do not rely only on color;
- keyboard composer behavior;
- reduced-motion respect.
