import "server-only";

import { createHash } from "node:crypto";

import { TooManyRequestsError } from "@/app/lib/errors/TooManyRequestsError";
import { prisma } from "@/app/lib/prisma";

type RateLimitOptions = {
  scope: string;
  identifier: string;
  limit: number;
  windowMs: number;
};

export const rateLimits = {
  authentication: { limit: 10, windowMs: 15 * 60_000 },
  registration: { limit: 5, windowMs: 60 * 60_000 },
  search: { limit: 60, windowMs: 60_000 },
  openConversation: { limit: 30, windowMs: 60_000 },
  sendMessage: { limit: 60, windowMs: 60_000 },
  messageHistory: { limit: 120, windowMs: 60_000 },
  blockingMutation: { limit: 30, windowMs: 60_000 },
} as const;

function hashIdentifier(identifier: string) {
  return createHash("sha256").update(identifier).digest("hex").slice(0, 32);
}

export async function enforceRateLimit({
  scope,
  identifier,
  limit,
  windowMs,
}: RateLimitOptions) {
  const now = Date.now();
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const expiresAt = new Date(windowStart + windowMs);
  const key = `${scope}:${hashIdentifier(identifier)}:${windowStart}`;

  const bucket = await prisma.rateLimitBucket.upsert({
    where: { key },
    create: { key, expiresAt },
    update: { count: { increment: 1 } },
    select: { count: true },
  });

  if (bucket.count === 1) {
    await prisma.rateLimitBucket.deleteMany({
      where: {
        expiresAt: { lt: new Date(windowStart) },
      },
    });
  }

  if (bucket.count > limit) {
    throw new TooManyRequestsError(
      Math.max(1, Math.ceil((expiresAt.getTime() - now) / 1000)),
    );
  }
}
