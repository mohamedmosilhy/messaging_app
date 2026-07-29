# UI Architecture

## Current state

The current pages and components are functional test surfaces. They expose
profile, search, inbox, conversation, and sending behavior, but they are not the
intended final product interface.

The UI redesign should stay above the service and persistence layers wherever
possible.

## Proposed application shell

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

- Sidebar target: approximately 360–420 px.
- Only inbox and message history scroll.
- The shell uses dynamic viewport height.
- No selected conversation shows an intentional welcome/empty state.

### Mobile

- Inbox is the first full screen.
- Selecting a thread opens the thread full screen.
- Header includes a clear back action.
- Back restores inbox scroll position.
- Composer respects safe-area and keyboard behavior.
- Desktop and mobile layouts must not create duplicate focusable controls.

## Route composition

Recommended direction:

- shared authenticated layout for the protected product;
- `/dashboard/conversations` as the main workspace;
- selected conversation composed into the split pane on desktop;
- settings and account actions accessible from the shell;
- route-level loading, error, and not-found boundaries.

## Shared primitives

- `Avatar`;
- `IconButton`;
- `Button`;
- `TextField` and `TextArea`;
- field message/help text;
- `Badge`;
- `Skeleton`;
- `Spinner`;
- `EmptyState`;
- `InlineError`;
- `Dialog` or responsive drawer;
- `Toast`;
- `VisuallyHidden`.

Use a single open-source icon family and semantic CSS variables.

## Semantic tokens

```text
--background
--surface
--surface-muted
--surface-selected
--border
--text
--text-muted
--accent
--accent-strong
--message-incoming
--message-outgoing
--danger
--focus-ring
```

WhatsApp can inspire interaction density and hierarchy, but the application
should use original branding, assets, and exact visual values.

## Component boundaries

Prefer:

- server layout for authentication and static shell composition;
- one client messaging workspace around React Query interactions;
- small presentational row, bubble, header, and state components;
- hooks for scroll anchoring, drafts, and viewport behavior;
- shared formatters for dates and names.

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
