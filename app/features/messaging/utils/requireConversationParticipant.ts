import { prisma } from "@/app/lib/prisma";
import { publicProfileSelect } from "../../users/types/user-profile.types";
import { NotFoundError } from "@/app/lib/errors/NotFoundError";

export async function requireConversationParticipant(
  conversationId: string,
  currUserId: string,
) {
  // Check if the conversation exists and if the current user is a participant
  const conversation = await prisma.conversation.findUnique({
    where: {
      id: conversationId,
    },
    include: {
      participants: {
        select: {
          user: {
            select: publicProfileSelect,
          },
        },
      },
    },
  });

  if (!conversation) {
    throw new NotFoundError();
  }

  const isParticipant = conversation.participants.some(
    (p) => p.user.id === currUserId,
  );

  if (!isParticipant) {
    throw new NotFoundError();
  }

  return conversation;
}
