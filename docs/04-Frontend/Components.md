# Component Plan

## Current components

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

They verify inbox, conversation detail, message pagination, and sending. The
conversation component currently handles too many presentation concerns and
renders internal/test information.

## Proposed shared components

```text
ui/
  Avatar
  Badge
  Button
  Dialog
  EmptyState
  IconButton
  InlineError
  Skeleton
  Spinner
  TextArea
  TextField
  Toast
  VisuallyHidden
```

## Proposed messaging components

```text
messaging/components/
  MessagingShell
  InboxSidebar
  InboxHeader
  ConversationSearch
  ConversationList
  ConversationRow
  ConversationPane
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
- User content remains plain text.
- Every icon-only button has an accessible label.
- Images handle missing URLs and loading failures.
