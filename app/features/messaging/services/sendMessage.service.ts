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

export async function sendMessage(
  req: SendMessageRequest,
): Promise<SendMessageResponse> {
  const currUserId = await requireCurrentUserId();

  if (!currUserId) {
    throw new UnauthorizedError("Authentication required");
  }

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
