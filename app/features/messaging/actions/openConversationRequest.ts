import type {
  OpenConversationError,
  OpenConversationResponse,
} from "../types/conversation.types";

export async function openConversationRequest(targetUserId: string) {
  const res = await fetch("/api/conversations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      targetUserId,
    }),
  });

  return res.json() as Promise<
    OpenConversationResponse | OpenConversationError
  >;
}
