import "server-only";

import { randomUUID } from "node:crypto";

import type { Prisma } from "@/generated/prisma/client";

import { prisma } from "@/app/lib/prisma";
import type {
  RealtimeEventDataMap,
  RealtimeEventEnvelope,
  RealtimeEventType,
} from "../types/realtime.types";

const EVENT_RETENTION_MS = 24 * 60 * 60 * 1000;
const MAX_EVENT_BATCH = 100;

export async function createRealtimeEvent<Type extends RealtimeEventType>(
  tx: Prisma.TransactionClient,
  input: {
    type: Type;
    conversationId: string;
    recipientIds: string[];
    data: RealtimeEventDataMap[Type];
  },
) {
  const eventId = randomUUID();

  await tx.realtimeEvent.create({
    data: {
      id: eventId,
      type: input.type,
      version: 1,
      conversationId: input.conversationId,
      payload: input.data as Prisma.InputJsonValue,
      expiresAt: new Date(Date.now() + EVENT_RETENTION_MS),
      deliveries: {
        create: [...new Set(input.recipientIds)].map((userId) => ({ userId })),
      },
    },
  });

  return eventId;
}

type EventCursor = {
  id: string;
  occurredAt: Date;
};

async function resolveCursor(userId: string, lastEventId?: string) {
  if (!lastEventId) return null;

  return prisma.realtimeEvent.findFirst({
    where: {
      id: lastEventId,
      deliveries: { some: { userId } },
      conversation: { participants: { some: { userId } } },
    },
    select: { id: true, occurredAt: true },
  });
}

export async function getRealtimeEventsForUser(input: {
  userId: string;
  lastEventId?: string;
  since?: Date;
}): Promise<RealtimeEventEnvelope[]> {
  const cursor = await resolveCursor(input.userId, input.lastEventId);
  const positionFilter = cursor
    ? {
        OR: [
          { occurredAt: { gt: cursor.occurredAt } },
          { occurredAt: cursor.occurredAt, id: { gt: cursor.id } },
        ],
      }
    : input.since
      ? { occurredAt: { gte: input.since } }
      : { occurredAt: { gte: new Date() } };

  const events = await prisma.realtimeEvent.findMany({
    where: {
      ...positionFilter,
      expiresAt: { gt: new Date() },
      deliveries: { some: { userId: input.userId } },
      conversation: { participants: { some: { userId: input.userId } } },
    },
    orderBy: [{ occurredAt: "asc" }, { id: "asc" }],
    take: MAX_EVENT_BATCH,
    select: {
      id: true,
      type: true,
      version: true,
      occurredAt: true,
      payload: true,
    },
  });

  return events.map(
    (event) =>
      ({
        eventId: event.id,
        type: event.type,
        version: event.version,
        occurredAt: event.occurredAt.toISOString(),
        data: event.payload,
      }) as RealtimeEventEnvelope,
  );
}

export async function deleteExpiredRealtimeEvents() {
  await prisma.realtimeEvent.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
}

export function getLastEventCursor(
  events: RealtimeEventEnvelope[],
): EventCursor | null {
  const event = events.at(-1);

  return event
    ? { id: event.eventId, occurredAt: new Date(event.occurredAt) }
    : null;
}
