import { requireCurrentUserId } from "@/app/utils/requireCurrentUserId";
import {
  GetConversationRequest,
  GetConversationResponse,
} from "../types/conversation.types";
import { UnauthorizedError } from "@/app/lib/errors/UnauthorizedError";
import { NotFoundError } from "@/app/lib/errors/NotFoundError";
import { requireConversationParticipant } from "../utils/requireConversationParticipant";

export async function getConversation(
  req: GetConversationRequest,
): Promise<GetConversationResponse> {
  const currUserId = await requireCurrentUserId();

  if (!currUserId) {
    throw new UnauthorizedError("Authentication required.");
  }

  const conversation = await requireConversationParticipant(
    req.conversationId,
    currUserId,
  );

  const otherParticipants = conversation.participants
    .filter((p) => p.user.id !== currUserId)
    .map((p) => p.user);

  const otherParticipant = otherParticipants[0];

  if (conversation.type === "DIRECT" && !otherParticipant) {
    throw new NotFoundError("Conversation is invalid.");
  }

  return {
    success: true,
    data: {
      conversationId: conversation.id,
      type: conversation.type,
      title: otherParticipant?.displayName ?? otherParticipant?.username ?? "",
      avatarUrl: otherParticipant?.avatarUrl ?? null,
      participants: otherParticipants,
    },
  };
}
