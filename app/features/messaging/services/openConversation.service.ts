import { requireCurrentUserId } from "@/app/utils/requireCurrentUserId";
import {
  openConversationRequest,
  openConversationResponse,
} from "../types/conversation.types";
import { ValidationError } from "@/app/lib/errors/ValidationError";
import { prisma } from "@/app/lib/prisma";
import { NotFoundError } from "@/app/lib/errors/NotFoundError";
import { ForbiddenError } from "@/app/lib/errors/ForbiddenError";
import { Prisma } from "@/generated/prisma/client";

export async function openConversation(
  req: openConversationRequest,
): Promise<openConversationResponse> {
  // validations
  const currUserId = await requireCurrentUserId();

  if (currUserId === req.targetUserId) {
    throw new ValidationError({
      general: "You cannot open a conversation with yourself.",
    });
  }

  const targetUser = await prisma.user.findUnique({
    where: {
      id: req.targetUserId,
    },
    select: { id: true },
  });

  if (!targetUser) {
    throw new NotFoundError("User not found.");
  }

  const block = await prisma.block.findFirst({
    where: {
      OR: [
        {
          blockedId: currUserId,
          blockerId: req.targetUserId,
        },
        { blockedId: req.targetUserId, blockerId: currUserId },
      ],
    },
  });

  if (block) {
    throw new ForbiddenError("You cannot start a conversation with this user.");
  }
  // participantKey

  const participantKey = [req.targetUserId, currUserId].sort().join(":");
  // existing conversation

  const existingConversation = await prisma.conversation.findUnique({
    where: {
      participantKey,
    },
    select: {
      id: true,
    },
  });

  if (existingConversation) {
    return {
      success: true,
      data: {
        conversationId: existingConversation.id,
      },
    };
  }

  // create conversation

  try {
    const conversation = await prisma.$transaction(async (tx) => {
      const conversation = await tx.conversation.create({
        data: {
          type: "DIRECT",
          participantKey,
        },
      });

      await tx.participation.createMany({
        data: [
          {
            userId: currUserId,
            conversationId: conversation.id,
          },
          { userId: req.targetUserId, conversationId: conversation.id },
        ],
      });

      return conversation;
    });

    return {
      success: true,
      data: {
        conversationId: conversation.id,
      },
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const conversation = await prisma.conversation.findUnique({
        where: {
          participantKey,
        },
        select: {
          id: true,
        },
      });

      if (conversation) {
        return {
          success: true,
          data: {
            conversationId: conversation.id,
          },
        };
      }
    }
    throw error;
  }
}
