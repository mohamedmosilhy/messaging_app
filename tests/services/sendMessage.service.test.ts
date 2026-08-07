import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireCurrentUserId: vi.fn(),
  requireConversationParticipant: vi.fn(),
  findMessage: vi.fn(),
  findBlock: vi.fn(),
  transaction: vi.fn(),
  enforceRateLimit: vi.fn(),
  createRealtimeEvent: vi.fn(),
}));

vi.mock("@/app/utils/requireCurrentUserId", () => ({
  requireCurrentUserId: mocks.requireCurrentUserId,
}));

vi.mock(
  "@/app/features/messaging/utils/requireConversationParticipant",
  () => ({
    requireConversationParticipant: mocks.requireConversationParticipant,
  }),
);

vi.mock("@/app/lib/prisma", () => ({
  prisma: {
    $transaction: mocks.transaction,
    message: {
      findUnique: mocks.findMessage,
    },
    block: {
      findFirst: mocks.findBlock,
    },
  },
}));

vi.mock("@/app/lib/rate-limit", () => ({
  enforceRateLimit: mocks.enforceRateLimit,
  rateLimits: {
    sendMessage: { limit: 60, windowMs: 60_000 },
  },
}));

vi.mock("@/app/features/realtime/services/realtime-events.service", () => ({
  createRealtimeEvent: mocks.createRealtimeEvent,
}));

import { sendMessage } from "@/app/features/messaging/services/sendMessage.service";
import { ForbiddenError } from "@/app/lib/errors/ForbiddenError";
import { ValidationError } from "@/app/lib/errors/ValidationError";

describe("sendMessage service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireCurrentUserId.mockResolvedValue("user-1");
    mocks.requireConversationParticipant.mockResolvedValue({
      id: "conversation-1",
      participants: [{ user: { id: "user-1" } }, { user: { id: "user-2" } }],
    });
    mocks.findMessage.mockResolvedValue(null);
    mocks.findBlock.mockResolvedValue(null);
  });

  it("trims content and updates message, conversation, and unread state in one transaction", async () => {
    const message = {
      id: "message-1",
      clientId: "client-message-1",
      senderId: "user-1",
      conversationId: "conversation-1",
      content: "Hello there",
      createdAt: new Date("2026-07-29T08:00:00.000Z"),
      updatedAt: new Date("2026-07-29T08:00:00.000Z"),
      sender: {
        id: "user-1",
        username: "mohamed",
        displayName: "Mohamed",
        bio: null,
        avatarUrl: null,
      },
    };
    const tx = {
      message: {
        create: vi.fn().mockResolvedValue(message),
      },
      conversation: {
        update: vi.fn().mockResolvedValue({}),
      },
      participation: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        update: vi.fn().mockResolvedValue({}),
      },
    };

    mocks.transaction.mockImplementation(
      async (operation: (client: typeof tx) => unknown) => operation(tx),
    );

    const result = await sendMessage({
      conversationId: "conversation-1",
      clientId: "client-message-1",
      content: "  Hello there  ",
    });

    expect(mocks.requireConversationParticipant).toHaveBeenCalledWith(
      "conversation-1",
      "user-1",
    );
    expect(tx.message.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          senderId: "user-1",
          conversationId: "conversation-1",
          clientId: "client-message-1",
          content: "Hello there",
        },
      }),
    );
    expect(tx.conversation.update).toHaveBeenCalledWith({
      where: { id: "conversation-1" },
      data: {
        lastMessageAt: message.createdAt,
        lastMessageId: "message-1",
      },
    });
    expect(tx.participation.updateMany).toHaveBeenCalledWith({
      where: {
        conversationId: "conversation-1",
        userId: { not: "user-1" },
      },
      data: {
        unreadCount: { increment: 1 },
      },
    });
    expect(tx.participation.update).toHaveBeenCalledWith({
      where: {
        userId_conversationId: {
          userId: "user-1",
          conversationId: "conversation-1",
        },
      },
      data: {
        lastReadMessageId: "message-1",
        lastReadAt: message.createdAt,
        unreadCount: 0,
      },
    });
    expect(mocks.createRealtimeEvent).toHaveBeenCalledTimes(2);
    expect(mocks.createRealtimeEvent).toHaveBeenCalledWith(
      tx,
      expect.objectContaining({
        type: "message.created",
        conversationId: "conversation-1",
        recipientIds: ["user-1", "user-2"],
      }),
    );
    expect(result.data.message).toEqual(message);
  });

  it("rejects content that becomes empty after trimming", async () => {
    const error = await sendMessage({
      conversationId: "conversation-1",
      clientId: "client-message-1",
      content: "   ",
    }).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ValidationError);
    expect((error as ValidationError).errors).toEqual({
      content: "Content is required",
    });
    expect(mocks.requireConversationParticipant).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("rejects content longer than 1,000 characters", async () => {
    const error = await sendMessage({
      conversationId: "conversation-1",
      clientId: "client-message-1",
      content: "a".repeat(1001),
    }).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ValidationError);
    expect((error as ValidationError).errors).toEqual({
      content: "Content must be less than 1000 characters",
    });
    expect(mocks.requireConversationParticipant).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("returns an existing message when a client ID is retried", async () => {
    const existingMessage = {
      id: "message-1",
      clientId: "client-message-1",
      senderId: "user-1",
      conversationId: "conversation-1",
      content: "Hello there",
      createdAt: new Date("2026-07-29T08:00:00.000Z"),
      updatedAt: new Date("2026-07-29T08:00:00.000Z"),
      sender: {
        id: "user-1",
        username: "mohamed",
        displayName: "Mohamed",
        bio: null,
        avatarUrl: null,
      },
    };
    mocks.findMessage.mockResolvedValue(existingMessage);

    const result = await sendMessage({
      conversationId: "conversation-1",
      clientId: "client-message-1",
      content: "Hello there",
    });

    expect(result.data.message).toEqual(existingMessage);
    expect(mocks.findBlock).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("rejects sends when either participant has blocked the other", async () => {
    mocks.findBlock.mockResolvedValue({ blockerId: "user-2" });

    const error = await sendMessage({
      conversationId: "conversation-1",
      clientId: "client-message-1",
      content: "Hello there",
    }).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ForbiddenError);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
});
