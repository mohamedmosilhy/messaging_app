# Phase 2 Implementation Report

Completed on July 29, 2026.

## Outcome

I replaced the original conversation test surface with a complete responsive
HTTP messaging experience. The result keeps my existing service, API, React
Query, cursor-pagination, and optimistic-update layers intact while giving
them a polished WhatsApp-inspired presentation with original Relay branding.

I also added an original Relay website icon through the Next.js app metadata
file convention.

## What I built

### Conversation header

- Displays the participant avatar, display name, and username.
- Links to the participant profile through an accessible information action.
- Provides a dedicated mobile back button.
- Removes the duplicated product header on mobile conversation routes.
- Keeps the product header and split-pane navigation on desktop.

### Message history

- Renders chronological incoming and outgoing message bubbles.
- Uses the authenticated session ID to determine message ownership.
- Groups consecutive messages from the same sender when they are on the same
  day and within five minutes.
- Shows the sender once at the start of an incoming group.
- Shows the avatar once at the end of an incoming group.
- Preserves whitespace and wraps unbroken content safely.
- Shows local message time and accessible sending/sent status.
- Uses date separators with Today, Yesterday, or a full localized date.
- Removes raw conversation IDs, enum values, participant debug lists, and
  test-only labels.

### Message states

- Added a full conversation skeleton.
- Added a designed empty-thread state.
- Added a query error state with retry.
- Added older-page loading and retry feedback.
- Added an explicit beginning-of-conversation message.
- Added an optimistic sending clock.
- Added a sent check after server reconciliation.
- Added composer-level send failure feedback without losing the draft.

### Pagination and scrolling

- The newest messages are visible on initial load.
- Loading older pages preserves the visible scroll anchor using the difference
  between the old and new scroll heights.
- Older messages do not force the user back to the newest message.
- Sending an own message scrolls to the latest content.
- Scrolling away from the bottom reveals an accessible jump-to-latest button.
- The history uses native scrolling and overscroll containment.

### Composer

- Uses the shadcn/ui Textarea and Button primitives.
- Grows with its content and stops at a practical maximum height.
- Enter sends the message.
- Shift+Enter inserts a new line.
- Trims content before submission.
- Prevents empty messages.
- Enforces and displays the 1,000-character limit.
- Shows pending state and prevents duplicate clicks while the mutation runs.
- Clears only after success.
- Keeps the draft and explains retry after failure.
- Refocuses the composer after a successful send.
- Respects the mobile safe-area inset.

### Website icon

I added `app/icon.svg` with an original Relay mark:

- teal rounded-square background;
- white messaging bubble;
- three conversation dots;
- scalable vector rendering;
- automatic Next.js favicon metadata routing.

## Component architecture

```text
ConversationContent
├── ConversationHeader
│   ├── MobileConversationHeader
│   └── UserAvatar
├── MessageTimeline
│   ├── DateSeparator
│   └── MessageBubble
└── MessageComposer
    ├── Textarea
    └── Button
```

- `ConversationContent` coordinates queries, session identity, and mutation
  state.
- `MessageTimeline` owns only history scrolling, grouping composition, and
  pagination anchoring.
- `MessageBubble` owns one message's visual and accessible state.
- `MessageComposer` owns only the local draft and keyboard submission.
- date formatting is isolated in `utils/message-formatters.ts`.

I typed the conversation and messages request functions so the UI consumes
explicit response contracts instead of untyped JSON.

## Styling approach

- Component styling uses Tailwind utilities.
- The composer uses the shadcn/Tailwind `field-sizing-content` behavior.
- No component-specific CSS file was added.
- No inline style is used for the auto-growing composer.
- Existing semantic theme colors drive all bubbles, surfaces, borders, text,
  errors, focus rings, and selected states.

## Accessibility

- Message history has a named log region.
- Messages use valid list semantics.
- Dates use separator semantics.
- Status icons include screen-reader text.
- Send, profile, back, pagination, and jump controls have descriptive names.
- Send errors use an alert.
- Invalid long content sets `aria-invalid`.
- Composer help explains both keyboard behaviors.
- Focus remains visible through shared design tokens.
- The mobile conversation contains one visible header rather than duplicated
  focusable shell controls.

## Browser verification

I tested the authenticated workflow in headless Chromium.

| Scenario                  | Result                                                   |
| ------------------------- | -------------------------------------------------------- |
| Initial conversation load | Opened at the newest message                             |
| Older-page pagination     | Added messages and preserved the anchor exactly          |
| Optimistic send           | Bubble appeared with Sending before the response         |
| Successful send           | Temporary bubble reconciled and showed Sent              |
| Failed send               | Draft remained and retry feedback appeared               |
| Multiline input           | Shift+Enter inserted a new line                          |
| Keyboard send             | Enter submitted the message                              |
| Length limit              | 1,001 characters disabled send and set invalid state     |
| Desktop                   | Split pane rendered without horizontal overflow          |
| 360 px mobile             | Thread and composer rendered without horizontal overflow |
| Mobile header             | One visible participant header with back navigation      |
| Favicon                   | Metadata link resolved and returned HTTP 200             |
| Raw test data             | Conversation ID/debug labels were absent                 |

POST requests used for optimistic success and failure checks were intercepted
in the browser, so verification did not add test messages to the database.

## Quality gate

The final implementation is required to pass:

```text
pnpm exec prettier --check "app/**/*.{ts,tsx,css}" docs components.json package.json
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm install --frozen-lockfile --offline
```

## Deliberate Phase 4 boundary

Phase 2 provides an actionable send-failure state and keeps the draft. It does
not retain a persistent failed bubble because the current rollback restores a
full cache snapshot.

Phase 4 will add:

- client message IDs stored by the server;
- targeted rollback for one temporary message;
- persistent failed bubble with retry/remove actions;
- multiple concurrent pending messages;
- out-of-order resolution safety;
- duplicate prevention across HTTP, retry, refetch, and future sockets.

This avoids presenting retry as safe before idempotency exists.

## Recommended Phase 3 order

1. Redesign login and registration with shared form components.
2. Turn user discovery into a polished new-chat workflow.
3. Connect search cursor pagination.
4. Redesign public profiles and settings.
5. Refresh session profile data after edits.
6. Standardize avatar loading and fallback behavior.

## Review checklist

- Open a long conversation and confirm it starts at the newest message.
- Scroll to the top and load older messages.
- Confirm the visible content does not jump after pagination.
- Send with Enter and insert a new line with Shift+Enter.
- Confirm the sending clock changes to a sent check.
- Simulate a failed request and confirm the draft remains.
- Test blank and longer-than-1,000-character content.
- Scroll away from the bottom and use jump-to-latest.
- Review the thread at 360 px and desktop widths.
- Open the participant profile from the header.
- Confirm the Relay icon appears in the browser tab.
