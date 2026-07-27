import { requireCurrentUserId } from "@/app/utils/requireCurrentUserId";
import { GetConversationsResponse } from "../types/conversation.types";
import { UnauthorizedError } from "@/app/lib/errors/UnauthorizedError";
import { prisma } from "@/app/lib/prisma";
import { NotFoundError } from "@/app/lib/errors/NotFoundError";

export async function getConversations(): Promise<GetConversationsResponse> {
  const currentUserId = await requireCurrentUserId();

  if (!currentUserId) {
    throw new UnauthorizedError("Authentication required.");
  }

  const participations = await prisma.participation.findMany({
    where: {
      userId: currentUserId,
    },
    include: {
      conversation: {
        include: {
          lastMessage: true,
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  displayName: true,
                  username: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      conversation: {
        lastMessageAt: {
          sort: "desc",
          nulls: "last",
        },
      },
    },
  });

  const conversationList = participations.map(
    ({ conversation, unreadCount }) => {
      const baseConversation = {
        conversationId: conversation.id,
        lastMessage: conversation.lastMessage?.content ?? null,
        lastMessageAt: conversation.lastMessageAt,
        unreadCount,
      };

      if (conversation.type === "DIRECT") {
        const otherUser = conversation.participants.find(
          (participant) => participant.user.id !== currentUserId,
        );

        if (!otherUser) {
          throw new NotFoundError(
            "Other user not found in direct conversation.",
          );
        }

        return {
          ...baseConversation,
          title: otherUser.user.displayName,
          avatarUrl: otherUser.user.avatarUrl,
        };
      }

      return {
        ...baseConversation,

        title: conversation.title!,
        avatarUrl: null,
      };
    },
  );

  return {
    success: true,
    data: {
      conversations: conversationList,
    },
  };
}
