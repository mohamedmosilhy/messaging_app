import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireCurrentUserId: vi.fn(),
  enforceRateLimit: vi.fn(),
  findUser: vi.fn(),
  findBlocks: vi.fn(),
  findBlock: vi.fn(),
  upsertBlock: vi.fn(),
  deleteBlocks: vi.fn(),
}));

vi.mock("@/app/utils/requireCurrentUserId", () => ({
  requireCurrentUserId: mocks.requireCurrentUserId,
}));

vi.mock("@/app/lib/rate-limit", () => ({
  enforceRateLimit: mocks.enforceRateLimit,
  rateLimits: {
    blockingMutation: { limit: 30, windowMs: 60_000 },
  },
}));

vi.mock("@/app/lib/prisma", () => ({
  prisma: {
    user: { findUnique: mocks.findUser },
    block: {
      findMany: mocks.findBlocks,
      findUnique: mocks.findBlock,
      upsert: mocks.upsertBlock,
      deleteMany: mocks.deleteBlocks,
    },
  },
}));

import {
  blockUser,
  getBlockedUsers,
  getBlockStatus,
  unblockUser,
} from "@/app/features/blocking/services/blocking.service";
import { ValidationError } from "@/app/lib/errors/ValidationError";

describe("blocking services", () => {
  beforeEach(() => {
    mocks.requireCurrentUserId.mockResolvedValue("user-1");
    mocks.findUser.mockResolvedValue({ id: "user-2" });
    mocks.findBlocks.mockResolvedValue([]);
    mocks.findBlock.mockResolvedValue(null);
    mocks.upsertBlock.mockResolvedValue({});
    mocks.deleteBlocks.mockResolvedValue({ count: 1 });
  });

  it("returns blocked public profiles ordered by the persistence query", async () => {
    mocks.findBlocks.mockResolvedValue([
      {
        createdAt: new Date("2026-08-07T10:00:00.000Z"),
        blocked: {
          id: "user-2",
          username: "layla",
          displayName: "Layla",
          bio: null,
          avatarUrl: null,
        },
      },
    ]);

    const result = await getBlockedUsers();

    expect(mocks.findBlocks).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { blockerId: "user-1" },
        orderBy: { createdAt: "desc" },
      }),
    );
    expect(result.data.users[0]).toEqual(
      expect.objectContaining({
        id: "user-2",
        blockedAt: "2026-08-07T10:00:00.000Z",
      }),
    );
  });

  it("reports the caller-owned direction without revealing the reverse direction", async () => {
    mocks.findBlocks.mockResolvedValue([{ blockerId: "user-2" }]);

    const result = await getBlockStatus("user-2");

    expect(result.data).toEqual({
      targetUserId: "user-2",
      isBlockedByCurrentUser: false,
      canInteract: false,
    });
  });

  it("creates a block idempotently and returns interaction state", async () => {
    const result = await blockUser("user-2");

    expect(mocks.enforceRateLimit).toHaveBeenCalledWith({
      scope: "blocking-mutation",
      identifier: "user-1",
      limit: 30,
      windowMs: 60_000,
    });
    expect(mocks.upsertBlock).toHaveBeenCalledWith({
      where: {
        blockerId_blockedId: {
          blockerId: "user-1",
          blockedId: "user-2",
        },
      },
      create: { blockerId: "user-1", blockedId: "user-2" },
      update: {},
    });
    expect(result.data).toEqual({
      targetUserId: "user-2",
      isBlockedByCurrentUser: true,
      canInteract: false,
    });
  });

  it("rejects blocking the current account", async () => {
    const error = await blockUser("user-1").catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ValidationError);
    expect(mocks.upsertBlock).not.toHaveBeenCalled();
  });

  it("unblocks idempotently and restores interaction when no reverse block exists", async () => {
    const result = await unblockUser("user-2");

    expect(mocks.deleteBlocks).toHaveBeenCalledWith({
      where: { blockerId: "user-1", blockedId: "user-2" },
    });
    expect(result.data.canInteract).toBe(true);
    expect(result.data.isBlockedByCurrentUser).toBe(false);
  });

  it("keeps interaction unavailable after unblocking when a reverse block exists", async () => {
    mocks.findBlock.mockResolvedValue({ blockerId: "user-2" });

    const result = await unblockUser("user-2");

    expect(result.data).toEqual({
      targetUserId: "user-2",
      isBlockedByCurrentUser: false,
      canInteract: false,
    });
  });
});
