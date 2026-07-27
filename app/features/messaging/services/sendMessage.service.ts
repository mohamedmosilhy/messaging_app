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
  // validation
  const content = req.content.trim();

  if (!content) {
    throw new ValidationError({ content: "Content is required" });
  }

  if (content.length > 1000) {
    throw new ValidationError({
      content: "Content must be less than 1000 characters",
    });
  }
  // authorization

  const conversation = await requireConversationParticipant(
    req.conversationId,
    currUserId,
  );

  // transaction

  const message = await prisma.$transaction(async (tx) => {
    const createdMessage = await tx.message.create({
      data: {
        senderId: currUserId,
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

  // return

  return {
    success: true,
    data: {
      message,
    },
  };
}
