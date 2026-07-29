# Component Plan

## Implemented Phase 1 component system

I organized presentation code into three layers.

### UI primitives

`app/components/ui` contains source installed through shadcn/ui:

- alert, avatar, badge, button, and card;
- dropdown menu, input, separator, sheet, and skeleton;
- sidebar, textarea, tooltip, field, label, and input group.

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

## Feature components

### Authentication

- `AuthShell`;
- `LoginForm`;
- `RegisterForm`;
- `PasswordField`;
- `SignoutButton`.

The forms use shared shadcn fields, proper autocomplete, persistent field and
general errors, password visibility, pending states, client schema checks, and
a consistent responsive auth shell.

### Users

- `EditProfileForm`.
- `UserSearchResult`;
- `StartConversationButton`.

The profile form previews the avatar, tracks dirty state, retains returned
values after success, refreshes the Auth.js session, and supports reset. Search
results and public profiles share safe open-conversation behavior.

### Messaging

- `ConversationList`;
- `ConversationListItemComponent`;
- `ConversationContent`.
- `MessagingWorkspace`;
- `ConversationSidebar`;
- `ConversationEmptyState`;
- `MobileConversationHeader`.
- `ConversationHeader`;
- `ConversationSkeleton`;
- `MessageTimeline`;
- `MessageBubble`;
- `DateSeparator`;
- `MessageComposer`.

The workspace and sidebar establish responsive composition. Conversation rows
use valid list semantics, shared avatars, unread badges, selected state,
previews, and timestamps.

`ConversationContent` now only coordinates the conversation query, messages
query, session identity, and send mutation. The other components own one
presentation concern each.

## Implemented messaging composition

```text
messaging/components/
  MessagingWorkspace
  ConversationSidebar
  ConversationList
  ConversationListItemComponent
  ConversationContent
  ConversationHeader
  ConversationSkeleton
  MessageTimeline
  MessageBubble
  DateSeparator
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

The implemented markup uses valid `ul > li > a` semantics.

## Message history

Responsibilities:

- render chronological messages;
- group consecutive sender messages;
- render date separators;
- initiate older-page loading;
- preserve scroll anchor;
- decide whether to auto-scroll;
- show initial, pagination, failure, and no-message states.

`MessageTimeline` implements these responsibilities. It groups messages from
the same sender when they are on the same day and within five minutes.

## Composer

- auto-growing textarea;
- Enter sends and Shift+Enter creates a line break;
- local validation and remaining length;
- the current draft remains available after a failed send;
- clear after server success;
- accessible send button;
- disabled/explained invalid and pending state;
- 1,000-character counter and limit.

Do not show attachments or emoji controls until they perform real actions.

## Phase 3 page composition

```text
auth/components/
  AuthShell
  LoginForm
  RegisterForm
  PasswordField

users/components/
  UserSearchResult
  StartConversationButton
  EditProfileForm
```

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
