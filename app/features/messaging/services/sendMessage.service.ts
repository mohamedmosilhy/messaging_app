import { Prisma } from "@/generated/prisma/client";
import { ForbiddenError } from "@/app/lib/errors/ForbiddenError";
import { requireCurrentUserId } from "@/app/utils/requireCurrentUserId";
import {
  messageResponseSelect,
  SendMessageRequest,
  SendMessageResponse,
} from "../types/messages.types";
import { UnauthorizedError } from "@/app/lib/errors/UnauthorizedError";
import { ValidationError } from "@/app/lib/errors/ValidationError";
import { requireConversationParticipant } from "../utils/requireConversationParticipant";
import { prisma } from "@/app/lib/prisma";
import { enforceRateLimit, rateLimits } from "@/app/lib/rate-limit";
import { createRealtimeEvent } from "@/app/features/realtime/services/realtime-events.service";
import { toRealtimeMessage } from "@/app/features/realtime/types/realtime.types";

export async function sendMessage(
  req: SendMessageRequest,
): Promise<SendMessageResponse> {
  const currUserId = await requireCurrentUserId();

  if (!currUserId) {
    throw new UnauthorizedError("Authentication required");
  }

  await enforceRateLimit({
    scope: "send-message",
    identifier: currUserId,
    ...rateLimits.sendMessage,
  });

  if (!req.clientId || req.clientId.length > 64) {
    throw new ValidationError({
      clientId: "A valid client message ID is required",
    });
  }

  const content = req.content.trim();

  if (!content) {
    throw new ValidationError({ content: "Content is required" });
  }

  if (content.length > 1000) {
    throw new ValidationError({
      content: "Content must be less than 1000 characters",
    });
  }
  const conversation = await requireConversationParticipant(
    req.conversationId,
    currUserId,
  );

  const existingMessage = await prisma.message.findUnique({
    where: {
      senderId_clientId: {
        senderId: currUserId,
        clientId: req.clientId,
      },
    },
    select: messageResponseSelect,
  });

  if (existingMessage) {
    if (existingMessage.conversationId !== conversation.id) {
      throw new ValidationError({
        clientId:
          "This client message ID was already used in another conversation",
      });
    }

    return {
      success: true,
      data: { message: existingMessage },
    };
  }

  const otherParticipantIds = conversation.participants
    .map((participant) => participant.user.id)
    .filter((participantId) => participantId !== currUserId);

  const blockingRelationship = otherParticipantIds.length
    ? await prisma.block.findFirst({
        where: {
          OR: [
            {
              blockerId: currUserId,
              blockedId: { in: otherParticipantIds },
            },
            {
              blockerId: { in: otherParticipantIds },
              blockedId: currUserId,
            },
          ],
        },
        select: { blockerId: true },
      })
    : null;

  if (blockingRelationship) {
    throw new ForbiddenError("You cannot send a message in this conversation");
  }

  try {
    const message = await prisma.$transaction(async (tx) => {
      const createdMessage = await tx.message.create({
        data: {
          senderId: currUserId,
          clientId: req.clientId,
          content,
          conversationId: conversation.id,
        },
        select: messageResponseSelect,
      });

      await tx.conversation.update({
        where: {
          id: conversation.id,
        },
        data: {
          lastMessageAt: createdMessage.createdAt,
          lastMessageId: createdMessage.id,
        },
      });

      await tx.participation.updateMany({
        where: {
          conversationId: conversation.id,
          userId: {
            not: currUserId,
          },
        },
        data: {
          unreadCount: {
            increment: 1,
          },
        },
      });

      await tx.participation.update({
        where: {
          userId_conversationId: {
            userId: currUserId,
            conversationId: conversation.id,
          },
        },
        data: {
          lastReadMessageId: createdMessage.id,
          lastReadAt: createdMessage.createdAt,
          unreadCount: 0,
        },
      });

      const recipientIds = conversation.participants.map(({ user }) => user.id);

      await createRealtimeEvent(tx, {
        type: "message.created",
        conversationId: conversation.id,
        recipientIds,
        data: {
          message: toRealtimeMessage(createdMessage),
          clientMessageId: createdMessage.clientId,
        },
      });

      await createRealtimeEvent(tx, {
        type: "conversation.updated",
        conversationId: conversation.id,
        recipientIds,
        data: {
          conversationId: conversation.id,
          lastMessageId: createdMessage.id,
          lastMessage: createdMessage.content,
          lastMessageAt: createdMessage.createdAt.toISOString(),
        },
      });

      return createdMessage;
    });

    return {
      success: true,
      data: {
        message,
      },
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const concurrentlyCreatedMessage = await prisma.message.findUnique({
        where: {
          senderId_clientId: {
            senderId: currUserId,
            clientId: req.clientId,
          },
        },
        select: messageResponseSelect,
      });

      if (concurrentlyCreatedMessage?.conversationId === conversation.id) {
        return {
          success: true,
          data: {
            message: concurrentlyCreatedMessage,
          },
        };
      }
    }

    throw error;
  }
}
