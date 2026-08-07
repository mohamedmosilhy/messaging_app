import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireCurrentUserId: vi.fn(),
  requireConversationParticipant: vi.fn(),
  enforceRateLimit: vi.fn(),
  transaction: vi.fn(),
  createRealtimeEvent: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/app/utils/requireCurrentUserId", () => ({
  requireCurrentUserId: mocks.requireCurrentUserId,
}));

vi.mock(
  "@/app/features/messaging/utils/requireConversationParticipant",
  () => ({
    requireConversationParticipant: mocks.requireConversationParticipant,
  }),
);

vi.mock("@/app/lib/rate-limit", () => ({
  enforceRateLimit: mocks.enforceRateLimit,
  rateLimits: {
    conversationRead: { limit: 120, windowMs: 60_000 },
  },
}));

vi.mock("@/app/lib/prisma", () => ({
  prisma: { $transaction: mocks.transaction },
}));

vi.mock("@/app/features/realtime/services/realtime-events.service", () => ({
  createRealtimeEvent: mocks.createRealtimeEvent,
}));

import { markConversationRead } from "@/app/features/realtime/services/markConversationRead.service";

describe("markConversationRead service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireCurrentUserId.mockResolvedValue("user-1");
    mocks.requireConversationParticipant.mockResolvedValue({
      id: "conversation-1",
      participants: [{ user: { id: "user-1" } }, { user: { id: "user-2" } }],
    });
  });

  it("advances the marker, derives unread count, and publishes a read event", async () => {
    const targetMessage = {
      id: "message-2",
      clientId: "client-2",
      senderId: "user-2",
      conversationId: "conversation-1",
      content: "Latest visible",
      createdAt: new Date("2026-08-07T18:00:00.000Z"),
      updatedAt: new Date("2026-08-07T18:00:00.000Z"),
      sender: {
        id: "user-2",
        username: "layla",
        displayName: "Layla",
        bio: null,
        avatarUrl: null,
      },
    };
    const tx = {
      message: {
        findFirst: vi.fn().mockResolvedValue(targetMessage),
        count: vi.fn().mockResolvedValue(1),
      },
      participation: {
        findUnique: vi.fn().mockResolvedValue({
          unreadCount: 2,
          lastReadAt: null,
          lastReadMessage: null,
        }),
        update: vi.fn().mockResolvedValue({}),
      },
    };
    mocks.transaction.mockImplementation(
      async (operation: (client: typeof tx) => unknown) => operation(tx),
    );

    const response = await markConversationRead({
      conversationId: "conversation-1",
      messageId: "message-2",
    });

    expect(tx.message.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "message-2", conversationId: "conversation-1" },
      }),
    );
    expect(tx.participation.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          lastReadMessageId: "message-2",
          unreadCount: 1,
        }),
      }),
    );
    expect(mocks.createRealtimeEvent).toHaveBeenCalledWith(
      tx,
      expect.objectContaining({
        type: "conversation.read",
        recipientIds: ["user-1", "user-2"],
      }),
    );
    expect(response.data.unreadCount).toBe(1);
  });

  it("does not move a read marker backwards", async () => {
    const tx = {
      message: {
        findFirst: vi.fn().mockResolvedValue({
          id: "message-1",
          createdAt: new Date("2026-08-07T17:00:00.000Z"),
        }),
        count: vi.fn(),
      },
      participation: {
        findUnique: vi.fn().mockResolvedValue({
          unreadCount: 0,
          lastReadAt: new Date("2026-08-07T18:00:00.000Z"),
          lastReadMessage: {
            id: "message-2",
            createdAt: new Date("2026-08-07T18:00:00.000Z"),
          },
        }),
        update: vi.fn(),
      },
    };
    mocks.transaction.mockImplementation(
      async (operation: (client: typeof tx) => unknown) => operation(tx),
    );

    const response = await markConversationRead({
      conversationId: "conversation-1",
      messageId: "message-1",
    });

    expect(response.data.lastReadMessageId).toBe("message-2");
    expect(tx.message.count).not.toHaveBeenCalled();
    expect(tx.participation.update).not.toHaveBeenCalled();
    expect(mocks.createRealtimeEvent).not.toHaveBeenCalled();
  });
});
