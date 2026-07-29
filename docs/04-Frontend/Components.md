# Component Plan

## Implemented Phase 1 component system

I organized presentation code into three layers.

### UI primitives

`app/components/ui` contains source installed through shadcn/ui:

- alert, avatar, badge, button, and card;
- dropdown menu, input, separator, sheet, and skeleton;
- sidebar and tooltip.

These are reusable primitives, not feature components. I can extend their
variants locally while keeping consistent accessibility behavior.

### Shared application components

`app/components/shared` contains:

- `UserAvatar`;
- `PageContainer` and `PageHeader`;
- `EmptyState` and `ErrorState`;
- `PageSkeleton`.

### Layout components

`app/components/layout` contains:

- `AppSidebar` and `SidebarBrand`;
- `AppNavigation`;
- `AppHeader`;
- `AccountMenu`.

Each component has one small responsibility. The protected route layout
combines them and supplies the authenticated user.

## Existing feature components

### Authentication

- `LoginForm`;
- `RegisterForm`;
- `SignoutButton`.

They prove the flows but need a shared form system, better error persistence,
autocomplete attributes, and polished pending states.

### Users

- `EditProfileForm`.

It currently manages values and submission locally. It clears the form and
navigates after success; the final experience should keep the updated values,
refresh the session, and show success feedback.

### Messaging

- `ConversationList`;
- `ConversationListItemComponent`;
- `ConversationContent`.
- `MessagingWorkspace`;
- `ConversationSidebar`;
- `ConversationEmptyState`;
- `MobileConversationHeader`.

The new workspace and sidebar establish responsive composition. The list rows
now use valid `ul > li > a` semantics, shared avatars, unread badges, selected
state, message previews, and timestamps. `ConversationContent` still handles
too many presentation concerns and renders test information; splitting and
redesigning it is Phase 2.

## Phase 2 messaging components

```text
messaging/components/
  ConversationPane
  InboxHeader
  ConversationSearch
  ConversationRow
  ConversationHeader
  MessageHistory
  MessageGroup
  MessageBubble
  MessageStatus
  DateSeparator
  LoadOlderTrigger
  JumpToLatestButton
  MessageComposer
  ConversationEmptyState
```

## Conversation row

Displays:

- avatar with fallback;
- display name;
- latest message preview;
- formatted latest time;
- unread badge;
- selected/unread/sending state.

Use valid `ul > li` semantics. The current link-wrapped list item should be
restructured so list semantics remain valid.

## Message history

Responsibilities:

- render chronological messages;
- group consecutive sender messages;
- render date separators;
- initiate older-page loading;
- preserve scroll anchor;
- decide whether to auto-scroll;
- show initial, pagination, failure, and no-message states.

## Composer

- auto-growing textarea;
- Enter sends and Shift+Enter creates a line break;
- local validation and remaining length;
- per-thread draft;
- optimistic clear;
- accessible send button;
- disabled/explained unavailable state.

Do not show attachments or emoji controls until they perform real actions.

## Auth and settings plan

- `AuthCard`;
- shared validated field components;
- password visibility control;
- `SettingsLayout`;
- `ProfileForm`;
- `AvatarEditor`;
- dirty-state and unsaved-change handling.

## Component rules

- Presentational components receive data and callbacks.
- Fetching logic stays in page/workspace containers and hooks.
- Shared primitives do not import feature services.
- Reusable application UI lives under `app/components`.
- Feature-only UI stays beside its feature under `app/features`.
- Styling is written with Tailwind utilities; global CSS is reserved for
  Tailwind/shadcn imports, semantic tokens, and base rules.
- Prefer an existing shadcn/ui primitive before building a new low-level
  control.
- User content remains plain text.
- Every icon-only button has an accessible label.
- Images handle missing URLs and loading failures.
