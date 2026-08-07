import "server-only";

import { Prisma } from "@/generated/prisma/client";

import { messageResponseSelect } from "@/app/features/messaging/types/messages.types";
import { requireConversationParticipant } from "@/app/features/messaging/utils/requireConversationParticipant";
import { NotFoundError } from "@/app/lib/errors/NotFoundError";
import { prisma } from "@/app/lib/prisma";
import { enforceRateLimit, rateLimits } from "@/app/lib/rate-limit";
import { requireCurrentUserId } from "@/app/utils/requireCurrentUserId";
import type { MarkConversationReadResponse } from "../types/realtime.types";
import { createRealtimeEvent } from "./realtime-events.service";

function isAfter(
  candidate: { id: string; createdAt: Date },
  current: { id: string; createdAt: Date } | null,
) {
  if (!current) return true;

  const timeDifference =
    candidate.createdAt.getTime() - current.createdAt.getTime();
  return (
    timeDifference > 0 || (timeDifference === 0 && candidate.id > current.id)
  );
}

export async function markConversationRead(input: {
  conversationId: string;
  messageId: string;
}): Promise<MarkConversationReadResponse> {
  const currentUserId = await requireCurrentUserId();

  await enforceRateLimit({
    scope: "conversation-read",
    identifier: currentUserId,
    ...rateLimits.conversationRead,
  });

  const conversation = await requireConversationParticipant(
    input.conversationId,
    currentUserId,
  );
  const recipientIds = conversation.participants.map(({ user }) => user.id);

  const executeTransaction = (): Promise<MarkConversationReadResponse> =>
    prisma.$transaction(
      async (tx) => {
        const [targetMessage, participation] = await Promise.all([
          tx.message.findFirst({
            where: {
              id: input.messageId,
              conversationId: conversation.id,
            },
            select: messageResponseSelect,
          }),
          tx.participation.findUnique({
            where: {
              userId_conversationId: {
                userId: currentUserId,
                conversationId: conversation.id,
              },
            },
            select: {
              unreadCount: true,
              lastReadAt: true,
              lastReadMessage: {
                select: { id: true, createdAt: true },
              },
            },
          }),
        ]);

        if (!targetMessage || !participation) {
          throw new NotFoundError();
        }

        if (!isAfter(targetMessage, participation.lastReadMessage)) {
          return {
            success: true,
            data: {
              conversationId: conversation.id,
              userId: currentUserId,
              lastReadMessageId:
                participation.lastReadMessage?.id ?? targetMessage.id,
              readAt: (
                participation.lastReadAt ?? targetMessage.createdAt
              ).toISOString(),
              unreadCount: participation.unreadCount,
            },
          };
        }

        const unreadCount = await tx.message.count({
          where: {
            conversationId: conversation.id,
            senderId: { not: currentUserId },
            OR: [
              { createdAt: { gt: targetMessage.createdAt } },
              {
                createdAt: targetMessage.createdAt,
                id: { gt: targetMessage.id },
              },
            ],
          },
        });
        const readAt = new Date();

        await tx.participation.update({
          where: {
            userId_conversationId: {
              userId: currentUserId,
              conversationId: conversation.id,
            },
          },
          data: {
            lastReadMessageId: targetMessage.id,
            lastReadAt: readAt,
            unreadCount,
          },
        });

        await createRealtimeEvent(tx, {
          type: "conversation.read",
          conversationId: conversation.id,
          recipientIds,
          data: {
            conversationId: conversation.id,
            userId: currentUserId,
            lastReadMessageId: targetMessage.id,
            readAt: readAt.toISOString(),
          },
        });

        return {
          success: true,
          data: {
            conversationId: conversation.id,
            userId: currentUserId,
            lastReadMessageId: targetMessage.id,
            readAt: readAt.toISOString(),
            unreadCount,
          },
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await executeTransaction();
    } catch (error) {
      const canRetry =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2034" &&
        attempt < 2;

      if (!canRetry) throw error;
    }
  }

  throw new Error("Read-marker transaction retry exhausted.");
}
