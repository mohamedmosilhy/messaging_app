import type { InfiniteData } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import type { GetConversationsResponse } from "@/app/features/messaging/types/conversation.types";
import type {
  GetMessagesResponse,
  MessageResponse,
} from "@/app/features/messaging/types/messages.types";
import {
  applyReadEventToInbox,
  mergeMessageIntoCache,
  mergeMessageIntoInbox,
} from "@/app/features/realtime/utils/realtime-cache";

const sender = {
  id: "user-2",
  username: "layla",
  displayName: "Layla",
  bio: null,
  avatarUrl: null,
};

function message(overrides: Partial<MessageResponse> = {}): MessageResponse {
  return {
    id: "message-1",
    clientId: "client-1",
    senderId: "user-2",
    conversationId: "conversation-1",
    content: "Hello",
    createdAt: new Date("2026-08-07T18:00:00.000Z"),
    updatedAt: new Date("2026-08-07T18:00:00.000Z"),
    sender,
    ...overrides,
  };
}

function messagesData(
  messages: MessageResponse[],
): InfiniteData<GetMessagesResponse> {
  return {
    pageParams: [undefined],
    pages: [
      {
        success: true,
        data: { messages, nextCursor: null },
      },
    ],
  };
}

function conversationsData(): GetConversationsResponse {
  return {
    success: true,
    data: {
      conversations: [
        {
          conversationId: "conversation-1",
          lastMessageId: "message-0",
          title: "Layla",
          avatarUrl: null,
          lastMessage: "Earlier",
          lastMessageAt: new Date("2026-08-07T17:00:00.000Z"),
          unreadCount: 2,
        },
      ],
    },
  };
}

describe("real-time cache reconciliation", () => {
  it("replaces an optimistic message by client ID without duplicating it", () => {
    const optimistic = message({
      id: "temp-client-1",
      deliveryStatus: "sending",
    });
    const result = mergeMessageIntoCache(messagesData([optimistic]), message());

    expect(result?.pages[0].data.messages).toEqual([message()]);
  });

  it("ignores duplicate delivery when the server message is already cached", () => {
    const result = mergeMessageIntoCache(messagesData([message()]), message());

    expect(result?.pages[0].data.messages).toHaveLength(1);
  });

  it("increments unread once for a newer inactive incoming message", () => {
    const first = mergeMessageIntoInbox(conversationsData(), message(), {
      currentUserId: "user-1",
    });
    const duplicate = mergeMessageIntoInbox(first, message(), {
      currentUserId: "user-1",
    });

    expect(first?.data.conversations[0].unreadCount).toBe(3);
    expect(duplicate?.data.conversations[0].unreadCount).toBe(3);
  });

  it("only clears unread state when the read marker reaches the latest message", () => {
    const unchanged = applyReadEventToInbox(conversationsData(), {
      conversationId: "conversation-1",
      lastReadMessageId: "older-message",
    });
    const cleared = applyReadEventToInbox(conversationsData(), {
      conversationId: "conversation-1",
      lastReadMessageId: "message-0",
    });

    expect(unchanged?.data.conversations[0].unreadCount).toBe(2);
    expect(cleared?.data.conversations[0].unreadCount).toBe(0);
  });
});
