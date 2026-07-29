import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  upsert: vi.fn(),
  deleteMany: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/app/lib/prisma", () => ({
  prisma: {
    rateLimitBucket: {
      upsert: mocks.upsert,
      deleteMany: mocks.deleteMany,
    },
  },
}));

import { TooManyRequestsError } from "@/app/lib/errors/TooManyRequestsError";
import { enforceRateLimit } from "@/app/lib/rate-limit";

describe("database-backed rate limiter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.upsert.mockResolvedValue({ count: 1 });
    mocks.deleteMany.mockResolvedValue({ count: 0 });
  });

  it("uses a hashed identifier and cleans expired buckets", async () => {
    await enforceRateLimit({
      scope: "test",
      identifier: "private@example.com",
      limit: 2,
      windowMs: 60_000,
    });

    const call = mocks.upsert.mock.calls[0][0];
    expect(call.where.key).toMatch(/^test:[a-f0-9]{32}:\d+$/);
    expect(call.where.key).not.toContain("private@example.com");
    expect(mocks.deleteMany).toHaveBeenCalledOnce();
  });

  it("rejects requests over the configured limit", async () => {
    mocks.upsert.mockResolvedValue({ count: 3 });

    const error = await enforceRateLimit({
      scope: "test",
      identifier: "user-1",
      limit: 2,
      windowMs: 60_000,
    }).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(TooManyRequestsError);
    expect((error as TooManyRequestsError).retryAfterSeconds).toBeGreaterThan(
      0,
    );
    expect(mocks.deleteMany).not.toHaveBeenCalled();
  });
});
