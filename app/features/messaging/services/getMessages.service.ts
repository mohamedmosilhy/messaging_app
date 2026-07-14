import { requireCurrentUserId } from "@/app/utils/requireCurrentUserId";
import {
  GetMessagesRequest,
  GetMessagesResponse,
  messageResponseSelect,
} from "../types/messages.types";
import { UnauthorizedError } from "@/app/lib/errors/UnauthorizedError";
import { requireConversationParticipant } from "../utils/requireConversationParticipant";
import { prisma } from "@/app/lib/prisma";

export async function getMessages(
  req: GetMessagesRequest,
): Promise<GetMessagesResponse> {
  const currUserId = await requireCurrentUserId();

  if (!currUserId) {
    throw new UnauthorizedError("Authentication required.");
  }

  // Check if the conversation exists and if the current user is a participant
  const conversation = await requireConversationParticipant(
    req.conversationId,
    currUserId,
  );

  const limit = Math.max(1, Math.min(req.limit ?? 20, 50));

  const messages = await prisma.message.findMany({
    where: {
      conversationId: conversation.id,

      ...(req.cursor && {
        OR: [
          {
            createdAt: {
              lt: new Date(req.cursor.createdAt),
            },
          },
          {
            createdAt: new Date(req.cursor.createdAt),
            id: {
              lt: req.cursor.id,
            },
          },
        ],
      }),
    },
    orderBy: [
      {
        createdAt: "desc",
      },
      {
        id: "desc",
      },
    ],

    select: messageResponseSelect,
    take: limit + 1,
  });

  const hasNextPage = messages.length > limit;

  if (hasNextPage) {
    messages.pop();
  }

  const nextCursor = hasNextPage
    ? {
        id: messages[messages.length - 1].id,
        createdAt: messages[messages.length - 1].createdAt.toISOString(),
      }
    : null;

  messages.reverse();

  return {
    success: true,
    data: {
      messages,
      nextCursor: nextCursor,
    },
  };
}
