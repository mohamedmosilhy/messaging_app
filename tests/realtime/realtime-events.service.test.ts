import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findFirst: vi.fn(),
  findMany: vi.fn(),
  deleteMany: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/app/lib/prisma", () => ({
  prisma: {
    realtimeEvent: {
      findFirst: mocks.findFirst,
      findMany: mocks.findMany,
      deleteMany: mocks.deleteMany,
    },
  },
}));

import { getRealtimeEventsForUser } from "@/app/features/realtime/services/realtime-events.service";

describe("real-time event delivery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findFirst.mockResolvedValue(null);
    mocks.findMany.mockResolvedValue([]);
  });

  it("requires both a user delivery and current conversation participation", async () => {
    await getRealtimeEventsForUser({
      userId: "user-1",
      since: new Date("2026-08-07T18:00:00.000Z"),
    });

    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deliveries: { some: { userId: "user-1" } },
          conversation: {
            participants: { some: { userId: "user-1" } },
          },
        }),
        orderBy: [{ occurredAt: "asc" }, { id: "asc" }],
      }),
    );
  });

  it("resumes strictly after the last delivered event", async () => {
    const occurredAt = new Date("2026-08-07T18:00:00.000Z");
    mocks.findFirst.mockResolvedValue({ id: "event-1", occurredAt });

    await getRealtimeEventsForUser({
      userId: "user-1",
      lastEventId: "event-1",
    });

    expect(mocks.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: "event-1",
          deliveries: { some: { userId: "user-1" } },
        }),
      }),
    );
    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { occurredAt: { gt: occurredAt } },
            { occurredAt, id: { gt: "event-1" } },
          ],
        }),
      }),
    );
  });
});
